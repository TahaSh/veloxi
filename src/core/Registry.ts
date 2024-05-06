import { DataChangedEvent, EventBus } from '..'
import {
  PluginConfig,
  createPlugin,
  type PluginFactory,
  IPlugin,
  Plugin
} from './Plugin'
import { View } from './View'

type PluginId = string
type ViewId = string

export class Registry {
  private _plugins: Array<IPlugin> = []
  private _views: Array<View> = []
  private _viewsPerPlugin: Map<PluginId, Array<ViewId>> = new Map()
  private _viewsToBeCreated: Array<HTMLElement> = []
  private _viewsToBeRemoved: Array<HTMLElement> = []
  private _viewsCreatedInPreviousFrame: Array<View> = []

  update(): void {
    this._viewsCreatedInPreviousFrame.forEach((view) => {
      view.markAsAdded()
    })
    this._viewsCreatedInPreviousFrame = []
    const elementsToBeAdded = this._viewsToBeCreated.filter((domEl) => {
      const pluginName = domEl.dataset.velPlugin
      if (!pluginName) return false
      return this.getPluginByName(pluginName)
    })
    if (elementsToBeAdded.length) {
      elementsToBeAdded.forEach((domEl) => {
        const pluginName = domEl.dataset.velPlugin
        const viewName = domEl.dataset.velView
        if (!viewName || !pluginName) return
        const view = this.createView(domEl, viewName)
        const plugin = this.getPluginByName(pluginName)
        if (!plugin) return
        plugin.addView(view)
        plugin.notifyAboutViewAdded(view)
      })
      this._viewsToBeCreated = []
    }

    const elementsToBeRemoved = this._viewsToBeRemoved.filter((domEl) => {
      return domEl.dataset.velViewId
    })
    if (elementsToBeRemoved.length) {
      elementsToBeRemoved.forEach((domEl) => {
        const viewId = domEl.dataset.velViewId
        if (!viewId) return
        this.removeViewById(viewId)
      })
      this._viewsToBeRemoved = []
    }
  }

  public removeViewById(viewId: ViewId): void {
    this._plugins.forEach((plugin) => {
      const views = this._viewsPerPlugin.get(plugin.id)
      if (!views) return
      const viewIndex = views.indexOf(viewId)
      const view = this.getViewById(viewId)
      if (viewIndex !== -1 && view) {
        views.splice(viewIndex, 1)
        plugin.notifyAboutViewRemoved(view)
      }
    })
    this._views = this._views.filter((view) => view.id !== viewId)
  }

  public getViewById(viewId: string): View | undefined {
    return this._views.find((view) => view.id === viewId)
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

  getPluginByName(pluginName: string): IPlugin | undefined {
    return this._plugins.find((plugin) => plugin.pluginName === pluginName)
  }

  createPlugin<TConfig extends PluginConfig>(
    pluginFactory: PluginFactory<TConfig>,
    eventBus: EventBus,
    config: TConfig = {} as TConfig
  ): IPlugin<TConfig> {
    if (!pluginFactory.pluginName) {
      throw Error(
        `Plugin ${pluginFactory.name} must contain a pluginName field`
      )
    }
    let scopeRoots: Array<HTMLElement> = []
    if (pluginFactory.scope) {
      const domEls = document.querySelectorAll<HTMLElement>(
        `[data-vel-plugin=${pluginFactory.pluginName}][data-vel-view=${pluginFactory.scope}]`
      )
      if (domEls) {
        scopeRoots = Array.from(domEls)
      } else {
        scopeRoots = [document.documentElement]
      }
    } else {
      scopeRoots = [document.documentElement]
    }
    const plugins = scopeRoots.map((rootEl) => {
      const plugin = createPlugin<TConfig>(
        pluginFactory,
        this,
        eventBus,
        config
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
      if (domEls.length) {
        domEls.forEach((domEl) => {
          const viewName = domEl.dataset.velView
          if (!viewName) return
          const view = this.createView(domEl, viewName)
          plugin.addView(view)
          plugin.notifyAboutViewAdded(view)
        })
      }
      return plugin
    })

    if (plugins && plugins.length > 0) {
      return plugins[0]
    }
    const plugin = createPlugin(pluginFactory, this, eventBus, config)
    console.log(
      `%c WARNING: The plugin "${plugin.pluginName}" is created but there are no elements using it on the page`,
      'background: #885500'
    )
    return plugin
  }

  getViews(): ReadonlyArray<View> {
    return this._views
  }

  createView(domEl: HTMLElement, name: string): View {
    const view = new View(domEl, name)
    this._views.push(view)
    this._viewsCreatedInPreviousFrame.push(view)
    return view
  }

  addViewToPlugin(view: View, plugin: IPlugin): void {
    if (!this._viewsPerPlugin.has(plugin.id)) {
      this._viewsPerPlugin.set(plugin.id, [])
    }
    const viewsInPlugin = this._viewsPerPlugin.get(plugin.id)!
    if (!viewsInPlugin.includes(view.id)) {
      viewsInPlugin.push(view.id)
    }
  }

  getViewsForPlugin(plugin: IPlugin): Array<View> {
    const viewIds = this._viewsPerPlugin.get(plugin.id)
    if (!viewIds) {
      return []
    }
    const views = viewIds
      .map((viewId) => this._views.find((view) => view.id === viewId))
      .filter((view): view is View => !!view)
    return views
  }

  getViewsByNameForPlugin(plugin: IPlugin, viewName: string): Array<View> {
    return this.getViewsForPlugin(plugin).filter(
      (view) => view.name === viewName
    )
  }
}
