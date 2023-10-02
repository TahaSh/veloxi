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

declare class App {
    private _previousTime;
    private readonly _registry;
    private readonly _eventBus;
    static create(): App;
    constructor();
    addPlugin<TConfig extends PluginConfig = PluginConfig>(pluginFactory: PluginFactory<TConfig>, config?: TConfig): void;
    onPluginEvent<TEvent>(pluginFactory: PluginFactory, EventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
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

export declare function createApp(): App;

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

export declare class EventPlugin<TConfig extends PluginConfig = PluginConfig> extends IPlugin<TConfig> {
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
    protected _config: {};
    update(data: AnimatorUpdateData<TValue>): TValue;
}

declare abstract class IPlugin<TConfig extends PluginConfig = PluginConfig> {
    private _registry;
    private _eventBus;
    private _internalEventBus;
    private _initialized;
    private readonly _config;
    private readonly _pluginName;
    private readonly _id;
    constructor(pluginName: string, registry: Registry, eventBus: EventBus, config: TConfig);
    get pluginName(): string;
    get id(): string;
    get config(): TConfig;
    getViews(viewName?: string): Array<View>;
    getView(viewName?: string): View | undefined;
    addView(view: View): void;
    emit<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, eventData: TEvent): void;
    on<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
    useEventPlugin<TConfig extends PluginConfig>(pluginFactory: PluginFactory<TConfig>, config?: TConfig): EventPlugin;
    notifyAboutDataChanged(data: ChangedData): void;
    onDataChanged(data: ChangedData): void;
    notifyAboutViewRemoved(view: View): void;
    onViewRemoved(view: View): void;
    notifyAboutViewAdded(view: View): void;
    onViewAdded(view: View): void;
    init(): void;
    setup(): void;
    subscribeToEvents(eventBus: EventBus): void;
    abstract isRenderable(): boolean;
}

declare interface IViewProp {
    setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(animatorName: TAnimatorName, config?: Partial<AnimatorConfigMap[TAnimatorName]>): void;
    update(ts: number, dt: number): void;
    projectStyles(): string;
    isTransform(): boolean;
    hasChanged(): boolean;
}

declare function minBy<T>(items: Array<T>, predicate: (item: T) => number): T;

declare class Plugin_2<TConfig extends PluginConfig = PluginConfig> extends IPlugin<TConfig> {
    isRenderable(): boolean;
    update(ts: number, dt: number): void;
    render(): void;
    addView(view: View): void;
}
export { Plugin_2 as Plugin }

declare interface PluginClassFactory<TConfig extends PluginConfig = PluginConfig> extends PluginFactoryStaticFields {
    new (pluginName: string, registry: Registry, eventBus: EventBus, config: TConfig): IPlugin<TConfig>;
}

declare type PluginConfig = Record<string, any>;

export declare class PluginContext<TConfig extends PluginConfig = PluginConfig> {
    private _plugin;
    constructor(plugin: Plugin_2<TConfig>);
    get config(): TConfig;
    setup(callback: () => void): void;
    update(callback: (ts: number, dt: number) => void): void;
    render(callback: () => void): void;
    getViews(viewName: string): Array<View>;
    getView(viewName: string): View | undefined;
    useEventPlugin<TConfig extends PluginConfig>(pluginFactory: PluginFactory<TConfig>, config?: TConfig): EventPlugin<PluginConfig>;
    emit<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, eventData: TEvent): void;
    on<TEvent>(eventCtor: new (eventData: TEvent) => TEvent, listener: (eventData: TEvent) => void): void;
    onDataChanged(callback: (data: ChangedData) => void): void;
    onViewRemoved(callback: (view: View) => void): void;
    onViewAdded(callback: (view: View) => void): void;
}

export declare type PluginFactory<TConfig extends PluginConfig = PluginConfig> = PluginClassFactory<TConfig> | PluginFunctionFactory<TConfig>;

declare interface PluginFactoryStaticFields {
    pluginName: string;
    scope?: string;
}

declare interface PluginFunctionFactory<TConfig extends PluginConfig = PluginConfig> extends PluginFactoryStaticFields {
    (context: PluginContext<TConfig>): void;
}

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
    getPlugins(): ReadonlyArray<IPlugin>;
    getRenderablePlugins(): ReadonlyArray<Plugin_2>;
    getPluginByName(pluginName: string): IPlugin | undefined;
    createPlugin<TConfig extends PluginConfig>(pluginFactory: PluginFactory<TConfig>, eventBus: EventBus, config?: TConfig): IPlugin<TConfig>;
    getViews(): ReadonlyArray<View>;
    createView(domEl: HTMLElement, name: string): View;
    addViewToPlugin(view: View, plugin: IPlugin): void;
    getViewsForPlugin(plugin: IPlugin): Array<View>;
    getViewsByNameForPlugin(plugin: IPlugin, viewName: string): Array<View>;
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

export declare class SwipeEventPlugin extends EventPlugin {
    static pluginName: string;
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
    readonly id: string;
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
