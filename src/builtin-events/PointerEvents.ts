abstract class PointerEvent {
  x: number
  y: number
  target: EventTarget | null

  constructor(props: PointerEvent) {
    this.x = props.x
    this.y = props.y
    this.target = props.target
  }
}

export class PointerClickEvent extends PointerEvent {}
export class PointerMoveEvent extends PointerEvent {}
export class PointerDownEvent extends PointerEvent {}
export class PointerUpEvent extends PointerEvent {}
