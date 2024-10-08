import { DataChangedEvent, EventBus } from '..'
import {
  PluginConfig,
  createPlugin,
  type PluginFactory,
  IPlugin,
  Plugin,
  PluginApi
} from './Plugin'
import { CoreView, View } from './View'

type PluginId = string
export type ViewId = string
export type LayoutId = string

export class Registry {
  private readonly _appEventBus: EventBus
  private readonly _eventBus: EventBus
  private _plugins: Array<IPlugin<any, any>> = []
  private _views: Array<CoreView> = []
  private _viewsPerPlugin: Map<PluginId, Array<ViewId>> = new Map()
  private _viewsToBeCreated: Array<HTMLElement> = []
  private _viewsToBeRemoved: Array<HTMLElement> = []
  private _viewsCreatedInPreviousFrame: Array<CoreView> = []
  private _layoutIdToViewMap: Map<LayoutId, CoreView> = new Map()
  private _eventPluginsPerPlugin: Map<PluginId, Array<PluginId>> = new Map()
  private _pluginNameToPluginFactoryMap: Map<string, PluginFactory<any, any>> =
    new Map()
  private _pluginNameToPluginConfigMap: Map<string, any> = new Map()

  constructor(appEventBus: EventBus, eventBus: EventBus) {
    this._appEventBus = appEventBus
    this._eventBus = eventBus
  }

  update(): void {
    this._handleRemovedViews()
    this._handleAddedViews()
  }

  associateEventPluginWithPlugin(
    pluginId: PluginId,
    eventPluginId: PluginId
  ): void {
    let eventPluginIds = this._eventPluginsPerPlugin.get(pluginId)
    if (!eventPluginIds) {
      eventPluginIds = []
      this._eventPluginsPerPlugin.set(pluginId, eventPluginIds)
    }
    eventPluginIds.push(eventPluginId)
  }

  private _handleRemovedViews() {
    const elementsToBeRemoved = this._viewsToBeRemoved.filter((domEl) => {
      return domEl.dataset.velViewId
    })
    if (elementsToBeRemoved.length) {
      elementsToBeRemoved.forEach((domEl) => {
        const viewId = domEl.dataset.velViewId
        if (!viewId) return
        this._handleRemoveView(viewId)
        domEl.querySelectorAll('*').forEach((el) => {
          const viewId = (el as HTMLElement).dataset.velViewId
          if (!viewId) return
          // Remove listeners from nested children
          this._plugins.forEach((plugin) => {
            const views = this._viewsPerPlugin.get(plugin.id)
            if (!views) return
            const view = this._getPluginViewById(plugin, viewId)
            if (!view) return
            view.removeListeners()
          })
        })
      })
      this._viewsToBeRemoved = []
    }
  }

  private _getPluginNameForElement(domEl: HTMLElement): string | undefined {
    const pluginName = domEl.dataset.velPlugin
    if (pluginName && pluginName.length > 0) return pluginName
    const parentPlugin = domEl.closest('[data-vel-plugin]')
    if (parentPlugin) {
      return (parentPlugin as HTMLElement).dataset.velPlugin
    }
  }

  private _getPluginIdForElement(domEl: HTMLElement): string | undefined {
    const pluginName = this._getPluginNameForElement(domEl)
    if (!pluginName) {
      return
    }
    const pluginEl = domEl.closest('[data-vel-plugin-id]')
    if (pluginEl) {
      return (pluginEl as HTMLElement).dataset.velPluginId
    }
    const plugin = this.getPluginByName(pluginName)
    if (plugin) {
      return plugin.id
    }
  }

  private _isScopedElement(domEl: HTMLElement): boolean {
    const pluginName = this._getPluginNameForElement(domEl)
    if (!pluginName) {
      return false
    }
    const pluginFactory = this._pluginNameToPluginFactoryMap.get(pluginName)
    const scope = pluginFactory?.scope
    const isViewScoped = domEl.dataset.velView === scope
    return isViewScoped
  }

  private _removeElementsWithParent(
    els: Array<HTMLElement>
  ): Array<HTMLElement> {
    const elementSet = new Set(els)

    return els.filter((el) => {
      let parent = el.parentElement
      while (parent) {
        if (elementSet.has(parent)) {
          return false
        }
        parent = parent.parentElement
      }
      return true
    })
  }

