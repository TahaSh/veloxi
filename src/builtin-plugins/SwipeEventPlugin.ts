import { type EventBus, EventPlugin, Events } from '..'
import { View } from '../core/View'
import { Vec2 } from '../math/Vec2'

export type Direction = 'up' | 'down' | 'left' | 'right'

export class SwipeEvent {
  view: View
  direction: Direction
  constructor(public props: { view: View; direction: Direction }) {
    this.view = props.view
    this.direction = props.direction
  }
}

export class SwipeEventPlugin extends EventPlugin {
  static pluginName = 'SwipeEventPlugin'

  private _viewIsPointerDownMap: Map<string, boolean> = new Map()
  private _viewPointerPositionLog: Map<string, Array<Vec2>> = new Map()
  private _targetPerView: Map<string, EventTarget | null> = new Map()

  subscribeToEvents(eventBus: EventBus): void {
    eventBus.subscribeToEvent(Events.PointerDownEvent, ({ x, y, target }) => {
      this.getViews().forEach((view) => {
        this._targetPerView.set(view.id, target)
        if (view.intersects(x, y)) {
          this._viewIsPointerDownMap.set(view.id, true)
        }
      })
    })

    eventBus.subscribeToEvent(Events.PointerMoveEvent, ({ x, y }) => {
      this.getViews().forEach((view) => {
        if (!this._viewIsPointerDownMap.get(view.id)) {
          return
        }

        if (!this._viewPointerPositionLog.has(view.id)) {
          this._viewPointerPositionLog.set(view.id, [])
        }
        const logs = this._viewPointerPositionLog.get(view.id)
        logs!.push(new Vec2(x, y))
      })
    })

    eventBus.subscribeToEvent(Events.PointerUpEvent, ({ x, y }) => {
      this.getViews().forEach((view) => {
        if (
          !this._viewIsPointerDownMap.get(view.id) ||
          !this._viewPointerPositionLog.has(view.id)
        ) {
          return
        }

        const currentPointer = new Vec2(x, y)
        const logs = this._viewPointerPositionLog.get(view.id)!
        const previousPointer = logs[logs.length - 2] || currentPointer.clone()

        const target = this._targetPerView.get(view.id)

        const swipeData = calculateSwipeData(previousPointer, currentPointer)

        if (
          target &&
          view.hasElement(target as HTMLElement) &&
          swipeData.hasSwiped
        ) {
          this.emit(SwipeEvent, {
            view,
            direction: swipeData.direction
          })
        }

        this._viewPointerPositionLog.set(view.id, [])
        this._viewIsPointerDownMap.set(view.id, false)
      })

      function calculateSwipeData(
        from: Vec2,
        to: Vec2
      ): {
        hasSwiped: boolean
        direction: Direction
      } {
        const directionUnitVectors: Record<Direction, Vec2> = {
          up: Vec2.sub(new Vec2(from.x, from.y - 1), from),
          down: Vec2.sub(new Vec2(from.x, from.y + 1), from),
          left: Vec2.sub(new Vec2(from.x - 1, from.y), from),
          right: Vec2.sub(new Vec2(from.x + 1, from.y), from)
        }

        const unitVector = Vec2.sub(to, from).unitVector
        const possibleDirections: Array<Direction> = [
          'up',
          'down',
          'left',
          'right'
        ]
        const projections = [
          unitVector.dot(directionUnitVectors.up),
          unitVector.dot(directionUnitVectors.down),
          unitVector.dot(directionUnitVectors.left),
          unitVector.dot(directionUnitVectors.right)
        ]

        const maxProjection = Math.max(...projections)
        const resultIndex = projections.indexOf(maxProjection)
        const direction = possibleDirections[resultIndex]

        const originalDistance = Vec2.sub(to, from).magnitude

        const distanceInDirection =
          unitVector.dot(directionUnitVectors[direction]) * originalDistance

        return {
          hasSwiped: distanceInDirection > 30,
          direction: direction
        }
      }
    })
  }
}
