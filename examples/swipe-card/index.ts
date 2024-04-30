import './style.css'
import {
  DragEvent,
  DragEventPlugin,
  View,
  createApp,
  type PluginFactory
} from '../../src'

const SwipeCardPlugin: PluginFactory = (context) => {
  const DISMISS_DISTANCE = window.innerWidth / 2
  const MAX_DEGREES = 20
  const CARD_Y_OFFSET = 32
  const SCALE_OFFSET = 0.14
  const OPACITY_OFFSET = 0.4
  const MOVING_DOWN_FACTOR = 0.2
  const dragEvent = context.useEventPlugin(DragEventPlugin)

  let cards: View[]
  let currentCardIndex = 0

  context.setup(() => {
    cards = context.getViews('card')

    cards.forEach((card, i) => {
      dragEvent.addView(card)
      card.position.animator.set('tween', { duration: 200 })
      card.rotation.animator.set('tween', { duration: 200 })
      card.scale.animator.set('spring', {
        speed: 15
      })
      card.opacity.animator.set('tween', { duration: 200 })
      card.styles.zIndex = `${cards.length - i}`
    })
    dragEvent.on(DragEvent, onCardDrag)
    updateCards(false)
  })

  function onCardDrag(event: DragEvent) {
    const currentCard = cards[currentCardIndex]
    if (event.view !== currentCard) return
    const { width } = event
    if (event.isDragging && Math.abs(width) < DISMISS_DISTANCE) {
      updateNextCardsWhileDragging(width)
      currentCard.position.set(
        {
          x: event.x,
          y:
            currentCard.position.initialY + Math.abs(width) * MOVING_DOWN_FACTOR
        },
        false
      )
      currentCard.rotation.setDegrees(
        (width / DISMISS_DISTANCE) * MAX_DEGREES,
        false
      )
      return
    }

    // On release
    const vx = Math.abs(event.x - event.previousX)
    if (Math.abs(width) > DISMISS_DISTANCE || vx > 15) {
      showNextCard(width > 0 ? 'right' : 'left')
    } else {
      updateCards()
      currentCard.position.reset(true)
      currentCard.rotation.reset(true)
    }
  }

  function updateNextCardsWhileDragging(dragWidth: number) {
    const progress = Math.abs(dragWidth / DISMISS_DISTANCE)
    cards.slice(currentCardIndex + 1).forEach((card, index) => {
      const i = index + 1

      const initialScale = 1 - SCALE_OFFSET * i
      const targetScale = 1 - SCALE_OFFSET * index
      const scale = initialScale + (targetScale - initialScale) * progress
      card.scale.set({ x: scale, y: scale }, false)

      const initialY = card.position.initialY + i * CARD_Y_OFFSET
      const targetY = card.position.initialY + index * CARD_Y_OFFSET
      const y = initialY + (targetY - initialY) * progress
      card.position.set({ y }, false)

      const initialOpacity = 1 - i * OPACITY_OFFSET
      const targetOpacity = 1 - index * OPACITY_OFFSET
      const opacity =
        initialOpacity + (targetOpacity - initialOpacity) * progress
      card.opacity.set(opacity, false)
    })
  }

  function updateCards(animate = true) {
    cards.slice(currentCardIndex).forEach((card, i) => {
      const scale = 1 - SCALE_OFFSET * i
      card.scale.set({ x: scale, y: scale }, animate)
      card.position.set(
        { y: card.position.initialY + i * CARD_Y_OFFSET },
        animate
      )
      card.opacity.set(1 - i * OPACITY_OFFSET, animate)
    })
  }

  function showNextCard(direction: 'left' | 'right') {
    if (currentCardIndex >= cards.length) return
    const currentCard = cards[currentCardIndex]
    const sign = direction === 'left' ? -1 : 1
    const targetX = currentCard.position.initialX + window.innerWidth * sign
    currentCard.position.set({
      x: targetX,
      y: currentCard.position.initialY + window.innerWidth * MOVING_DOWN_FACTOR
    })
    currentCard.rotation.setDegrees(MAX_DEGREES * sign)
    currentCard.styles.pointerEvents = 'none'
    currentCardIndex++
    updateCards()
  }
}

SwipeCardPlugin.pluginName = 'SwipeCardPlugin'

const app = createApp()
app.addPlugin(SwipeCardPlugin)
app.run()
