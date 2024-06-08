import { ViewPropName } from '../view-props/ViewPropCollection'
import { BorderRadiusValue } from './BorderRadiusValue'

export type ViewPropNameToElementPropValue = {
  [K in ViewPropName]: K extends 'opacity'
    ? ElementPropValue<number>
    : K extends 'borderRadius'
    ? ElementPropValue<BorderRadiusValue>
    : never
}

export interface ElementPropValue<T> {
  get value(): T
}