  private _handleAddedViews() {
    this._viewsCreatedInPreviousFrame.forEach((view) => {
      view.markAsAdded()
    })
    this._viewsCreatedInPreviousFrame = []

    const viewsToBeCreated = this._removeElementsWithParent(
      this._viewsToBeCreated
    )
    // Create plugin for views in scoped plugins
    const scopedViews = Array.from(
      new Set(
        viewsToBeCreated.filter(
          (domEl) =>
            this._isScopedElement(domEl) && !this._isElementIgnored(domEl)
        )
      )
    )
    const restViews = viewsToBeCreated.filter(
      (domEl) => !this._isScopedElement(domEl) && !this._isElementIgnored(domEl)
    )
    this._viewsToBeCreated = []
    scopedViews.forEach((domEl) => {
      const pluginName = this._getPluginNameForElement(domEl)!
      const pluginFactory = this._pluginNameToPluginFactoryMap.get(pluginName)!
      const pluginConfig = this._pluginNameToPluginConfigMap.get(pluginName)
      const key = domEl.dataset.velPluginKey
      const plugin = createPlugin(
        pluginFactory,
        this,
        this._eventBus,
        this._appEventBus,
        pluginConfig,
        key
      )
      this._plugins.push(plugin)
      const viewName = domEl.dataset.velView!
      const view = this._createNewView(domEl, viewName, plugin)
      if (view.isInverseEffectEnabled) {
        view.setAnimatorsFromParent()
      }
      plugin.notifyAboutViewAdded(view)
    })

    const elementsToBeAdded = restViews.filter((domEl) => {
      const pluginId = this._getPluginIdForElement(domEl)
      return !!pluginId
    })

    if (elementsToBeAdded.length === 0) return
    elementsToBeAdded.forEach((domEl) => {
      const pluginId = this._getPluginIdForElement(domEl)
      const viewName = domEl.dataset.velView
      if (!viewName || !pluginId) return
      const plugin = this._getPluginById(pluginId)
      if (!plugin) {
        // TODO: Warning message
        return
      }
      const layoutId = this._getLayoutIdForElement(domEl, plugin)
      let view: CoreView
      if (layoutId && this._layoutIdToViewMap.has(layoutId)) {
        view = this._layoutIdToViewMap.get(layoutId)!
        view.setElement(domEl)
        view.setPluginId(plugin.id)
        this._createChildrenForView(view, plugin)
      } else {
        view = this._createNewView(domEl, viewName, plugin)
      }

      if (view.isInverseEffectEnabled) {
        view.setAnimatorsFromParent()
      }
      plugin.notifyAboutViewAdded(view)
    })
  }

