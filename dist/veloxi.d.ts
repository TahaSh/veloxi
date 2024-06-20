declare interface AnimatableProp {
    setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    animator: AnimatorProp;
}

declare interface Animator<TValue> {
    readonly name: AnimatorName;
    config: AnimatorConfigMap[keyof AnimatorConfigMap];
    update(data: AnimatorUpdateData<TValue>): TValue;
    reset?(): void;
}

declare interface AnimatorConfigMap {
    instant: {};
    tween: TweenAnimatorConfig;
    dynamic: DynamicAnimatorConfig;
    spring: SpringAnimatorConfig;
}

declare abstract class AnimatorFactory<TValue> {
    createAnimatorByName<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): Animator<TValue>;
    abstract createInstantAnimator(): InstantAnimator<TValue>;
    abstract createTweenAnimator(config?: Partial<TweenAnimatorConfig>): TweenAnimator<TValue>;
    abstract createDynamicAnimator(config?: Partial<DynamicAnimatorConfig>): DynamicAnimator<TValue>;
    abstract createSpringAnimator(config?: Partial<SpringAnimatorConfig>): SpringAnimator<TValue>;
}

declare type AnimatorName = keyof AnimatorConfigMap;

declare class AnimatorProp {
    private _viewProp;
    private _completeCallback?;
    private _updateCallback?;
    private _isAnimating;
    constructor(viewProp: IViewProp);
    set<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    get name(): keyof AnimatorConfigMap;
    onComplete(callback: CompleteCallback): void;
    get isAnimating(): boolean;
    markAsAnimating(): void;
    callCompleteCallback(): void;
    onUpdate(callback: UpdateCallback): void;
    callUpdateCallback(): void;
}

declare interface AnimatorUpdateData<TValue> {
    animatorProp: AnimatorProp;
    initial: TValue;
    current: TValue;
    target: TValue;
    ts: number;
    dt: number;
}

