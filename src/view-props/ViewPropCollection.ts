import { View } from '..'
import { NumberAnimatorFactory, Vec2AnimatorFactory } from '../animators'
import { Vec2 } from '../math'
import { PositionProp } from './PositionProp'
import { RotationProp } from './RotationProp'
import { ScaleProp } from './ScaleProp'
import { SizeProp } from './SizeProp'
import { IViewProp } from './ViewProp'

export class ViewPropCollection {
  private _props = new Map<string, IViewProp>()
  constructor(view: View) {
    this._props.set(
      'position',
      new PositionProp(new Vec2AnimatorFactory(), new Vec2(0, 0), view)
    )

    this._props.set(
      'scale',
      new ScaleProp(new Vec2AnimatorFactory(), new Vec2(1, 1), view)
    )

    this._props.set(
      'rotation',
      new RotationProp(new NumberAnimatorFactory(), 0, view)
    )

    this._props.set(
      'size',
      new SizeProp(
        new Vec2AnimatorFactory(),
        new Vec2(view.rect.size.width, view.rect.size.height),
        view
      )
    )
  }
  allProps(): Array<IViewProp> {
    return Array.from(this._props.values())
  }
  get position(): PositionProp {
    return this._props.get('position') as PositionProp
  }
  get scale(): ScaleProp {
    return this._props.get('scale') as ScaleProp
  }
  get rotation(): RotationProp {
    return this._props.get('rotation') as RotationProp
  }
  get size(): SizeProp {
    return this._props.get('size') as SizeProp
  }
}