  private _getLayoutIdForElement<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    domEl: HTMLElement,
    plugin: IPlugin<TConfig, TPluginApi>
  ): string | undefined {
    const layoutId = domEl.dataset.velLayoutId
    if (layoutId) {
      return `${layoutId}-${plugin.id}`
    }
  }

  private _createNewView<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    domEl: HTMLElement,
    viewName: string,
    plugin: IPlugin<TConfig, TPluginApi>
  ) {
    const layoutId = this._getLayoutIdForElement(domEl, plugin)
    const view = this.createView(domEl, viewName, layoutId)
    plugin.addView(view)
    if (view.layoutId) {
      this._layoutIdToViewMap.set(view.layoutId, view)
    }
    this._createChildrenForView(view, plugin)

    // Call setup() after the plugin is ready
    this._appEventBus.emitPluginReadyEvent(plugin.pluginName, plugin.api, true)
    // We wait for the two tick to make sure we handle ready
    // events registered after the plugin is created and setup is called.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._appEventBus.emitPluginReadyEvent(plugin.pluginName, plugin.api)
      })
    })

    return view
  }

  private _createChildrenForView<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(view: CoreView, plugin: IPlugin<TConfig, TPluginApi>) {
    const allNestedChildren = view.element.querySelectorAll('*')
    if (!allNestedChildren.length) return
    if (
      Array.from(allNestedChildren).some(
        (el) =>
          this._getPluginNameForElement(el as HTMLElement) !== plugin.pluginName
      )
    ) {
      console.log(
        `%c WARNING: The plugin "${plugin.pluginName}" has view(s) created for a different plugin. Make sure all views inside that plugin don\'t have data-vel-plugin set or the pluginName is set to "${plugin.pluginName}"`,
        'background: #885500'
      )
      return
    }
    Array.from(allNestedChildren)
      .filter((child) => !this._isElementIgnored(child as HTMLElement))
      .forEach((child) => {
        const childEl = child as HTMLElement
        const viewName = childEl.dataset.velView
          ? childEl.dataset.velView
          : `${view.name}-child`

        const layoutId = this._getLayoutIdForElement(childEl, plugin)
        let childView: CoreView
        if (layoutId && this._layoutIdToViewMap.has(layoutId)) {
          childView = this._layoutIdToViewMap.get(layoutId)!
          childView.setElement(childEl)
          childView.setPluginId(plugin.id)
        } else {
          childView = this.createView(childEl, viewName, layoutId)
        }

        if (layoutId && !this._layoutIdToViewMap.has(layoutId)) {
          this._layoutIdToViewMap.set(layoutId, childView)
        }

        plugin.addView(childView)
        plugin.notifyAboutViewAdded(childView)
      })
  }

  private _handleRemoveView(viewId: ViewId): void {
    this._plugins.forEach((plugin) => {
      const views = this._viewsPerPlugin.get(plugin.id)
      if (!views) return
      const view = this._getPluginViewById(plugin, viewId)
      if (!view) return
      plugin.removeView(view)
    })
  }

  public removeViewById(viewId: ViewId, pluginId: PluginId) {
    // First remove its association with the plugin
    this._unassignViewFromPlugin(viewId, pluginId)

    // Then, remove it from the views array
    this._views = this._views.filter((view) => view.id !== viewId)
  }

  private _unassignViewFromPlugin(viewId: ViewId, pluginId: PluginId) {
    const viewsInPlugin = this._viewsPerPlugin.get(pluginId)
    if (!viewsInPlugin) return
    const viewIndex = viewsInPlugin.indexOf(viewId)
    if (viewIndex === -1) return
    viewsInPlugin.splice(viewIndex, 1)
  }

  public getViewById(viewId: string): CoreView | undefined {
    return this._views.find((view) => view.id === viewId)
  }

  public getViewsById(viewIds: string[]): CoreView[] {
    return this._views.filter((view) => viewIds.includes(view.id))
  }

  private _getPluginById<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(pluginId: PluginId): IPlugin<TConfig, TPluginApi> | undefined {
    return this._plugins.find((plugin) => plugin.id === pluginId)
  }

  private _getPluginViewById(
    plugin: IPlugin,
    viewId: string
  ): CoreView | undefined {
    return this.getViewsForPlugin(plugin).find((view) => view.id === viewId)
  }

  public destroy(pluginName?: string, callback?: () => void) {
    if (!pluginName) {
      this._destroyAll(callback)
      return
    }
    let plugins: IPlugin[] = [] as IPlugin[]
    if (pluginName && pluginName.length > 0) {
      const plugin = this.getPluginByName(pluginName)
      if (plugin) {
        const eventPluginIds = this._eventPluginsPerPlugin.get(plugin.id) || []
        const eventPlugins = eventPluginIds
          .map((eventPluginId) => this._getPluginById(eventPluginId))
          .filter((plugin): plugin is IPlugin => typeof plugin !== 'undefined')
        plugins.push(plugin)
        plugins.push(...eventPlugins)
      }
    } else {
      plugins = this._plugins
    }

    plugins.forEach((plugin) => {
      this._destroyPlugin(plugin)
    })
    requestAnimationFrame(() => {
      callback?.()
    })
  }

  private _destroyPlugin(plugin: IPlugin<PluginConfig, PluginApi>) {
    const viewsInPlugin = this.getViewsForPlugin(plugin)
    viewsInPlugin.forEach((view) => {
      if (view.layoutId) {
        this._layoutIdToViewMap.delete(view.layoutId)
      }
      view.destroy()
    })
    this._views = this._views.filter(
      (view) => !viewsInPlugin.find((v) => v.id === view.id)
    )
    this._viewsPerPlugin.delete(plugin.id)
    this._plugins = this._plugins.filter((p) => p.id !== plugin.id)
  }

  private _destroyAll(callback?: () => void) {
    this._views.forEach((view) => view.destroy())
    requestAnimationFrame(() => {
      this._plugins = []
      this._views = []
      this._viewsPerPlugin.clear()
      this._viewsToBeCreated = []
      this._viewsToBeRemoved = []
      this._viewsCreatedInPreviousFrame = []
      this._layoutIdToViewMap.clear()
      this._eventPluginsPerPlugin.clear()
      callback?.()
    })
  }

  public reset(pluginName?: string, callback?: () => void) {
    let plugins: IPlugin[] = [] as IPlugin[]
    if (pluginName && pluginName.length > 0) {
      const plugin = this.getPluginByName(pluginName)
      if (plugin) {
        const eventPluginIds = this._eventPluginsPerPlugin.get(plugin.id) || []
        const eventPlugins = eventPluginIds
          .map((eventPluginId) => this._getPluginById(eventPluginId))
          .filter((plugin): plugin is IPlugin => typeof plugin !== 'undefined')
        plugins.push(plugin)
        plugins.push(...eventPlugins)
      }
    } else {
      plugins = this._plugins
    }

    requestAnimationFrame(() => {
      plugins.forEach((plugin) => {
        this._resetPlugin(plugin)
      })
      requestAnimationFrame(() => {
        callback?.()
      })
    })
  }

  private _resetPlugin(plugin: IPlugin<PluginConfig, PluginApi>) {
    const pluginConfig = plugin.config
    const pluginFactory = plugin.pluginFactory
    const internalBusEvent = plugin.internalBusEvent
    const isEventPlugin = !plugin.isRenderable()
    const viewsInPlugin = this.getViewsForPlugin(plugin)
    viewsInPlugin.forEach((view) => {
      if (view.layoutId) {
        this._layoutIdToViewMap.delete(view.layoutId)
      }
      view.destroy()
    })
    this._views = this._views.filter(
      (view) => !viewsInPlugin.find((v) => v.id === view.id)
    )
    this._viewsPerPlugin.delete(plugin.id)
    this._plugins = this._plugins.filter((p) => p.id !== plugin.id)
    if (!isEventPlugin) {
      requestAnimationFrame(() => {
        const plugin = this.createPlugin(
          pluginFactory,
          this._eventBus,
          pluginConfig
        )
        plugin.setInternalEventBus(internalBusEvent)
      })
    }
  }

  queueNodeToBeCreated(domEl: HTMLElement) {
    this._viewsToBeCreated.push(domEl)
  }

  queueNodeToBeRemoved(domEl: HTMLElement) {
    this._viewsToBeRemoved.push(domEl)
  }

  notifyPluginAboutDataChange(event: DataChangedEvent) {
    const plugins = this._plugins.filter(
      (plugin) => plugin.id === event.pluginId
    )
    if (!plugins || !plugins.length) return
    plugins.forEach((plugin) => {
      plugin.notifyAboutDataChanged({
        dataName: event.dataName,
        dataValue: event.dataValue,
        viewName: event.viewName
      })
    })
  }

  getPlugins(): ReadonlyArray<IPlugin> {
    return this._plugins
  }

  getRenderablePlugins(): ReadonlyArray<Plugin> {
    function isRenderable(plugin: IPlugin): plugin is Plugin {
      return plugin.isRenderable()
    }
    return this._plugins.filter(isRenderable)
  }

  getPluginByName(pluginName: string, pluginKey?: string): IPlugin | undefined {
    return this._plugins.find((plugin) => {
      if (!pluginKey) {
        return plugin.pluginName === pluginName
      }
      return plugin.pluginKey === pluginKey && plugin.pluginName === pluginName
    })
  }

  getPluginsByName(pluginName: string, pluginKey?: string): IPlugin[] {
    return this._plugins.filter((plugin) => {
      if (!pluginKey) {
        return plugin.pluginName === pluginName
      }
      return plugin.pluginKey === pluginKey && plugin.pluginName === pluginName
    })
  }

  hasPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(pluginFactory: PluginFactory<TConfig, TPluginApi>): boolean {
    if (!pluginFactory.pluginName) {
      return false
    }
    return !!this.getPluginByName(pluginFactory.pluginName)
  }

  createPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    eventBus: EventBus,
    config: TConfig = {} as TConfig,
    forUpdate = false
  ): IPlugin<TConfig, TPluginApi> {
    if (!pluginFactory.pluginName) {
      throw Error(
        `Plugin ${pluginFactory.name} must contain a pluginName field`
      )
    }
    let scopeRoots: Array<HTMLElement> = []
    if (pluginFactory.scope) {
      const domElsSelector = forUpdate
        ? `[data-vel-plugin=${pluginFactory.pluginName}][data-vel-view=${pluginFactory.scope}]:not([data-vel-plugin-id])`
        : `[data-vel-plugin=${pluginFactory.pluginName}][data-vel-view=${pluginFactory.scope}]`
      const domEls = document.querySelectorAll<HTMLElement>(domElsSelector)

      if (!this._pluginNameToPluginFactoryMap.has(pluginFactory.pluginName)) {
        this._pluginNameToPluginFactoryMap.set(
          pluginFactory.pluginName,
          pluginFactory
        )
      }

      if (!this._pluginNameToPluginConfigMap.has(pluginFactory.pluginName)) {
        this._pluginNameToPluginConfigMap.set(pluginFactory.pluginName, config)
      }

      if (domEls) {
        scopeRoots = Array.from(domEls)
      } else {
        scopeRoots = [document.documentElement]
      }
    } else {
      scopeRoots = [document.documentElement]
    }
    const plugins = scopeRoots.map((rootEl) => {
      const key = rootEl.dataset.velPluginKey
      const plugin = createPlugin<TConfig, TPluginApi>(
        pluginFactory,
        this,
        eventBus,
        this._appEventBus,
        config,
        key
      )
      this._plugins.push(plugin)
      let domEls: Array<HTMLElement> = []
      if (rootEl !== document.documentElement) {
        domEls.push(rootEl)
      }
      const childEls = rootEl.querySelectorAll<HTMLElement>(
        `[data-vel-plugin=${plugin.pluginName}]`
      )
      domEls = [...domEls, ...childEls]
      const topLevelDomEls = domEls.filter((domEl) => {
        if (this._isElementIgnored(domEl)) {
          return false
        }
        const parentElement = domEl.parentElement
        if (!parentElement) {
          return true
        }
        const pluginName = this._getPluginNameForElement(domEl.parentElement)
        if (pluginName && pluginName.length > 0) {
          return false
        }
        return true
      })
      if (topLevelDomEls.length) {
        topLevelDomEls.forEach((domEl) => {
          const viewName = domEl.dataset.velView
          if (!viewName) return
          const view = this._createNewView(domEl, viewName, plugin)
          plugin.notifyAboutViewAdded(view)
        })
      }
      return plugin
    })

    if (plugins && plugins.length > 0) {
      return plugins[0]
    }
    const plugin = createPlugin(
      pluginFactory,
      this,
      eventBus,
      this._appEventBus,
      config
    )
    if (!pluginFactory.scope) {
      console.log(
        `%c WARNING: The plugin "${plugin.pluginName}" is created but there are no elements using it on the page`,
        'background: #885500'
      )
    }
    return plugin
  }

  updatePlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    eventBus: EventBus,
    config: TConfig = {} as TConfig
  ): IPlugin<TConfig, TPluginApi> {
    return this.createPlugin(pluginFactory, eventBus, config, true)
  }

  getViews(): ReadonlyArray<CoreView> {
    return this._views
  }

  createView(domEl: HTMLElement, name: string, layoutId?: string): CoreView {
    const view = new CoreView(domEl, name, this, layoutId)
    this._views.push(view)
    this._viewsCreatedInPreviousFrame.push(view)
    return view
  }

  private _isElementIgnored(el: HTMLElement) {
    return el.closest('[data-vel-ignore]')
  }

  assignViewToPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(view: View, plugin: IPlugin<TConfig, TPluginApi>): void {
    if (!this._viewsPerPlugin.has(plugin.id)) {
      this._viewsPerPlugin.set(plugin.id, [])
    }
    const viewsInPlugin = this._viewsPerPlugin.get(plugin.id)!
    if (!viewsInPlugin.includes(view.id)) {
      viewsInPlugin.push(view.id)
    }
  }

  getViewsForPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(plugin: IPlugin<TConfig, TPluginApi>): Array<CoreView> {
    const viewIds = this._viewsPerPlugin.get(plugin.id)
    if (!viewIds) {
      return []
    }
    const views = viewIds
      .map((viewId) => this._views.find((view) => view.id === viewId))
      .filter((view): view is CoreView => !!view)
    return views
  }

  getViewsByNameForPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(plugin: IPlugin<TConfig, TPluginApi>, viewName: string): Array<CoreView> {
    return this.getViewsForPlugin(plugin).filter(
      (view) => view.name === viewName
    )
  }
}
