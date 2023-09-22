var W = Object.defineProperty;
var G = (o, t, e) => t in o ? W(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var n = (o, t, e) => (G(o, typeof t != "symbol" ? t + "" : t, e), e);
class P {
  constructor(t) {
    n(this, "x");
    n(this, "y");
    n(this, "target");
    this.x = t.x, this.y = t.y, this.target = t.target;
  }
}
class I extends P {
}
class y extends P {
}
class V extends P {
}
class b extends P {
}
class S {
  constructor(t) {
    n(this, "pluginId");
    n(this, "pluginName");
    n(this, "viewName");
    n(this, "dataName");
    n(this, "dataValue");
    this.event = t, this.pluginId = t.pluginId, this.pluginName = t.pluginName, this.viewName = t.viewName, this.dataName = t.dataName, this.dataValue = t.dataValue;
  }
}
function Z(o) {
  return o.replace(/(?:^\w|[A-Z]|\b\w)/g, function(t, e) {
    return e === 0 ? t.toLowerCase() : t.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function J(o) {
  return o.split("").map((t, e) => t.toUpperCase() === t ? `${e !== 0 ? "-" : ""}${t.toLowerCase()}` : t).join("");
}
class C {
  constructor(t) {
    n(this, "node");
    this.node = t.node;
  }
}
class T {
  constructor(t) {
    n(this, "node");
    this.node = t.node;
  }
}
class K {
  constructor(t) {
    n(this, "_eventBus");
    n(this, "_observer");
    this._eventBus = t, this._observer = new MutationObserver(this._handler.bind(this)), this._observer.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeOldValue: !0
    });
  }
  _handler(t) {
    t.forEach((e) => {
      e.addedNodes.forEach((r) => {
        if (!(r instanceof HTMLElement) || r.dataset.velViewId || r.parentElement && typeof r.parentElement.dataset.velAdded < "u")
          return;
        this._eventBus.emitEvent(C, { node: r });
        const a = r.querySelectorAll("[data-vel-plugin]");
        a.length && a.forEach((u) => {
          this._eventBus.emitEvent(C, { node: u });
        });
      }), e.removedNodes.forEach((r) => {
        if (!(r instanceof HTMLElement) || typeof r.dataset.velProcessing < "u")
          return;
        const a = r.querySelectorAll("[data-vel-plugin]");
        a.length && a.forEach((u) => {
          this._eventBus.emitEvent(T, { node: u });
        }), this._eventBus.emitEvent(T, { node: r });
      });
      const i = e.attributeName;
      if (i && /data-vel-data-.+/gi.test(i)) {
        const r = e.target, a = r.dataset.velPluginId || "", u = r.dataset.velPlugin || "", l = r.dataset.velView || "", c = r.getAttribute(i);
        if (c && c !== e.oldValue) {
          const g = Z(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(S, {
            pluginId: a,
            pluginName: u,
            viewName: l,
            dataName: g,
            dataValue: c
          });
        }
      }
    });
  }
}
class Q {
  execute(t) {
    this.call(t);
  }
}
class tt extends Q {
  constructor(e) {
    super();
    n(this, "_handler");
    this._handler = e;
  }
  call(e) {
    this._handler(e);
  }
}
class R {
  constructor() {
    n(this, "_listeners", /* @__PURE__ */ new Map());
  }
  subscribeToEvent(t, e) {
    let i = this._listeners.get(t);
    i || (i = [], this._listeners.set(t, i)), i.push(new tt(e));
  }
  emitEvent(t, e) {
    const i = this._listeners.get(t);
    i && i.forEach((s) => {
      s.execute(e);
    });
  }
  reset() {
    this._listeners.clear();
  }
}
let et = 0;
function M() {
  return et++ + "";
}
class it {
  constructor(t, e, i, s) {
    n(this, "id");
    n(this, "parentPlugin");
    n(this, "_registry");
    n(this, "_eventBus");
    n(this, "_config");
    n(this, "_internalEventBus");
    n(this, "_setupCallback");
    n(this, "_updateCallback");
    n(this, "_renderCallback");
    n(this, "_subscribeToEventsCallback");
    n(this, "_onViewAddedCallback");
    n(this, "_onViewRemovedCallback");
    n(this, "_onDataChangedCallback");
    this.id = t, this._registry = e, this._eventBus = i, this._config = s, this._internalEventBus = new R();
  }
  get internalEventBus() {
    return this._internalEventBus;
  }
  setup(t) {
    this._setupCallback = t;
  }
  callSetup() {
    var t;
    (t = this._setupCallback) == null || t.call(this);
  }
  update(t) {
    this._updateCallback = t;
  }
  callUpdate(t, e) {
    var i;
    (i = this._updateCallback) == null || i.call(this, t, e);
  }
  render(t) {
    this._renderCallback = t;
  }
  callRender() {
    var t;
    (t = this._renderCallback) == null || t.call(this);
  }
  subscribeToEvents(t) {
    this._subscribeToEventsCallback = t;
  }
  callSubscribeToEvents(t) {
    var e;
    (e = this._subscribeToEventsCallback) == null || e.call(this, t);
  }
  onViewAdded(t) {
    this._onViewAddedCallback = t;
  }
  callOnViewAdded(t) {
    var e;
    (e = this._onViewAddedCallback) == null || e.call(this, t);
  }
  onViewRemoved(t) {
    this._onViewRemovedCallback = t;
  }
  callOnViewRemoved(t) {
    var e;
    (e = this._onViewRemovedCallback) == null || e.call(this, t);
  }
  onDataChanged(t) {
    this._onDataChangedCallback = t;
  }
  callOnDataChanged(t) {
    var e;
    (e = this._onDataChangedCallback) == null || e.call(this, t);
  }
  usePlugin(t, e = {}) {
    const i = this._registry.createPlugin(
      t,
      this._eventBus,
      e
    );
    return i.setParentPluginContext(this), i;
  }
  getViews(t) {
    return t ? this._registry.getViewsForPluginByName(
      this,
      t
    ) : this._registry.getViewsForPlugin(this);
  }
  getView(t) {
    var e;
    return (e = this._registry.getViewsForPluginByName(this, t)) == null ? void 0 : e[0];
  }
  getViewById(t) {
    return this._registry.getViews().find((e) => e.id === t);
  }
  getConfig() {
    return this._config;
  }
  getEventBus() {
    return this._eventBus;
  }
  emit(t, e) {
    this._internalEventBus.emitEvent(t, e);
  }
}
class st {
  constructor(t, e) {
    n(this, "id");
    n(this, "parentContext");
    n(this, "_registry");
    n(this, "_internalEventBus");
    n(this, "_context");
    this._registry = e, this._internalEventBus = t.internalEventBus, this.id = t.id, this._context = t;
  }
  setParentPluginContext(t) {
    this.parentContext = t;
  }
  addView(t, { notify: e } = { notify: !1 }) {
    this._registry.addViewToPlugin(t, this), t.setPluginId(this.id), e && this._context.callOnViewAdded(t);
  }
  on(t, e) {
    this._internalEventBus.subscribeToEvent(t, e);
  }
}
class A {
  constructor(t, e, i, s) {
    n(this, "id");
    n(this, "pluginName");
    n(this, "_context");
    n(this, "_public");
    n(this, "_initialized", !1);
    this.id = t, this._context = e, this._context.setup(this.setup), this._context.render(this.render), this._context.update(this.update), this._context.subscribeToEvents(this.subscribeToEvents), this._public = i, this.pluginName = s;
  }
  get parentPluginId() {
    var t;
    return (t = this._public.parentContext) == null ? void 0 : t.id;
  }
  get publicPlugin() {
    return this._public;
  }
  getEventBus() {
    return this._context.getEventBus();
  }
  usePlugin(t, e = {}) {
    return this._context.usePlugin(t, e);
  }
  render() {
    var t;
    (t = this._context) == null || t.callRender();
  }
  renderViews() {
    this._context.getViews().forEach((t) => t.render());
  }
  init() {
    this._initialized || (this.setup(), this._initialized = !0);
  }
  setup() {
    var t;
    (t = this._context) == null || t.callSetup();
  }
  update(t, e) {
    var i;
    (i = this._context) == null || i.callUpdate(t, e);
  }
  subscribeToEvents(t) {
    var e;
    (e = this._context) == null || e.callSubscribeToEvents(t);
  }
  // @ts-ignore
  onViewAdded(t) {
  }
  // @ts-ignore
  onViewRemoved(t) {
  }
  // @ts-ignore
  onDataChanged(t) {
  }
  notifyAboutViewRemoved(t) {
    this._context.callOnViewRemoved(t);
  }
  notifyAboutDataChanged(t) {
    this._context.callOnDataChanged(t);
  }
  getViews(t) {
    return this._context.getViews(t);
  }
  getView(t) {
    return this._context.getView(t);
  }
  getViewById(t) {
    return this._context.getViewById(t);
  }
  getConfig() {
    return this._context.getConfig();
  }
  addView(t, e = { notify: !0 }) {
    this._public.addView(t, { notify: e.notify });
  }
  emit(t, e) {
    this._context.emit(t, e);
  }
  on(t, e) {
    this._public.on(t, e);
  }
}
function nt(o) {
  return typeof o == "function" && o.name === "" ? !1 : o.prototype.constructor.toString().indexOf("class ") === 0;
}
function B(o, t, e, i) {
  const s = M(), r = new it(s, t, e, i), a = new st(r, t), u = o.pluginName ? o.pluginName : o.name;
  if (nt(o)) {
    const c = new o(s, r, a, u);
    return r.onViewAdded(c.onViewAdded.bind(c)), r.onViewRemoved(c.onViewRemoved.bind(c)), r.onDataChanged(c.onDataChanged.bind(c)), c;
  }
  const l = new A(s, r, a, u);
  return o(r, i), l;
}
class h {
  constructor(t, e) {
    n(this, "x");
    n(this, "y");
    this.x = t, this.y = e;
  }
  get magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  get unitVector() {
    const t = new h(0, 0), e = this.magnitude;
    return e !== 0 && (t.x = this.x / e, t.y = this.y / e), t;
  }
  add(t) {
    this.x += t.x, this.y += t.y;
  }
  sub(t) {
    this.x -= t.x, this.y -= t.y;
  }
  scale(t) {
    this.x *= t, this.y *= t;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  equals(t) {
    return this.x === t.x && this.y === t.y;
  }
  clone() {
    return new h(this.x, this.y);
  }
  static scale(t, e) {
    return new h(t.x * e, t.y * e);
  }
  static sub(t, e) {
    return new h(t.x - e.x, t.y - e.y);
  }
  static add(t, e) {
    return new h(t.x + e.x, t.y + e.y);
  }
}
function D(o) {
  const t = rt(o), e = at(o);
  return {
    viewportOffset: {
      left: Math.round(t.left),
      top: Math.round(t.top),
      right: Math.round(t.right),
      bottom: Math.round(t.bottom)
    },
    pageOffset: {
      top: e.top,
      left: e.left
    },
    size: {
      width: o.offsetWidth,
      height: o.offsetHeight
    }
  };
}
function rt(o) {
  const t = o.getBoundingClientRect();
  return {
    left: t.left,
    top: t.top,
    right: t.right,
    bottom: t.bottom,
    width: t.width,
    height: t.height
  };
}
function at(o) {
  let t = o, e = 0, i = 0;
  for (; t; )
    e += t.offsetTop, i += t.offsetLeft, t = t.offsetParent;
  return { top: e, left: i };
}
const m = 0.01, O = {
  speed: 15
};
class L {
  constructor(t) {
    n(this, "_config");
    this._config = t;
  }
}
class ot extends L {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const r = h.sub(i, e), a = h.scale(r, this._config.speed);
    let u = h.add(e, h.scale(a, s));
    return this._shouldFinish(i, e, a) && (u = i, t.callCompleteCallback()), t.callUpdateCallback(), u;
  }
  _shouldFinish(t, e, i) {
    return h.sub(t, e).magnitude < m && i.magnitude < m;
  }
}
class ht extends L {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const a = (i - e) * this._config.speed;
    let u = e + a * s;
    return this._shouldFinish(i, e, a) && (u = i, t.callCompleteCallback()), t.callUpdateCallback(), u;
  }
  _shouldFinish(t, e, i) {
    return Math.abs(t - e) < m && Math.abs(i) < m;
  }
}
class z {
  constructor() {
    n(this, "_config", {});
  }
  update(t) {
    return t.target;
  }
}
const j = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, v = 0.01;
class F {
  constructor(t) {
    n(this, "_config");
    this._config = t;
  }
}
class ut extends F {
  constructor() {
    super(...arguments);
    n(this, "_velocity", new h(0, 0));
  }
  update({ animatorProp: e, current: i, target: s, dt: r }) {
    const a = h.scale(
      h.scale(h.sub(i, s), -1),
      this._config.stiffness
    );
    this._velocity = h.add(this._velocity, a), this._velocity = h.scale(this._velocity, this._config.damping);
    let u = h.add(
      i,
      h.scale(this._velocity, r * this._config.speed)
    );
    return this._shouldFinish(s, i) && (u = s, e.callCompleteCallback()), u;
  }
  _shouldFinish(e, i) {
    return h.sub(e, i).magnitude < v && this._velocity.magnitude < v;
  }
}
class ct extends F {
  constructor() {
    super(...arguments);
    n(this, "_velocity", 0);
  }
  update({ animatorProp: e, current: i, target: s, dt: r }) {
    const a = -(i - s) * this._config.stiffness;
    this._velocity += a, this._velocity *= this._config.damping;
    let u = i + this._velocity * r * this._config.speed;
    return this._shouldFinish(s, i) && (u = s, e.callCompleteCallback()), u;
  }
  _shouldFinish(e, i) {
    return Math.abs(e - i) < v && Math.abs(this._velocity) < v;
  }
}
function lt(o) {
  return o;
}
const $ = {
  duration: 500,
  ease: lt
};
class X {
  constructor(t) {
    n(this, "_config");
    n(this, "_startTime");
    this._config = t;
  }
  reset() {
    this._startTime = void 0;
  }
}
class dt extends X {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const r = Math.min(1, (s - this._startTime) / this._config.duration);
    return r >= 1 && t.callCompleteCallback(), h.add(
      e,
      h.scale(h.sub(i, e), this._config.ease(r))
    );
  }
}
class gt extends X {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const r = Math.min(1, (s - this._startTime) / this._config.duration);
    return r >= 1 && t.callCompleteCallback(), e + (i - e) * this._config.ease(r);
  }
}
class Y {
  createAnimatorByName(t, e) {
    switch (t) {
      case "instant":
        return this.createInstantAnimator();
      case "dynamic":
        return this.createDynamicAnimator(e);
      case "tween":
        return this.createTweenAnimator(e);
      case "spring":
        return this.createSpringAnimator(e);
    }
    return this.createInstantAnimator();
  }
}
class E extends Y {
  createInstantAnimator() {
    return new z();
  }
  createTweenAnimator(t) {
    return new dt({ ...$, ...t });
  }
  createDynamicAnimator(t) {
    return new ot({ ...O, ...t });
  }
  createSpringAnimator(t) {
    return new ut({ ...j, ...t });
  }
}
class _t extends Y {
  createInstantAnimator() {
    return new z();
  }
  createDynamicAnimator(t) {
    return new ht({ ...O, ...t });
  }
  createTweenAnimator(t) {
    return new gt({ ...$, ...t });
  }
  createSpringAnimator(t) {
    return new ct({ ...j, ...t });
  }
}
function pt(o, t) {
  const e = o.map(t), i = Math.min(...e), s = e.indexOf(i);
  return o[s];
}
function U(o, t, e) {
  return Math.min(Math.max(o, t), e);
}
function wt(o, t, e) {
  return o + (t - o) * e;
}
const Tt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clamp: U,
  minBy: pt,
  valueAtPercentage: wt
}, Symbol.toStringTag, { value: "Module" }));
function f(o) {
  return structuredClone(o);
}
class ft {
  constructor(t) {
    n(this, "_viewProp");
    n(this, "_completeCallback");
    n(this, "_updateCallback");
    this._viewProp = t;
  }
  set(t, e) {
    this._viewProp.setAnimator(t, e);
  }
  onComplete(t) {
    this._completeCallback = t;
  }
  callCompleteCallback() {
    var t;
    (t = this._completeCallback) == null || t.call(this);
  }
  onUpdate(t) {
    this._updateCallback = t;
  }
  callUpdateCallback() {
    var t;
    (t = this._updateCallback) == null || t.call(this);
  }
}
class x {
  constructor(t, e, i) {
    n(this, "_animatorProp");
    n(this, "_animator");
    n(this, "_initialValue");
    n(this, "_targetValue");
    n(this, "_currentValue");
    n(this, "_hasChanged");
    n(this, "_parentView");
    n(this, "_animatorFactory");
    this._animatorProp = new ft(this), this._animatorFactory = t, this._initialValue = f(e), this._targetValue = f(e), this._currentValue = f(e), this._hasChanged = !1, this._parentView = i, this._animator = this._animatorFactory.createInstantAnimator();
  }
  get animator() {
    return this._animatorProp;
  }
  get _rect() {
    return this._parentView.rect;
  }
  setAnimator(t, e) {
    this._animator = this._animatorFactory.createAnimatorByName(
      t,
      e
    );
  }
  _setTarget(t, e = !0) {
    var i, s;
    this._initialValue = f(this._currentValue), this._targetValue = t, e ? (s = (i = this._animator).reset) == null || s.call(i) : this._currentValue = t, this._hasChanged = !0;
  }
  hasChanged() {
    return this._hasChanged;
  }
  // @ts-ignore
  update(t, e) {
  }
}
class mt extends x {
  get x() {
    return this._currentValue.x + this._rect.pageOffset.left;
  }
  get y() {
    return this._currentValue.y + this._rect.pageOffset.top;
  }
  get initialX() {
    return this._rect.pageOffset.left;
  }
  get initialY() {
    return this._rect.pageOffset.top;
  }
  progressTo(t) {
    const e = typeof t.x > "u" ? this.initialX : t.x, i = typeof t.y > "u" ? this.initialY : t.y, s = new h(e, i), r = new h(this.initialX, this.initialY), a = new h(this.x, this.y), u = h.sub(s, r), l = h.sub(a, r);
    let c = 0;
    return u.dot(l) > 0 && (c = l.magnitude), U(c / u.magnitude, 0, 1);
  }
  set(t, e = !0) {
    const s = { ...{ x: this.x, y: this.y }, ...t };
    this._setTarget(
      new h(
        s.x - this._rect.pageOffset.left,
        s.y - this._rect.pageOffset.top
      ),
      e
    );
  }
  reset(t = !0) {
    this._setTarget(new h(0, 0), t);
  }
  update(t, e) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._initialValue,
      ts: t,
      dt: e
    }));
  }
  projectStyles() {
    return `translate3d(${this._currentValue.x}px, ${this._currentValue.y}px, 0)`;
  }
  isTransform() {
    return !0;
  }
}
class vt extends x {
  constructor() {
    super(...arguments);
    n(this, "_unit", "deg");
  }
  get degrees() {
    return this._currentValue;
  }
  setDegrees(e, i = !0) {
    this._unit = "deg", this._setTarget(e, i);
  }
  setRadians(e, i = !0) {
    this._unit = "rad", this._setTarget(e, i);
  }
  reset(e = !0) {
    this._setTarget(0, e);
  }
  update(e, i) {
    this._targetValue !== this._currentValue && (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._initialValue,
      ts: e,
      dt: i
    }));
  }
  projectStyles() {
    return `rotate(${this._currentValue}${this._unit})`;
  }
  isTransform() {
    return !0;
  }
}
class Pt extends x {
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(t, e = !0) {
    const s = { ...{ x: this._currentValue.x, y: this._currentValue.y }, ...t };
    this._setTarget(new h(s.x, s.y), e);
  }
  setWithSize(t, e = !0) {
    let i = this._currentValue.x, s = this._currentValue.y;
    t.width && (i = t.width / this._rect.size.width), t.height && (s = t.height / this._rect.size.height), !t.width && t.height && (i = s), !t.height && t.width && (s = i);
    const r = { x: i, y: s };
    this._setTarget(new h(r.x, r.y), e);
  }
  reset(t = !0) {
    this._setTarget(new h(1, 1), t);
  }
  update(t, e) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._initialValue,
      ts: t,
      dt: e
    }));
  }
  projectStyles() {
    return `scale3d(${this._currentValue.x}, ${this._currentValue.y}, 1)`;
  }
  isTransform() {
    return !0;
  }
}
class yt extends x {
  get width() {
    return this._currentValue.x;
  }
  get height() {
    return this._currentValue.y;
  }
  get initialWidth() {
    return this._rect.size.width;
  }
  get initialHeight() {
    return this._rect.size.height;
  }
  set(t, e = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, ...t };
    this._setTarget(new h(s.width, s.height), e);
  }
  reset(t = !0) {
    this._setTarget(
      new h(this.initialWidth, this.initialHeight),
      t
    );
  }
  update(t, e) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._initialValue,
      ts: t,
      dt: e
    }));
  }
  projectStyles() {
    return `width: ${this.width}px; height: ${this.height}px;`;
  }
  isTransform() {
    return !1;
  }
}
class Vt {
  constructor(t) {
    n(this, "_props", /* @__PURE__ */ new Map());
    this._props.set(
      "position",
      new mt(new E(), new h(0, 0), t)
    ), this._props.set(
      "scale",
      new Pt(new E(), new h(1, 1), t)
    ), this._props.set(
      "rotation",
      new vt(new _t(), 0, t)
    ), this._props.set(
      "size",
      new yt(
        new E(),
        new h(t.rect.size.width, t.rect.size.height),
        t
      )
    );
  }
  allProps() {
    return Array.from(this._props.values());
  }
  get position() {
    return this._props.get("position");
  }
  get scale() {
    return this._props.get("scale");
  }
  get rotation() {
    return this._props.get("rotation");
  }
  get size() {
    return this._props.get("size");
  }
}
class bt {
  constructor(t, e) {
    n(this, "id");
    n(this, "name");
    n(this, "element");
    n(this, "styles", {});
    n(this, "_viewProps");
    n(this, "_rect");
    this.id = M(), this.name = e, this.element = t, this._rect = D(this.element), this._viewProps = new Vt(this), this.element.dataset.velViewId = this.id;
  }
  get position() {
    return this._viewProps.position;
  }
  get scale() {
    return this._viewProps.scale;
  }
  get rotation() {
    return this._viewProps.rotation;
  }
  get size() {
    return this._viewProps.size;
  }
  get data() {
    const t = this.element.dataset;
    return Object.keys(t).filter((s) => s.includes("velData")).map((s) => s.replace("velData", "")).map((s) => `${s[0].toLowerCase()}${s.slice(1)}`).reduce((s, r) => {
      const a = t[`velData${r[0].toUpperCase()}${r.slice(1)}`];
      return !s[r] && a && (s[r] = a), s;
    }, {});
  }
  setPluginId(t) {
    this.element.dataset.velPluginId = t;
  }
  hasElement(t) {
    return this.element.contains(t);
  }
  getScroll() {
    let t = this.element, e = 0, i = 0;
    for (; t; )
      e += t.scrollTop, i += t.scrollLeft, t = t.offsetParent;
    return i += window.scrollX, e += window.scrollY, { y: e, x: i };
  }
  intersects(t, e) {
    const i = this.getScroll(), s = {
      x: this.position.x - i.x,
      y: this.position.y - i.y
    };
    return t >= s.x && t <= s.x + this.size.width && e >= s.y && e <= s.y + this.size.height;
  }
  // Using AABB collision detection
  overlapsWith(t) {
    return this.position.x < t.position.x + t.size.width && this.position.x + this.size.width > t.position.x && this.position.y < t.position.y + t.size.height && this.position.y + this.size.height > t.position.y;
  }
  distanceTo(t) {
    const e = new h(this.position.x, this.position.y), i = new h(t.position.x, t.position.y);
    return h.sub(i, e).magnitude;
  }
  read() {
    this._rect = D(this.element);
  }
  get rect() {
    return this._rect;
  }
  update(t, e) {
    this._viewProps.allProps().forEach((i) => i.update(t, e));
  }
  render() {
    let t = "";
    const e = this._viewProps.allProps(), i = e.filter((a) => a.isTransform()), s = e.filter((a) => !a.isTransform()), r = i.reduce((a, u, l) => (a += u.projectStyles(), l === i.length - 1 && (a += ";"), a), "transform: ");
    t += r, s.forEach((a) => {
      a.hasChanged() && (t += a.projectStyles());
    }), t += this._getUserStyles(), this.element.style.cssText = t;
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((t, e) => e ? t + `${J(e)}: ${this.styles[e]};` : t, "");
  }
  markAsAdded() {
    delete this.element.dataset.velProcessing;
  }
}
class xt {
  constructor() {
    n(this, "_plugins", []);
    n(this, "_views", []);
    n(this, "_viewsPerPlugin", /* @__PURE__ */ new Map());
    n(this, "_viewsToBeCreated", []);
    n(this, "_viewsToBeRemoved", []);
    n(this, "_viewsCreatedInPreviousFrame", []);
  }
  update() {
    this._viewsCreatedInPreviousFrame.forEach((i) => {
      i.markAsAdded();
    }), this._viewsCreatedInPreviousFrame = [];
    const t = this._viewsToBeCreated.filter((i) => {
      const s = i.dataset.velPlugin;
      return s ? this.getPluginByName(s) : !1;
    });
    t.length && (t.forEach((i) => {
      const s = i.dataset.velPlugin, r = i.dataset.velView;
      if (!r || !s)
        return;
      const a = this.createView(i, r), u = this.getPluginByName(s);
      u && u.addView(a);
    }), this._viewsToBeCreated = []);
    const e = this._viewsToBeRemoved.filter((i) => i.dataset.velViewId);
    e.length && (e.forEach((i) => {
      const s = i.dataset.velViewId;
      s && this._removeViewById(s);
    }), this._viewsToBeRemoved = []);
  }
  _removeViewById(t) {
    this._plugins.forEach((e) => {
      const i = this._viewsPerPlugin.get(e.id);
      if (!i)
        return;
      const s = i.indexOf(t), r = this._getViewById(t);
      s !== -1 && r && (i.splice(s, 1), e.notifyAboutViewRemoved(r));
    }), this._views = this._views.filter((e) => e.id !== t);
  }
  _getViewById(t) {
    return this._views.find((e) => e.id === t);
  }
  queueNodeToBeCreated(t) {
    this._viewsToBeCreated.push(t);
  }
  queueNodeToBeRemoved(t) {
    this._viewsToBeRemoved.push(t);
  }
  notifyPluginAboutDataChange(t) {
    const e = this._plugins.filter(
      (i) => i.id === t.pluginId
    );
    e && e.forEach((i) => {
      i.notifyAboutDataChanged({
        dataName: t.dataName,
        dataValue: t.dataValue,
        viewName: t.viewName
      });
      const s = this._plugins.find((r) => r.id === i.parentPluginId);
      s && s.notifyAboutDataChanged({
        dataName: t.dataName,
        dataValue: t.dataValue,
        viewName: t.viewName
      });
    });
  }
  getPlugins() {
    return this._plugins;
  }
  getPluginByName(t) {
    return this._plugins.find((e) => e.pluginName === t);
  }
  createPlugin(t, e, i = {}) {
    let s = [];
    if (t.scope) {
      const u = document.querySelectorAll(
        `[data-vel-plugin=${t.name}][data-vel-view=${t.scope}]`
      );
      u ? s = Array.from(u) : s = [document.documentElement];
    } else
      s = [document.documentElement];
    const r = s.map((u) => {
      const l = B(t, this, e, i);
      this._plugins.push(l);
      let c = [];
      u !== document.documentElement && c.push(u);
      const g = u.querySelectorAll(
        `[data-vel-plugin=${l.pluginName}]`
      );
      return c = [...c, ...g], c.length && c.forEach((d) => {
        const _ = d.dataset.velView;
        if (!_)
          return;
        const p = this.createView(d, _);
        l.addView(p, { notify: !1 });
      }), l;
    });
    if (r && r.length > 0)
      return r[0].publicPlugin;
    const a = B(t, this, e, i);
    return console.log(
      `%c WARNING: The plugin "${a.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), a.publicPlugin;
  }
  getViews() {
    return this._views;
  }
  createView(t, e) {
    const i = new bt(t, e);
    return this._views.push(i), this._viewsCreatedInPreviousFrame.push(i), i;
  }
  addViewToPlugin(t, e) {
    this._viewsPerPlugin.has(e.id) || this._viewsPerPlugin.set(e.id, []);
    const i = this._viewsPerPlugin.get(e.id);
    i.includes(t.id) || i.push(t.id);
  }
  getViewsForPlugin(t) {
    const e = this._viewsPerPlugin.get(t.id);
    return e ? e.map((s) => this._views.find((r) => r.id === s)).filter((s) => !!s) : [];
  }
  getViewsForPluginByName(t, e) {
    return this.getViewsForPlugin(t).filter((i) => i.name === e);
  }
}
class q {
  constructor() {
    n(this, "_previousTime", 0);
    n(this, "_registry");
    n(this, "_eventBus");
    this._registry = new xt(), this._eventBus = new R(), new K(this._eventBus);
  }
  static create() {
    return new q();
  }
  addPlugin(t, e = {}) {
    this._registry.createPlugin(t, this._eventBus, e);
  }
  onPluginEvent(t, e, i) {
    const s = this._registry.getPluginByName(t.name);
    s && s.on(e, i);
  }
  run() {
    document.addEventListener("DOMContentLoaded", () => {
      this._setup(), requestAnimationFrame(this._tick.bind(this));
    });
  }
  _setup() {
    this._listenToNativeEvents();
  }
  _listenToNativeEvents() {
    document.addEventListener("click", (t) => {
      this._eventBus.emitEvent(I, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointermove", (t) => {
      this._eventBus.emitEvent(y, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerdown", (t) => {
      this._eventBus.emitEvent(V, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerup", (t) => {
      this._eventBus.emitEvent(b, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    });
  }
  _tick(t) {
    let e = (t - this._previousTime) / 1e3;
    e > 0.016 && (e = 1 / 60), this._previousTime = t, this._eventBus.reset(), this._subscribeToEvents(), this._read(), this._update(t, e), this._render(), requestAnimationFrame(this._tick.bind(this));
  }
  _subscribeToEvents() {
    this._eventBus.subscribeToEvent(
      C,
      this._onNodeAdded.bind(this)
    ), this._eventBus.subscribeToEvent(
      T,
      this._onNodeRemoved.bind(this)
    ), this._eventBus.subscribeToEvent(
      S,
      this._onDataChanged.bind(this)
    ), this._registry.getPlugins().forEach((t) => {
      t.subscribeToEvents(this._eventBus);
    });
  }
  _onNodeAdded({ node: t }) {
    this._registry.queueNodeToBeCreated(t);
  }
  _onNodeRemoved({ node: t }) {
    this._registry.queueNodeToBeRemoved(t);
  }
  _onDataChanged(t) {
    this._registry.notifyPluginAboutDataChange(t);
  }
  _read() {
    this._registry.getViews().forEach((t) => {
      t.read();
    });
  }
  _update(t, e) {
    this._registry.update(), this._registry.getPlugins().slice().reverse().forEach((i) => {
      i.init();
    }), this._registry.getPlugins().forEach((i) => {
      i.update(t, e);
    }), this._registry.getViews().forEach((i) => {
      i.update(t, e);
    });
  }
  _render() {
    this._registry.getPlugins().forEach((t) => {
      t.render(), t.renderViews();
    });
  }
}
class N {
  constructor(t) {
    n(this, "view");
    n(this, "previousX");
    n(this, "previousY");
    n(this, "x");
    n(this, "y");
    n(this, "isDragging");
    n(this, "target");
    n(this, "directions", []);
    n(this, "width");
    n(this, "height");
    this.props = t, this.previousX = t.previousX, this.previousY = t.previousY, this.x = t.x, this.y = t.y, this.width = t.width, this.height = t.height, this.view = t.view, this.isDragging = t.isDragging, this.target = t.target, this.directions = t.directions;
  }
}
class At extends A {
  constructor() {
    super(...arguments);
    n(this, "_pointerX", 0);
    n(this, "_pointerY", 0);
    n(this, "_initialPointer", new h(0, 0));
    n(this, "_initialPointerPerView", /* @__PURE__ */ new Map());
    n(this, "_pointerDownPerView", /* @__PURE__ */ new Map());
    n(this, "_targetPerView", /* @__PURE__ */ new Map());
    n(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
  }
  setup() {
    document.addEventListener("selectstart", this.onSelect.bind(this));
  }
  onSelect(e) {
    this._isDragging && e.preventDefault();
  }
  get _isDragging() {
    return Array.from(this._pointerDownPerView.values()).some(
      (e) => !!e
    );
  }
  subscribeToEvents(e) {
    e.subscribeToEvent(V, ({ x: i, y: s, target: r }) => {
      this._initialPointer = new h(i, s), this.getViews().forEach((a) => {
        this._pointerDownPerView.set(a.id, a.intersects(i, s)), this._targetPerView.set(a.id, r);
        const u = new h(
          i - a.position.x,
          s - a.position.y
        );
        this._pointerX = i, this._pointerY = s, this._initialPointerPerView.set(a.id, u);
      });
    }), e.subscribeToEvent(b, () => {
      this.getViews().forEach((i) => {
        this._pointerDownPerView.get(i.id) && this._initialPointerPerView.get(i.id) && (this._pointerDownPerView.set(i.id, !1), this._emitEvent(i, [])), this._viewPointerPositionLog.clear();
      });
    }), e.subscribeToEvent(y, ({ x: i, y: s }) => {
      this._pointerX = i, this._pointerY = s, this.getViews().forEach((r) => {
        if (this._pointerDownPerView.get(r.id) && this._initialPointerPerView.get(r.id)) {
          this._viewPointerPositionLog.has(r.id) || this._viewPointerPositionLog.set(r.id, []);
          const a = new h(i, s), u = this._viewPointerPositionLog.get(r.id);
          u && u.push(new h(i, s));
          const l = u && u.length >= 2 ? u[u.length - 2] : a.clone(), c = this._calculateDirections(
            l,
            a
          );
          this._emitEvent(r, c);
        }
      });
    });
  }
  _emitEvent(e, i) {
    const s = this._viewPointerPositionLog.get(e.id), r = s && s.length >= 2 ? s[s.length - 2] : null, a = this._pointerX - this._initialPointerPerView.get(e.id).x, u = this._pointerY - this._initialPointerPerView.get(e.id).y, l = r ? r.x - this._initialPointerPerView.get(e.id).x : a, c = r ? r.y - this._initialPointerPerView.get(e.id).y : u, g = this._pointerY - this._initialPointer.y, d = this._pointerX - this._initialPointer.x, _ = this._targetPerView.get(e.id);
    if (!_ || !e.hasElement(_))
      return;
    const p = this._pointerDownPerView.get(e.id) === !0, w = {
      view: e,
      target: _,
      previousX: l,
      previousY: c,
      x: a,
      y: u,
      width: d,
      height: g,
      isDragging: p,
      directions: i
    };
    this.getEventBus().emitEvent(N, w), this.emit(N, w);
  }
  _calculateDirections(e, i) {
    const s = {
      up: h.sub(new h(e.x, e.y - 1), e),
      down: h.sub(new h(e.x, e.y + 1), e),
      left: h.sub(new h(e.x - 1, e.y), e),
      right: h.sub(new h(e.x + 1, e.y), e)
    }, r = h.sub(i, e).unitVector;
    return [
      { direction: "up", projection: r.dot(s.up) },
      {
        direction: "down",
        projection: r.dot(s.down)
      },
      {
        direction: "left",
        projection: r.dot(s.left)
      },
      {
        direction: "right",
        projection: r.dot(s.right)
      }
    ].filter(
      (l) => l.projection > 0
    ).map(
      (l) => l.direction
    );
  }
}
class k {
  constructor(t) {
    n(this, "view");
    n(this, "direction");
    this.props = t, this.view = t.view, this.direction = t.direction;
  }
}
class Bt extends A {
  constructor() {
    super(...arguments);
    n(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map());
    n(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    n(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(e) {
    e.subscribeToEvent(V, ({ x: i, y: s, target: r }) => {
      this.getViews().forEach((a) => {
        this._targetPerView.set(a.id, r), a.intersects(i, s) && this._viewIsPointerDownMap.set(a.id, !0);
      });
    }), e.subscribeToEvent(y, ({ x: i, y: s }) => {
      this.getViews().forEach((r) => {
        if (!this._viewIsPointerDownMap.get(r.id))
          return;
        this._viewPointerPositionLog.has(r.id) || this._viewPointerPositionLog.set(r.id, []), this._viewPointerPositionLog.get(r.id).push(new h(i, s));
      });
    }), e.subscribeToEvent(b, ({ x: i, y: s }) => {
      this.getViews().forEach((a) => {
        if (!this._viewIsPointerDownMap.get(a.id) || !this._viewPointerPositionLog.has(a.id))
          return;
        const u = new h(i, s), l = this._viewPointerPositionLog.get(a.id), c = l[l.length - 2] || u.clone(), g = this._targetPerView.get(a.id), d = r(c, u);
        g && a.hasElement(g) && d.hasSwiped && (this.getEventBus().emitEvent(k, {
          view: a,
          direction: d.direction
        }), this.emit(k, {
          view: a,
          direction: d.direction
        })), this._viewPointerPositionLog.set(a.id, []), this._viewIsPointerDownMap.set(a.id, !1);
      });
      function r(a, u) {
        const l = {
          up: h.sub(new h(a.x, a.y - 1), a),
          down: h.sub(new h(a.x, a.y + 1), a),
          left: h.sub(new h(a.x - 1, a.y), a),
          right: h.sub(new h(a.x + 1, a.y), a)
        }, c = h.sub(u, a).unitVector, g = [
          "up",
          "down",
          "left",
          "right"
        ], d = [
          c.dot(l.up),
          c.dot(l.down),
          c.dot(l.left),
          c.dot(l.right)
        ], _ = Math.max(...d), p = d.indexOf(_), w = g[p], H = h.sub(u, a).magnitude;
        return {
          hasSwiped: c.dot(l[w]) * H > 30,
          direction: w
        };
      }
    });
  }
}
const Dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: I,
  PointerDownEvent: V,
  PointerMoveEvent: y,
  PointerUpEvent: b
}, Symbol.toStringTag, { value: "Module" }));
export {
  q as App,
  S as DataChangedEvent,
  N as DragEvent,
  At as DragEventPlugin,
  R as EventBus,
  Dt as Events,
  A as Plugin,
  k as SwipeEvent,
  Bt as SwipeEventPlugin,
  Tt as Utils,
  bt as View
};