declare class App {
    private _previousTime;
    private readonly _registry;
    private readonly _eventBus;
    private readonly _appEventBus;
    static create(): App;
    constructor();
    addPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(pluginFactory: PluginFactory<TConfig, TPluginApi>, config?: TConfig): void;
    reset(pluginName?: string, callback?: () => void): void;
    destroy(pluginName?: string, callback?: () => void): void;
    getPlugin<TPluginApi extends PluginApi>(pluginFactory: PluginFactory<PluginConfig> | string, pluginKey?: string): TPluginApi;
    getPlugins<TPluginApi extends PluginApi>(pluginFactory: PluginFactory<PluginConfig> | string, pluginKey?: string): TPluginApi[];
    onPluginEvent<TEvent>(pluginFactory: PluginFactory, EventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
    run(): void;
    ready<TPluginApi extends PluginApi>(pluginName: string, callback: ReadyCallback<TPluginApi>): void;
    private _start;
    private _setup;
    private _listenToNativeEvents;
    private _tick;
    private _subscribeToEvents;
    private _onNodeAdded;
    private _onNodeRemoved;
    private _onDataChanged;
    private _read;
    private _update;
    private _render;
}

declare class BorderRadiusProp extends ViewProp<CSSNumber[], VHBorderRadiusValue> implements ViewBorderRadius {
    private _invertedBorderRadius?;
    private _forceStyleUpdateThisFrame;
    private _updateWithScale;
    setFromElementPropValue(value: ElementPropValue<BorderRadiusValue>): void;
    enableUpdateWithScale(): void;
    disableUpdateWithScale(): void;
    get value(): BorderRadiusValue;
    get invertedBorderRadius(): VHBorderRadiusValue | undefined;
    set(value: string | Partial<BorderRadiusValueInput>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    applyScaleInverse(): void;
    private _applyScaleInverse;
    get shouldRender(): boolean;
    get renderValue(): VHBorderRadiusValue;
    projectStyles(): string;
    isTransform(): boolean;
}

declare interface BorderRadiusValue {
    topLeft: CSSNumber;
    topRight: CSSNumber;
    bottomRight: CSSNumber;
    bottomLeft: CSSNumber;
    toCssPercentageForNewSize?(newSize: RectSize): string;
}

declare interface BorderRadiusValueInput {
    topLeft: string;
    topRight: string;
    bottomRight: string;
    bottomLeft: string;
}

export declare interface ChangedData {
    dataName: string;
    dataValue: string;
    viewName: string;
}

declare function clamp(num: number, min: number, max: number): number;

export declare class ClickEvent {
    props: {
        view: View;
    };
    view: View;
    constructor(props: {
        view: View;
    });
}

export declare class ClickEventPlugin extends EventPlugin {
    static pluginName: string;
    subscribeToEvents(eventBus: EventBus): void;
}

declare type CompleteCallback = () => void;

declare class CoreView {
    readonly id: string;
    name: string;
    element: HTMLElement;
    styles: Partial<Record<keyof CSSStyleDeclaration, string>>;
    private _viewProps;
    private _previousRect;
    private _onAddCallbacks;
    private _onRemoveCallback;
    private _skipFirstRenderFrame;
    private _layoutTransition;
    private _registry;
    private _layoutId;
    private _elementReader;
    private _temporaryView;
    private _inverseEffect;
    private _renderNextTick;
    constructor(element: HTMLElement, name: string, registry: Registry, layoutId?: string);
    destroy(): void;
    get elementReader(): ElementReader;
    setElement(element: HTMLElement): void;
    get layoutId(): string | undefined;
    get position(): ViewPosition;
    get scale(): ScaleProp;
    get _children(): CoreView[];
    get _parent(): CoreView | undefined;
    get _parents(): CoreView[];
    get rotation(): ViewRotation;
    get size(): ViewSize;
    get _localWidth(): number;
    get _localHeight(): number;
    get opacity(): ViewOpacity;
    get borderRadius(): ViewBorderRadius;
    get origin(): ViewOrigin;
    get data(): ViewDataProp;
    get onAddCallbacks(): OnAddCallback | undefined;
    get onRemoveCallback(): OnRemoveCallback | undefined;
    get isLayoutTransitionEnabled(): boolean;
    get hasLayoutTransitionEnabledForParents(): boolean;
    get isInverseEffectEnabled(): boolean;
    layoutTransition(enabled: boolean): void;
    inverseEffect(enabled: boolean): void;
    setAnimatorsFromParent(): void;
    get _isRemoved(): boolean;
    setPluginId(id: string): void;
    hasElement(element: HTMLElement): boolean;
    getScroll(): Point;
    intersects(x: number, y: number): boolean;
    overlapsWith(view: View): boolean;
    distanceTo(view: View): number;
    read(): void;
    get rect(): ViewRect;
    get previousRect(): ViewRect;
    update(ts: number, dt: number): void;
    _updatePreviousRect(): void;
    setAsTemporaryView(): void;
    get isTemporaryView(): boolean;
    get shouldRender(): boolean;
    render(): void;
    private _getUserStyles;
    markAsAdded(): void;
    onAdd(callback: OnAddCallback): void;
    onRemove(callback: OnRemoveCallback): void;
    get viewProps(): ViewPropCollection;
    getPropByName(propName: ViewPropName): IViewProp | undefined;
    _copyAnimatorsToAnotherView(view: CoreView): void;
}

export declare function createApp(): App;

declare interface CSSNumber {
    value: number;
    unit: string;
    valueWithUnit: string;
}

export declare class DataChangedEvent implements DataEvent {
    event: DataEvent;
    pluginId: string;
    pluginName: string;
    viewName: string;
    dataName: string;
    dataValue: string;
    constructor(event: DataEvent);
}

declare interface DataEvent {
    pluginId: string;
    pluginName: string;
    viewName: string;
    dataName: string;
    dataValue: string;
}

declare type Direction = 'up' | 'down' | 'left' | 'right';

declare type Direction_2 = 'up' | 'down' | 'left' | 'right';

declare class DragEvent_2 {
    props: {
        view: View;
        previousX: number;
        previousY: number;
        x: number;
        y: number;
        width: number;
        height: number;
        isDragging: boolean;
        target: EventTarget | null;
        directions: Array<Direction>;
    };
    view: View;
    previousX: number;
    previousY: number;
    x: number;
    y: number;
    isDragging: boolean;
    target: EventTarget | null;
    directions: Array<Direction>;
    width: number;
    height: number;
    constructor(props: {
        view: View;
        previousX: number;
        previousY: number;
        x: number;
        y: number;
        width: number;
        height: number;
        isDragging: boolean;
        target: EventTarget | null;
        directions: Array<Direction>;
    });
}
export { DragEvent_2 as DragEvent }

export declare class DragEventPlugin extends EventPlugin {
    static pluginName: string;
    private _pointerX;
    private _pointerY;
    private _initialPointer;
    private _initialPointerPerView;
    private _pointerDownPerView;
    private _targetPerView;
    private _viewPointerPositionLog;
    setup(): void;
    onSelect(e: Event): void;
    get _isDragging(): boolean;
    subscribeToEvents(eventBus: EventBus): void;
    _emitEvent(view: View, directions: Array<Direction>): void;
    private _calculateDirections;
}

declare abstract class DynamicAnimator<TValue> implements Animator<TValue> {
    readonly name = "dynamic";
    protected _config: DynamicAnimatorConfig;
    constructor(config: DynamicAnimatorConfig);
    get config(): DynamicAnimatorConfig;
    abstract update(data: AnimatorUpdateData<TValue>): TValue;
}

declare interface DynamicAnimatorConfig {
    speed: number;
}

declare interface ElementPropValue<T> {
    get value(): T;
}

declare class ElementReader {
    private _rect;
    private _computedStyle;
    constructor(element: HTMLElement);
    read<K extends keyof ViewPropNameToElementPropValue>(propName: K): ViewPropNameToElementPropValue[K] | undefined;
    get rect(): ViewRect;
    get opacity(): ElementPropValue<number>;
    get borderRadius(): ElementPropValue<BorderRadiusValue>;
    get origin(): ElementPropValue<Vec2>;
}

export declare class EventBus {
    private _listeners;
    private _keyedListeners;
    subscribeToEvent<TEvent>(EventCtor: new (props: TEvent) => TEvent, listener: (props: TEvent) => void, key?: string): void;
    private _subscribeToKeyedEvent;
    emitEvent<TEvent>(EventCtor: new (props: TEvent) => TEvent, props: TEvent, key?: string): void;
    private _emitKeyedEvent;
    private _convertListener;
    subscribeToPluginReadyEvent<TPluginApi extends PluginApi>(listener: ReadyCallback<TPluginApi>, pluginName: string, forSetup?: boolean): void;
    emitPluginReadyEvent<TPluginApi extends PluginApi>(pluginName: string, pluginApi: TPluginApi, forSetup?: boolean): void;
    reset(): void;
}

export declare class EventPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi> extends IPlugin<TConfig, TPluginApi> {
    isRenderable(): boolean;
}

declare namespace Events {
    export {
        PointerClickEvent,
        PointerMoveEvent,
        PointerDownEvent,
        PointerUpEvent
    }
}
export { Events }

declare class InstantAnimator<TValue> implements Animator<TValue> {
    readonly name = "instant";
    protected _config: {};
    get config(): {};
    update(data: AnimatorUpdateData<TValue>): TValue;
}

declare abstract class IPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi> {
    private _registry;
    private _eventBus;
    private _appEventBus;
    private _internalEventBus;
    protected _initialized: boolean;
    private readonly _config;
    private readonly _pluginFactory;
    private readonly _pluginName;
    private readonly _id;
    private readonly _pluginKey?;
    private _layoutIdViewMapWaitingToEnter;
    private _apiData;
    private _isReady;
    constructor(pluginFactory: PluginFactory<TConfig, TPluginApi>, pluginName: string, registry: Registry, eventBus: EventBus, appEventBus: EventBus, config: TConfig, pluginKey?: string);
    get api(): TPluginApi;
    _setApi(data: TPluginApi): void;
    get pluginName(): string;
    get pluginFactory(): PluginFactory<TConfig, TPluginApi>;
    get pluginKey(): string | undefined;
    get id(): string;
    get config(): TConfig;
    getViews(viewName?: string): Array<View>;
    getView(viewName?: string): View | undefined;
    getViewById(viewId: string): View | undefined;
    addView(view: View): void;
    setInternalEventBus(eventBus: EventBus): void;
    get internalBusEvent(): EventBus;
    emit<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, eventData: TEvent): void;
    on<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
    useEventPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(pluginFactory: PluginFactory<TConfig, TPluginApi>, config?: TConfig): EventPlugin<TConfig, TPluginApi>;
    notifyAboutDataChanged(data: ChangedData): void;
    onDataChanged(data: ChangedData): void;
    removeView(view: CoreView): void;
    private _invokeRemoveCallback;
    private _deleteView;
    private _createTemporaryView;
    onViewRemoved(view: CoreView): void;
    notifyAboutViewAdded(view: CoreView): void;
    private _invokeAddCallbacks;
    onViewAdded(view: CoreView): void;
    init(): void;
    setup(): void;
    subscribeToEvents(eventBus: EventBus): void;
    abstract isRenderable(): boolean;
}

declare interface IViewProp {
    setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    getAnimator(): Animator<unknown>;
    update(ts: number, dt: number): void;
    projectStyles(): string;
    isTransform(): boolean;
    hasChanged(): boolean;
    destroy(): void;
    isAnimating: boolean;
    shouldRender: boolean;
}

declare function minBy<T>(items: Array<T>, predicate: (item: T) => number): T;

declare interface OnAddCallback {
    afterRemoved?: boolean;
    onInitialLoad?: boolean;
    beforeEnter: (view: CoreView) => void;
    afterEnter: (view: CoreView) => void;
}

declare interface OnRemoveCallback {
    (view: CoreView, done: () => void): void;
}

declare class OpacityProp extends ViewProp<number> implements ViewOpacity {
    setFromElementPropValue(value: ElementPropValue<number>): void;
    get value(): number;
    set(value: number, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    get shouldRender(): boolean;
    get renderValue(): number;
    projectStyles(): string;
    isTransform(): boolean;
}

declare class OriginProp extends ViewProp<Vec2> implements ViewOrigin {
    get x(): number;
    get y(): number;
    set(value: Partial<Point>): void;
    reset(): void;
    get shouldRender(): boolean;
    get renderValue(): Vec2;
    projectStyles(): string;
    isTransform(): boolean;
}

declare class Plugin_2<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi> extends IPlugin<TConfig, TPluginApi> {
    isRenderable(): boolean;
    isInitialized(): boolean;
    get initialized(): boolean;
    update(ts: number, dt: number): void;
    render(): void;
    addView(view: CoreView): void;
}
export { Plugin_2 as Plugin }

declare type PluginApi = Record<string, any>;

declare interface PluginClassFactory<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi> extends PluginFactoryStaticFields {
    new (pluginFactory: PluginFactory<TConfig, TPluginApi>, pluginName: string, registry: Registry, eventBus: EventBus, appEventBus: EventBus, config: TConfig, pluginKey?: string): IPlugin<TConfig, TPluginApi>;
}

declare type PluginConfig = Record<string, any>;

export declare class PluginContext<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi> {
    private _plugin;
    constructor(plugin: Plugin_2<TConfig, TPluginApi>);
    get initialized(): boolean;
    get config(): TConfig;
    setup(callback: () => void): void;
    api(data: TPluginApi): void;
    update(callback: (ts: number, dt: number) => void): void;
    render(callback: () => void): void;
    getViews(viewName: string): Array<View>;
    getView(viewName: string): View | undefined;
    getViewById(viewId: string): View | undefined;
    useEventPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(pluginFactory: PluginFactory<TConfig, TPluginApi>, config?: TConfig): EventPlugin<TConfig, TPluginApi>;
    emit<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, eventData: TEvent): void;
    on<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
    onDataChanged(callback: (data: ChangedData) => void): void;
    onViewRemoved(callback: (view: View) => void): void;
    onViewAdded(callback: (view: View) => void): void;
    subscribeToEvents(callback: (eventBus: EventBus) => void): void;
}

export declare type PluginFactory<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi> = PluginClassFactory<TConfig, TPluginApi> | PluginFunctionFactory<TConfig, TPluginApi>;

declare interface PluginFactoryStaticFields {
    pluginName: string;
    scope?: string;
}

declare interface PluginFunctionFactory<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi> extends PluginFactoryStaticFields {
    (context: PluginContext<TConfig, TPluginApi>): void;
}

declare type PluginId = string;

export declare type Point = {
    x: number;
    y: number;
};

declare type Point_2 = {
    x: number;
    y: number;
};

declare class PointerClickEvent extends PointerEvent_2 {
}

declare class PointerDownEvent extends PointerEvent_2 {
}

declare abstract class PointerEvent_2 {
    x: number;
    y: number;
    target: EventTarget | null;
    constructor(props: PointerEvent_2);
}

declare class PointerMoveEvent extends PointerEvent_2 {
}

declare class PointerUpEvent extends PointerEvent_2 {
}

declare function pointToViewProgress(point: Partial<Point>, view: View, maxDistance: number): number;

declare class PositionProp extends ViewProp<Vec2> implements ViewPosition {
    private _animateLayoutUpdateNextFrame;
    private _parentScaleInverse;
    private get _parentDiff();
    get x(): number;
    get y(): number;
    get initialX(): number;
    get initialY(): number;
    progressTo(target: Partial<Point_2>): number;
    set(value: Partial<Point_2>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    private _runLayoutTransition;
    get shouldRender(): boolean;
    get renderValue(): Vec2;
    projectStyles(): string;
    isTransform(): boolean;
}

declare type ReadyCallback<TPluginApi extends PluginApi> = (pluginApi: TPluginApi) => void;

declare interface RectSize {
    width: number;
    height: number;
}

declare class Registry {
    private readonly _appEventBus;
    private readonly _eventBus;
    private _plugins;
    private _views;
    private _viewsPerPlugin;
    private _viewsToBeCreated;
    private _viewsToBeRemoved;
    private _viewsCreatedInPreviousFrame;
    private _layoutIdToViewMap;
    private _eventPluginsPerPlugin;
    private _pluginNameToPluginFactoryMap;
    private _pluginNameToPluginConfigMap;
    constructor(appEventBus: EventBus, eventBus: EventBus);
    update(): void;
    associateEventPluginWithPlugin(pluginId: PluginId, eventPluginId: PluginId): void;
    private _handleRemovedViews;
    private _getPluginNameForElement;
    private _getPluginIdForElement;
    private _isScopedElement;
    private _handleAddedViews;
    private _getLayoutIdForElement;
    private _createNewView;
    private _createChildrenForView;
    private _handleRemoveView;
    removeViewById(viewId: ViewId, pluginId: PluginId): void;
    private _unassignViewFromPlugin;
    getViewById(viewId: string): CoreView | undefined;
    private _getPluginById;
    private _getPluginViewById;
    destroy(pluginName?: string, callback?: () => void): void;
    private _destroyPlugin;
    private _destroyAll;
    reset(pluginName?: string, callback?: () => void): void;
    private _resetPlugin;
    queueNodeToBeCreated(domEl: HTMLElement): void;
    queueNodeToBeRemoved(domEl: HTMLElement): void;
    notifyPluginAboutDataChange(event: DataChangedEvent): void;
    getPlugins(): ReadonlyArray<IPlugin>;
    getRenderablePlugins(): ReadonlyArray<Plugin_2>;
    getPluginByName(pluginName: string, pluginKey?: string): IPlugin | undefined;
    getPluginsByName(pluginName: string, pluginKey?: string): IPlugin[];
    hasPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(pluginFactory: PluginFactory<TConfig, TPluginApi>): boolean;
    createPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(pluginFactory: PluginFactory<TConfig, TPluginApi>, eventBus: EventBus, config?: TConfig): IPlugin<TConfig, TPluginApi>;
    getViews(): ReadonlyArray<CoreView>;
    createView(domEl: HTMLElement, name: string, layoutId?: string): CoreView;
    assignViewToPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(view: View, plugin: IPlugin<TConfig, TPluginApi>): void;
    getViewsForPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(plugin: IPlugin<TConfig, TPluginApi>): Array<CoreView>;
    getViewsByNameForPlugin<TConfig extends PluginConfig = PluginConfig, TPluginApi extends PluginApi = PluginApi>(plugin: IPlugin<TConfig, TPluginApi>, viewName: string): Array<CoreView>;
}

declare function remap(value: number, a: number, b: number, c: number, d: number): number;

declare class RotationProp extends ViewProp<number> implements ViewRotation {
    private _unit;
    get degrees(): number;
    get radians(): number;
    setDegrees(value: number, runAnimation?: boolean): void;
    setRadians(value: number, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    get shouldRender(): boolean;
    get renderValue(): number;
    projectStyles(): string;
    isTransform(): boolean;
}

declare class ScaleProp extends ViewProp<Vec2> implements ViewScale {
    private _animateLayoutUpdateNextFrame;
    get x(): number;
    get y(): number;
    set(value: Partial<Point> | number, runAnimation?: boolean): void;
    setWithSize(value: Partial<Size>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    private _runLayoutTransition;
    get shouldRender(): boolean;
    get renderValue(): Vec2;
    projectStyles(): string;
    isTransform(): boolean;
}

export declare type Size = {
    width: number;
    height: number;
};

declare class SizeProp extends ViewProp<Vec2> implements ViewSize {
    get width(): number;
    get height(): number;
    get localWidth(): number;
    get localHeight(): number;
    get widthAfterScale(): number;
    get heightAfterScale(): number;
    get initialWidth(): number;
    get initialHeight(): number;
    set(value: Partial<Size>, runAnimation?: boolean): void;
    setWidth(value: number, runAnimation?: boolean): void;
    setHeight(value: number, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    get shouldRender(): boolean;
    get renderValue(): Vec2;
    projectStyles(): string;
    isTransform(): boolean;
}

declare abstract class SpringAnimator<TValue> implements Animator<TValue> {
    readonly name = "spring";
    protected _config: SpringAnimatorConfig;
    constructor(config: SpringAnimatorConfig);
    get config(): SpringAnimatorConfig;
    abstract update(data: AnimatorUpdateData<TValue>): TValue;
}

declare interface SpringAnimatorConfig {
    stiffness: number;
    damping: number;
    speed: number;
}

export declare class SwipeEvent {
    props: {
        view: View;
        direction: Direction_2;
    };
    view: View;
    direction: Direction_2;
    constructor(props: {
        view: View;
        direction: Direction_2;
    });
}

export declare class SwipeEventPlugin extends EventPlugin {
    static pluginName: string;
    private _viewIsPointerDownMap;
    private _viewPointerPositionLog;
    private _targetPerView;
    subscribeToEvents(eventBus: EventBus): void;
}

declare abstract class TweenAnimator<TValue> implements Animator<TValue> {
    readonly name = "tween";
    protected _config: TweenAnimatorConfig;
    protected _startTime?: number;
    constructor(config: TweenAnimatorConfig);
    get config(): TweenAnimatorConfig;
    abstract update(data: AnimatorUpdateData<TValue>): TValue;
    reset(): void;
}

declare interface TweenAnimatorConfig {
    duration: number;
    ease: (t: number) => number;
}

declare type UpdateCallback = () => void;

declare namespace Utils {
    export {
        minBy,
        clamp,
        valueAtPercentage,
        remap,
        pointToViewProgress
    }
}
export { Utils }

declare function valueAtPercentage(from: number, to: number, percentage: number): number;

declare class Vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number);
    get magnitudeSquared(): number;
    get magnitude(): number;
    get unitVector(): Vec2;
    add(v: Vec2): void;
    sub(v: Vec2): void;
    scale(n: number): void;
    dot(v2: Vec2): number;
    equals(v2: Vec2): boolean;
    clone(): Vec2;
    static scale(v: Vec2, n: number): Vec2;
    static sub(v1: Vec2, v2: Vec2): Vec2;
    static add(v1: Vec2, v2: Vec2): Vec2;
}

declare interface VHBorderRadiusValue {
    v: BorderRadiusValue;
    h: BorderRadiusValue;
}

export declare interface View {
    id: ViewId;
    name: string;
    data: ViewDataProp;
    element: HTMLElement;
    styles: Partial<Record<keyof CSSStyleDeclaration, string>>;
    distanceTo(view: View): number;
    onAdd(callback: OnAddCallback): void;
    onRemove(callback: OnRemoveCallback): void;
    layoutTransition(enabled: boolean): void;
    inverseEffect(enabled: boolean): void;
    getScroll(): Point;
    overlapsWith(view: View): boolean;
    intersects(x: number, y: number): boolean;
    hasElement(element: HTMLElement): boolean;
    position: ViewPosition;
    opacity: ViewOpacity;
    borderRadius: ViewBorderRadius;
    size: ViewSize;
    scale: ViewScale;
    rotation: ViewRotation;
    origin: ViewOrigin;
}

declare interface ViewBorderRadius extends AnimatableProp {
    value: BorderRadiusValue;
    set(value: string | Partial<BorderRadiusValueInput>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    disableUpdateWithScale(): void;
    enableUpdateWithScale(): void;
}

declare type ViewDataProp = Record<string, string>;

declare type ViewId = string;

declare interface ViewOpacity extends AnimatableProp {
    value: number;
    set(value: number, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
}

declare interface ViewOrigin {
    x: number;
    y: number;
    set(value: Partial<Point>): void;
    reset(): void;
}

declare interface ViewPosition extends AnimatableProp {
    x: number;
    y: number;
    initialX: number;
    initialY: number;
    set(value: Partial<Point_2>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    progressTo(target: Partial<Point_2>): number;
}

declare abstract class ViewProp<TValue, TRenderValue = TValue> implements IViewProp {
    protected _animatorProp: AnimatorProp;
    protected _animator: Animator<TValue>;
    protected _initialValue: TValue;
    _previousValue: TValue;
    _targetValue: TValue;
    _currentValue: TValue;
    protected _hasChanged: boolean;
    protected _view: CoreView;
    protected _animatorFactory: AnimatorFactory<TValue>;
    protected _previousRenderValue?: TRenderValue;
    constructor(animatorFactory: AnimatorFactory<TValue>, initialValue: TValue, parentView: CoreView);
    get shouldRender(): boolean;
    get isAnimating(): boolean;
    getAnimator(): Animator<TValue>;
    get animator(): AnimatorProp;
    protected get _rect(): ViewRect;
    protected get _previousRect(): ViewRect;
    setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    protected _setTarget(value: TValue, runAnimation?: boolean): void;
    hasChanged(): boolean;
    destroy(): void;
    update(ts: number, dt: number): void;
    abstract projectStyles(): string;
    abstract isTransform(): boolean;
}

declare class ViewPropCollection {
    private _props;
    constructor(view: CoreView);
    allProps(): Array<IViewProp>;
    allPropNames(): ViewPropName[];
    getPropByName(propName: ViewPropName): IViewProp | undefined;
    get position(): PositionProp;
    get scale(): ScaleProp;
    get rotation(): RotationProp;
    get size(): SizeProp;
    get opacity(): OpacityProp;
    get borderRadius(): BorderRadiusProp;
    get origin(): OriginProp;
}

declare type ViewPropName = 'position' | 'scale' | 'rotation' | 'size' | 'origin' | 'opacity' | 'borderRadius';

declare type ViewPropNameToElementPropValue = {
    [K in ViewPropName]: K extends 'opacity' ? ElementPropValue<number> : K extends 'borderRadius' ? ElementPropValue<BorderRadiusValue> : never;
};

declare interface ViewRect {
    viewportOffset: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    pageOffset: {
        left: number;
        top: number;
    };
    size: RectSize;
}

declare interface ViewRotation extends AnimatableProp {
    degrees: number;
    radians: number;
    setDegrees(value: number, runAnimation?: boolean): void;
    setRadians(value: number, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
}

declare interface ViewScale extends AnimatableProp {
    x: number;
    y: number;
    set(value: Partial<Point> | number, runAnimation?: boolean): void;
    setWithSize(value: Partial<Size>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
}

declare interface ViewSize extends AnimatableProp {
    width: number;
    height: number;
    widthAfterScale: number;
    heightAfterScale: number;
    initialWidth: number;
    initialHeight: number;
    set(value: Partial<Size>, runAnimation?: boolean): void;
    setWidth(value: number, runAnimation?: boolean): void;
    setHeight(value: number, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
}

export { }
