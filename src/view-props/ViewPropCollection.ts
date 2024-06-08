import {
  CSSNumbersAnimatorFactory,
  NumberAnimatorFactory,
  Vec2AnimatorFactory
} from '../animators'
import { CoreView } from '../core/View'
import { Vec2 } from '../math'
import { BorderRadiusProp } from './BorderRadiusProp'
import { OpacityProp } from './OpacityProp'
import { OriginProp } from './OriginProp'
import { PositionProp } from './PositionProp'
import { RotationProp } from './RotationProp'
import { ScaleProp } from './ScaleProp'
import { SizeProp } from './SizeProp'
import { IViewProp } from './ViewProp'

export type ViewPropName =
  | 'position'
  | 'scale'
  | 'rotation'
  | 'size'
  | 'origin'
  | 'opacity'
  | 'borderRadius'

export class ViewPropCollection {
  private _props = new Map<ViewPropName, IViewProp>()
  constructor(view: CoreView) {
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

    this._props.set(
      'opacity',
      new OpacityProp(
        new NumberAnimatorFactory(),
        view.elementReader.opacity.value,
        view
      )
    )

    this._props.set(
      'borderRadius',
      new BorderRadiusProp(
        new CSSNumbersAnimatorFactory(),
        [
          view.elementReader.borderRadius.value.topLeft,
          view.elementReader.borderRadius.value.topRight,
          view.elementReader.borderRadius.value.bottomRight,
          view.elementReader.borderRadius.value.bottomLeft
        ],
        view
      )
    )

    this._props.set(
      'origin',
      new OriginProp(
        new Vec2AnimatorFactory(),
        view.elementReader.origin.value,
        view
      )
    )
  }
  allProps(): Array<IViewProp> {
    return Array.from(this._props.values())
  }
  allPropNames() {
    return Array.from(this._props.keys())
  }
  getPropByName(propName: ViewPropName): IViewProp | undefined {
    return this._props.get(propName)
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
  get opacity(): OpacityProp {
    return this._props.get('opacity') as OpacityProp
  }
  get borderRadius(): BorderRadiusProp {
    return this._props.get('borderRadius') as BorderRadiusProp
  }
  get origin(): OriginProp {
    return this._props.get('origin') as OriginProp
  }
}
