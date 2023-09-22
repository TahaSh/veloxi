declare interface Animator<TValue> {
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

declare class AnimatorProp {
    private _viewProp;
    private _completeCallback?;
    private _updateCallback?;
    constructor(viewProp: IViewProp);
    set<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    onComplete(callback: CompleteCallback): void;
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

export declare class App {
    private _previousTime;
    private readonly _registry;
    private readonly _eventBus;
    static create(): App;
    constructor();
    addPlugin<TConfig extends PluginConfig>(PluginCtor: PluginFactory<TConfig>, config?: TConfig): void;
    onPluginEvent<TEvent>(PluginCtor: PluginFactory, EventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
    run(): void;
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

export declare interface ChangedData {
    dataName: string;
    dataValue: string;
    viewName: string;
}

declare function clamp(num: number, min: number, max: number): number;

declare type CompleteCallback = () => void;

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

export declare class DragEventPlugin extends Plugin_2 {
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
    protected _config: DynamicAnimatorConfig;
    constructor(config: DynamicAnimatorConfig);
    abstract update(data: AnimatorUpdateData<TValue>): TValue;
}

declare interface DynamicAnimatorConfig {
    speed: number;
}

export declare class EventBus {
    private _listeners;
    subscribeToEvent<TEvent>(EventCtor: new (props: TEvent) => TEvent, listener: (props: TEvent) => void): void;
    emitEvent<TEvent>(EventCtor: new (props: TEvent) => TEvent, props: TEvent): void;
    reset(): void;
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
    protected _config: {};
    update(data: AnimatorUpdateData<TValue>): TValue;
}

declare interface IPlugin extends IPluginAccessors, IRunnablePlugin, IPublicPlugin {
    pluginName: string;
    setup(): void;
    update(ts: number, dt: number): void;
    render(): void;
    subscribeToEvents(eventBus: EventBus): void;
    onViewAdded(view: View): void;
    onViewRemoved(view: View): void;
    onDataChanged(callback: (data: ChangedData) => void): void;
}

declare interface IPluginAccessors extends IPluginRegistry {
    getViews(name?: string): Array<View>;
    getView(name: string): View | undefined;
    getViewById(id: string): View | undefined;
    getConfig(): Readonly<PluginConfig>;
    emit<TEvent>(EventCtor: new (eventData: TEvent) => TEvent, eventData: TEvent): void;
    usePlugin<TConfig extends PluginConfig>(PluginCtor: PluginFactory<TConfig>, config?: TConfig): IPublicPlugin;
    getEventBus(): EventBus;
}

export declare interface IPluginContext extends IPluginAccessors {
    setup(callback: () => void): void;
    update(callback: (ts: number, dt: number) => void): void;
    render(callback: () => void): void;
    subscribeToEvents(callback: (eventBus: EventBus) => void): void;
    onViewAdded(callback: (view: View) => void): void;
    onViewRemoved(callback: (view: View) => void): void;
    onDataChanged(callback: (data: ChangedData) => void): void;
}

declare interface IPluginRegistry {
    readonly id: string;
}

declare interface IPublicPlugin extends IPluginRegistry {
    addView(view: View, props?: {
        notify: boolean;
    }): void;
    on<TEvent>(EventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
    setParentPluginContext(pluginContext: IPluginContext): void;
}

declare interface IRunnablePlugin {
    render(): void;
    renderViews(): void;
    update(ts: number, dt: number): void;
    init(): void;
    subscribeToEvents(eventBus: EventBus): void;
}

declare interface IViewProp {
    setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    update(ts: number, dt: number): void;
    projectStyles(): string;
    isTransform(): boolean;
    hasChanged(): boolean;
}

declare function minBy<T>(items: Array<T>, predicate: (item: T) => number): T;

declare class Plugin_2<TConfig extends PluginConfig = PluginConfig> implements IPlugin {
    readonly id: string;
    readonly pluginName: string;
    private _context;
    private _public;
    private _initialized;
    constructor(id: string, context: PluginContext<TConfig>, publicPlugin: PublicPlugin<TConfig>, pluginName: string);
    get parentPluginId(): string | undefined;
    get publicPlugin(): PublicPlugin<TConfig>;
    getEventBus(): EventBus;
    usePlugin<TConfig extends PluginConfig>(PluginCtor: PluginClassConstructor<TConfig>, config?: TConfig): IPublicPlugin;
    render(): void;
    renderViews(): void;
    init(): void;
    setup(): void;
    update(ts: number, dt: number): void;
    subscribeToEvents(eventBus: EventBus): void;
    onViewAdded(view: View): void;
    onViewRemoved(view: View): void;
    onDataChanged(data: ChangedData): void;
    notifyAboutViewRemoved(view: View): void;
    notifyAboutDataChanged(data: ChangedData): void;
    getViews(name?: string | undefined): View[];
    getView(name: string): View | undefined;
    getViewById(id: string): View | undefined;
    getConfig(): Readonly<PluginConfig>;
    addView(view: View, props?: {
        notify: boolean;
    }): void;
    emit<TEvent>(EventCtor: new (eventData: TEvent) => TEvent, eventData: TEvent): void;
    on<TEvent>(EventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
}
export { Plugin_2 as Plugin }

declare type PluginClassConstructor<TConfig extends PluginConfig> = new (id: string, context: PluginContext<TConfig>, publicPlugin: PublicPlugin<TConfig>, pluginName: string) => Plugin_2<TConfig>;

declare type PluginConfig = Record<string, any>;

declare class PluginContext<TConfig extends PluginConfig> implements IPluginContext {
    readonly id: string;
    parentPlugin?: IPublicPlugin;
    private readonly _registry;
    private readonly _eventBus;
    private readonly _config;
    private readonly _internalEventBus;
    private _setupCallback?;
    private _updateCallback?;
    private _renderCallback?;
    private _subscribeToEventsCallback?;
    private _onViewAddedCallback?;
    private _onViewRemovedCallback?;
    private _onDataChangedCallback?;
    constructor(id: string, registry: Registry, eventBus: EventBus, config: TConfig);
    get internalEventBus(): EventBus;
    setup(callback: () => void): void;
    callSetup(): void;
    update(callback: (ts: number, dt: number) => void): void;
    callUpdate(ts: number, dt: number): void;
    render(callback: () => void): void;
    callRender(): void;
    subscribeToEvents(callback: (eventBus: EventBus) => void): void;
    callSubscribeToEvents(eventBus: EventBus): void;
    onViewAdded(callback: (view: View) => void): void;
    callOnViewAdded(view: View): void;
    onViewRemoved(callback: (view: View) => void): void;
    callOnViewRemoved(view: View): void;
    onDataChanged(callback: (data: ChangedData) => void): void;
    callOnDataChanged(data: ChangedData): void;
    usePlugin<TConfig extends PluginConfig>(PluginCtor: PluginClassConstructor<TConfig>, config?: TConfig): IPublicPlugin;
    getViews(name?: string): Array<View>;
    getView(name: string): View | undefined;
    getViewById(id: string): View | undefined;
    getConfig(): Readonly<TConfig>;
    getEventBus(): EventBus;
    emit<TEvent>(EventCtor: new (eventData: TEvent) => TEvent, eventData: TEvent): void;
}

declare type PluginCtorInfo = {
    pluginName?: string;
    scope?: ViewName;
};

declare type PluginFactory<TConfig extends PluginConfig = {}> = (PluginClassConstructor<TConfig> | PluginFunctionConstructor<TConfig>) & PluginCtorInfo;

declare type PluginFunctionConstructor<TConfig extends PluginConfig> = (context: PluginContext<TConfig>, config: TConfig) => void;

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

declare class PositionProp extends ViewProp<Vec2> {
    get x(): number;
    get y(): number;
    get initialX(): number;
    get initialY(): number;
    progressTo(target: Partial<Point_2>): number;
    set(value: Partial<Point_2>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    projectStyles(): string;
    isTransform(): boolean;
}

declare class PublicPlugin<TConfig extends PluginConfig> implements IPublicPlugin {
    readonly id: string;
    parentContext?: IPluginContext;
    private readonly _registry;
    private readonly _internalEventBus;
    private readonly _context;
    constructor(context: PluginContext<TConfig>, registry: Registry);
    setParentPluginContext(pluginContext: IPluginContext): void;
    addView(view: View, { notify }?: {
        notify: boolean;
    }): void;
    on<TEvent>(EventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
}

declare class Registry {
    private _plugins;
    private _views;
    private _viewsPerPlugin;
    private _viewsToBeCreated;
    private _viewsToBeRemoved;
    private _viewsCreatedInPreviousFrame;
    update(): void;
    private _removeViewById;
    private _getViewById;
    queueNodeToBeCreated(domEl: HTMLElement): void;
    queueNodeToBeRemoved(domEl: HTMLElement): void;
    notifyPluginAboutDataChange(event: DataChangedEvent): void;
    getPlugins(): ReadonlyArray<Plugin_2>;
    getPluginByName(pluginName: string): Plugin_2 | undefined;
    createPlugin<TConfig extends PluginConfig>(pluginFactory: PluginFactory<TConfig>, eventBus: EventBus, config?: TConfig): IPublicPlugin;
    getViews(): ReadonlyArray<View>;
    createView(domEl: HTMLElement, name: string): View;
    addViewToPlugin(view: View, plugin: IPluginRegistry): void;
    getViewsForPlugin(plugin: IPluginRegistry): Array<View>;
    getViewsForPluginByName(plugin: IPluginRegistry, name: string): Array<View>;
}

declare class RotationProp extends ViewProp<number> {
    private _unit;
    get degrees(): number;
    setDegrees(value: number, runAnimation?: boolean): void;
    setRadians(value: number, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    projectStyles(): string;
    isTransform(): boolean;
}

declare class ScaleProp extends ViewProp<Vec2> {
    get x(): number;
    get y(): number;
    set(value: Partial<Point>, runAnimation?: boolean): void;
    setWithSize(value: Partial<Size>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    projectStyles(): string;
    isTransform(): boolean;
}

export declare type Size = {
    width: number;
    height: number;
};

declare class SizeProp extends ViewProp<Vec2> {
    get width(): number;
    get height(): number;
    get initialWidth(): number;
    get initialHeight(): number;
    set(value: Partial<Size>, runAnimation?: boolean): void;
    reset(runAnimation?: boolean): void;
    update(ts: number, dt: number): void;
    projectStyles(): string;
    isTransform(): boolean;
}

declare abstract class SpringAnimator<TValue> implements Animator<TValue> {
    protected _config: SpringAnimatorConfig;
    constructor(config: SpringAnimatorConfig);
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

export declare class SwipeEventPlugin extends Plugin_2 {
    private _viewIsPointerDownMap;
    private _viewPointerPositionLog;
    private _targetPerView;
    subscribeToEvents(eventBus: EventBus): void;
}

declare abstract class TweenAnimator<TValue> implements Animator<TValue> {
    protected _config: TweenAnimatorConfig;
    protected _startTime?: number;
    constructor(config: TweenAnimatorConfig);
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
        valueAtPercentage
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

export declare class View {
    id: string;
    name: string;
    element: HTMLElement;
    styles: Partial<Record<keyof CSSStyleDeclaration, string>>;
    private _viewProps;
    private _rect;
    constructor(element: HTMLElement, name: string);
    get position(): PositionProp;
    get scale(): ScaleProp;
    get rotation(): RotationProp;
    get size(): SizeProp;
    get data(): Record<string, string>;
    setPluginId(id: string): void;
    hasElement(element: HTMLElement): boolean;
    getScroll(): {
        y: number;
        x: number;
    };
    intersects(x: number, y: number): boolean;
    overlapsWith(view: View): boolean;
    distanceTo(view: View): number;
    read(): void;
    get rect(): ViewRect;
    update(ts: number, dt: number): void;
    render(): void;
    private _getUserStyles;
    markAsAdded(): void;
}

declare type ViewName = string;

declare abstract class ViewProp<TValue> implements IViewProp {
    protected _animatorProp: AnimatorProp;
    protected _animator: Animator<TValue>;
    protected _initialValue: TValue;
    protected _targetValue: TValue;
    protected _currentValue: TValue;
    protected _hasChanged: boolean;
    protected _parentView: View;
    protected _animatorFactory: AnimatorFactory<TValue>;
    constructor(animatorFactory: AnimatorFactory<TValue>, initialValue: TValue, parentView: View);
    get animator(): AnimatorProp;
    protected get _rect(): ViewRect;
    setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    protected _setTarget(value: TValue, runAnimation?: boolean): void;
    hasChanged(): boolean;
    update(ts: number, dt: number): void;
    abstract projectStyles(): string;
    abstract isTransform(): boolean;
}

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
    size: {
        width: number;
        height: number;
    };
}

export { }
