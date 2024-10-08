import { EventBus, Events, Utils } from '..'
import { EventPlugin } from '../core/Plugin'

import { View } from '../core/View'
import { Vec2 } from '../math/Vec2'

type Direction = 'up' | 'down' | 'left' | 'right'

export class DragEvent {
  view: View
  previousX: number
  previousY: number
  x: number
  y: number
  pointerX: number
  pointerY: number
  isDragging: boolean
  target: EventTarget | null
  directions: Array<Direction> = []
  width: number
  height: number
  distance: number
  stopped: boolean
  hasMoved: boolean
  constructor(
    public props: {
      view: View
      previousX: number
      previousY: number
      x: number
      y: number
      pointerX: number
      pointerY: number
      width: number
      height: number
      distance: number
      isDragging: boolean
      stopped: boolean
      target: EventTarget | null
      directions: Array<Direction>
      hasMoved: boolean
    }
  ) {
    this.previousX = props.previousX
    this.previousY = props.previousY
    this.x = props.x
    this.y = props.y
    this.pointerX = props.pointerX
    this.pointerY = props.pointerY
    this.width = props.width
    this.height = props.height
    this.distance = props.distance
    this.view = props.view
    this.isDragging = props.isDragging
    this.stopped = props.stopped
    this.target = props.target
    this.directions = props.directions
    this.hasMoved = props.hasMoved
  }
}

export class DragEventPlugin extends EventPlugin {
  static pluginName = 'DragEventPlugin'

  private _pointerX: number = 0
  private _pointerY: number = 0
  private _initialPointer: Vec2 = new Vec2(0, 0)
  private _initialPointerPerView: Map<string, Vec2> = new Map()
  private _pointerDownPerView: Map<string, boolean> = new Map()
  private _viewPointerPositionLog: Map<string, Array<Vec2>> = new Map()
  private _stopTimer = 0

  setup() {
    document.addEventListener('selectstart', this.onSelect.bind(this))
  }

  onSelect(e: Event) {
    if (this._isDragging) {
      e.preventDefault()
    }
  }

  get _isDragging(): boolean {
    return Array.from(this._pointerDownPerView.values()).some(
      (value) => !!value
    )
  }

  subscribeToEvents(eventBus: EventBus): void {
    eventBus.subscribeToEvent(Events.PointerDownEvent, ({ x, y }) => {
      this._initialPointer = new Vec2(x, y)
      this.getViews().forEach((view) => {
        this._pointerDownPerView.set(view.id, view.intersects(x, y))
        const initialX = view.isLayoutTransitionEnabled
          ? view.position.initialX
          : view.position.x
        const initialY = view.isLayoutTransitionEnabled
          ? view.position.initialY
          : view.position.y
        const initialPointer = new Vec2(x - initialX, y - initialY)
        this._pointerX = x
        this._pointerY = y
        this._initialPointerPerView.set(view.id, initialPointer)
      })
    })

    eventBus.subscribeToEvent(Events.PointerUpEvent, () => {
      this.getViews().forEach((view) => {
        if (
          this._pointerDownPerView.get(view.id) &&
          this._initialPointerPerView.get(view.id)
        ) {
          this._pointerDownPerView.set(view.id, false)
          this._emitEvent(view, [])
        }
      })
    })

    eventBus.subscribeToEvent(Events.PointerMoveEvent, ({ x, y }) => {
      this._pointerX = x
      this._pointerY = y
      this.getViews().forEach((view) => {
        if (
          this._pointerDownPerView.get(view.id) &&
          this._initialPointerPerView.get(view.id)
        ) {
          if (!this._viewPointerPositionLog.has(view.id)) {
            this._viewPointerPositionLog.set(view.id, [])
          }
          const currentPointer = new Vec2(x, y)
          const logs = this._viewPointerPositionLog.get(view.id)
          if (logs) {
            logs.push(new Vec2(x, y))
          }
          const previousPointer =
            logs && logs.length >= 2
              ? logs[logs.length - 2]
              : currentPointer.clone()
          const directions = this._calculateDirections(
            previousPointer,
            currentPointer
          )
          this._emitEvent(view, directions)

          clearTimeout(this._stopTimer)
          this._stopTimer = setTimeout(() => {
            const isDragging = this._pointerDownPerView.get(view.id) === true
            if (isDragging) {
              this._emitEvent(view, directions, true)
            }
          }, 120)
        }
      })
    })
  }

  _emitEvent(
    view: View,
    directions: Array<Direction>,
    stopped: boolean = false
  ) {
    const logs = this._viewPointerPositionLog.get(view.id)
    const hasMoved = !(typeof logs === 'undefined' || logs.length <= 1)
    const previousPointer =
      logs && logs.length >= 2 ? logs[logs.length - 2] : null
    const x = this._pointerX - this._initialPointerPerView.get(view.id)!.x
    const y = this._pointerY - this._initialPointerPerView.get(view.id)!.y
    const pointerX = this._pointerX
    const pointerY = this._pointerY
    const previousX = previousPointer
      ? previousPointer.x - this._initialPointerPerView.get(view.id)!.x
      : x
    const previousY = previousPointer
      ? previousPointer.y - this._initialPointerPerView.get(view.id)!.y
      : y

    const height = this._pointerY - this._initialPointer.y
    const width = this._pointerX - this._initialPointer.x
    const distance = Utils.distanceBetweenTwoPoints(this._initialPointer, {
      x: this._pointerX,
      y: this._pointerY
    })

    const isDragging = this._pointerDownPerView.get(view.id) === true

    if (!isDragging) {
      this._viewPointerPositionLog.clear()
    }

    const eventData = {
      view,
      target: view.element,
      previousX,
      previousY,
      x,
      y,
      pointerX,
      pointerY,
      distance,
      width,
      height,
      isDragging,
      directions,
      stopped,
      hasMoved
    }
    this.emit(DragEvent, eventData)
  }

  private _calculateDirections(from: Vec2, to: Vec2): Array<Direction> {
    const directionUnitVectors: Record<Direction, Vec2> = {
      up: Vec2.sub(new Vec2(from.x, from.y - 1), from),
      down: Vec2.sub(new Vec2(from.x, from.y + 1), from),
      left: Vec2.sub(new Vec2(from.x - 1, from.y), from),
      right: Vec2.sub(new Vec2(from.x + 1, from.y), from)
    }

    const unitVector = Vec2.sub(to, from).unitVector
    const projections = [
      { direction: 'up', projection: unitVector.dot(directionUnitVectors.up) },
      {
        direction: 'down',
        projection: unitVector.dot(directionUnitVectors.down)
      },
      {
        direction: 'left',
        projection: unitVector.dot(directionUnitVectors.left)
      },
      {
        direction: 'right',
        projection: unitVector.dot(directionUnitVectors.right)
      }
    ]

    const alignedProjections = projections.filter(
      (projection) => projection.projection > 0
    )

    return alignedProjections.map(
      (projection) => projection.direction
    ) as Array<Direction>
  }
}
