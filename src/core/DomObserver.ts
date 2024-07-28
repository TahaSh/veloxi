import { EventBus } from '..'
import { DataChangedEvent } from '../builtin-events/DataEvents'
import { toCamelCase } from '../utils/String'

export class NodeAddedEvent {
  node: HTMLElement
  constructor(props: { node: HTMLElement }) {
    this.node = props.node
  }
}

export class NodeRemovedEvent {
  node: HTMLElement
  constructor(props: { node: HTMLElement }) {
    this.node = props.node
  }
}

export class DomObserver {
  private _eventBus: EventBus
  private _observer: MutationObserver
  constructor(eventBus: EventBus) {
    this._eventBus = eventBus
    this._observer = new MutationObserver(this._handler.bind(this))
    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    })
  }

  _handler(mutations: Array<MutationRecord>) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        if (node.dataset.velViewId) return
        if (
          node.parentElement &&
          typeof node.parentElement.dataset.velAdded !== 'undefined'
        )
          return
        let nodeToBeAdded: HTMLElement | null = node
        if (!node.dataset.velView) {
          nodeToBeAdded = node.querySelector('[data-vel-view][data-vel-plugin]')
        }
        if (!nodeToBeAdded) return
        this._eventBus.emitEvent(NodeAddedEvent, { node: nodeToBeAdded })
        const nestedChildren =
          nodeToBeAdded.querySelectorAll<HTMLElement>('[data-vel-plugin]')
        if (nestedChildren.length) {
          nestedChildren.forEach((element) => {
            this._eventBus.emitEvent(NodeAddedEvent, { node: element })
          })
        }
      })

      mutation.removedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        if (typeof node.dataset.velProcessing !== 'undefined') return

        const nestedChildren =
          node.querySelectorAll<HTMLElement>('[data-vel-plugin]')
        if (nestedChildren.length) {
          nestedChildren.forEach((element) => {
            this._eventBus.emitEvent(NodeRemovedEvent, { node: element })
          })
        }

        this._eventBus.emitEvent(NodeRemovedEvent, { node })
      })

      const attributeName = mutation.attributeName

      if (attributeName === 'data-vel-view') {
        this._eventBus.emitEvent(NodeAddedEvent, {
          node: mutation.target as HTMLElement
        })
      }

      const dataRegex = /data-vel-data-.+/gi
      if (attributeName && dataRegex.test(attributeName)) {
        const node = mutation.target as HTMLElement
        const pluginId = node.dataset.velPluginId || ''
        const pluginName = node.dataset.velPlugin || ''
        const viewName = node.dataset.velView || ''
        const dataValue = node.getAttribute(attributeName)
        if (dataValue && dataValue !== mutation.oldValue) {
          const dataName = toCamelCase(
            attributeName.replace('data-vel-data-', '')
          )
          this._eventBus.emitEvent(DataChangedEvent, {
            pluginId,
            pluginName,
            viewName,
            dataName,
            dataValue
          })
        }
      }
    })
  }
}
