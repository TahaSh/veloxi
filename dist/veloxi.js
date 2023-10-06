var H = Object.defineProperty;
var W = (o, t, e) => t in o ? H(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var r = (o, t, e) => (W(o, typeof t != "symbol" ? t + "" : t, e), e);
class P {
  constructor(t) {
    r(this, "x");
    r(this, "y");
    r(this, "target");
    this.x = t.x, this.y = t.y, this.target = t.target;
  }
}
class B extends P {
}
class y extends P {
}
class V extends P {
}
class b extends P {
}
class S {
  constructor(t) {
    r(this, "pluginId");
    r(this, "pluginName");
    r(this, "viewName");
    r(this, "dataName");
    r(this, "dataValue");
    this.event = t, this.pluginId = t.pluginId, this.pluginName = t.pluginName, this.viewName = t.viewName, this.dataName = t.dataName, this.dataValue = t.dataValue;
  }
}
function G(o) {
  return o.replace(/(?:^\w|[A-Z]|\b\w)/g, function(t, e) {
    return e === 0 ? t.toLowerCase() : t.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function Z(o) {
  return o.split("").map((t, e) => t.toUpperCase() === t ? `${e !== 0 ? "-" : ""}${t.toLowerCase()}` : t).join("");
}
class T {
  constructor(t) {
    r(this, "node");
    this.node = t.node;
  }
}
class A {
  constructor(t) {
    r(this, "node");
    this.node = t.node;
  }
}
class J {
  constructor(t) {
    r(this, "_eventBus");
    r(this, "_observer");
    this._eventBus = t, this._observer = new MutationObserver(this._handler.bind(this)), this._observer.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeOldValue: !0
    });
  }
  _handler(t) {
    t.forEach((e) => {
      e.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement) || n.dataset.velViewId || n.parentElement && typeof n.parentElement.dataset.velAdded < "u")
          return;
        this._eventBus.emitEvent(T, { node: n });
        const a = n.querySelectorAll("[data-vel-plugin]");
        a.length && a.forEach((h) => {
          this._eventBus.emitEvent(T, { node: h });
        });
      }), e.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement) || typeof n.dataset.velProcessing < "u")
          return;
        const a = n.querySelectorAll("[data-vel-plugin]");
        a.length && a.forEach((h) => {
          this._eventBus.emitEvent(A, { node: h });
        }), this._eventBus.emitEvent(A, { node: n });
      });
      const i = e.attributeName;
      if (i && /data-vel-data-.+/gi.test(i)) {
        const n = e.target, a = n.dataset.velPluginId || "", h = n.dataset.velPlugin || "", l = n.dataset.velView || "", c = n.getAttribute(i);
        if (c && c !== e.oldValue) {
          const d = G(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(S, {
            pluginId: a,
            pluginName: h,
            viewName: l,
            dataName: d,
            dataValue: c
          });
        }
      }
    });
  }
}
class K {
  execute(t) {
    this.call(t);
  }
}
class Q extends K {
  constructor(e) {
    super();
    r(this, "_handler");
    this._handler = e;
  }
  call(e) {
    this._handler(e);
  }
}
class I {
  constructor() {
    r(this, "_listeners", /* @__PURE__ */ new Map());
  }
  subscribeToEvent(t, e) {
    let i = this._listeners.get(t);
    i || (i = [], this._listeners.set(t, i)), i.push(new Q(e));
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
let tt = 0;
function R() {
  return tt++ + "";
}
class M {
  constructor(t, e, i, s) {
    r(this, "_registry");
    r(this, "_eventBus");
    r(this, "_internalEventBus");
    r(this, "_initialized", !1);
    r(this, "_config");
    r(this, "_pluginName");
    r(this, "_id");
    this._id = R(), this._pluginName = t, this._registry = e, this._eventBus = i, this._internalEventBus = new I(), this._config = s;
  }
  get pluginName() {
    return this._pluginName;
  }
  get id() {
    return this._id;
  }
  get config() {
    return { ...this._config };
  }
  getViews(t) {
    return t ? this._registry.getViewsByNameForPlugin(this, t) : this._registry.getViewsForPlugin(this);
  }
  getView(t) {
    return t ? this._registry.getViewsByNameForPlugin(this, t)[0] : this._registry.getViewsForPlugin(this)[0];
  }
  addView(t) {
    this._registry.addViewToPlugin(t, this);
  }
  emit(t, e) {
    this._internalEventBus.emitEvent(t, e);
  }
  on(t, e) {
    this._internalEventBus.subscribeToEvent(t, e);
  }
  useEventPlugin(t, e = {}) {
    return this._registry.createPlugin(
      t,
      this._eventBus,
      e
    );
  }
  notifyAboutDataChanged(t) {
    this.onDataChanged(t);
  }
  // @ts-ignore
  onDataChanged(t) {
  }
  notifyAboutViewRemoved(t) {
    this.onViewRemoved(t);
  }
  // @ts-ignore
  onViewRemoved(t) {
  }
  notifyAboutViewAdded(t) {
    this.onViewAdded(t);
  }
  // @ts-ignore
  onViewAdded(t) {
  }
  init() {
    this._initialized || (this.setup(), this._initialized = !0);
  }
  setup() {
  }
  // @ts-ignore
  subscribeToEvents(t) {
  }
}
class et extends M {
  isRenderable() {
    return !0;
  }
  // @ts-ignore
  update(t, e) {
  }
  render() {
  }
  addView(t) {
    t.setPluginId(this.id), super.addView(t);
  }
}
class L extends M {
  isRenderable() {
    return !1;
  }
}
class it {
  constructor(t) {
    r(this, "_plugin");
    this._plugin = t;
  }
  get config() {
    return this._plugin.config;
  }
  setup(t) {
    this._plugin.setup = t;
  }
  update(t) {
    this._plugin.update = t;
  }
  render(t) {
    this._plugin.render = t;
  }
  getViews(t) {
    return this._plugin.getViews(t);
  }
  getView(t) {
    return this._plugin.getView(t);
  }
  useEventPlugin(t, e = {}) {
    return this._plugin.useEventPlugin(t, e);
  }
  emit(t, e) {
    this._plugin.emit(t, e);
  }
  on(t, e) {
    this._plugin.on(t, e);
  }
  onDataChanged(t) {
    this._plugin.onDataChanged = t;
  }
  onViewRemoved(t) {
    this._plugin.onViewRemoved = t;
  }
  onViewAdded(t) {
    this._plugin.onViewAdded = t;
  }
  subscribeToEvents(t) {
    this._plugin.subscribeToEvents = t;
  }
}
function N(o, t, e, i) {
  if (st(o))
    return new o(
      o.pluginName,
      t,
      e,
      i
    );
  const s = new et(
    o.pluginName,
    t,
    e,
    i
  ), n = new it(s);
  return o(n), s;
}
function st(o) {
  var t;
  return ((t = o.prototype) == null ? void 0 : t.constructor.toString().indexOf("class ")) === 0;
}
class u {
  constructor(t, e) {
    r(this, "x");
    r(this, "y");
    this.x = t, this.y = e;
  }
  get magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  get unitVector() {
    const t = new u(0, 0), e = this.magnitude;
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
    return new u(this.x, this.y);
  }
  static scale(t, e) {
    return new u(t.x * e, t.y * e);
  }
  static sub(t, e) {
    return new u(t.x - e.x, t.y - e.y);
  }
  static add(t, e) {
    return new u(t.x + e.x, t.y + e.y);
  }
}
function D(o) {
  const t = nt(o), e = rt(o);
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
function nt(o) {
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
function rt(o) {
  let t = o, e = 0, i = 0;
  for (; t; )
    e += t.offsetTop, i += t.offsetLeft, t = t.offsetParent;
  return { top: e, left: i };
}
const m = 0.01, k = {
  speed: 15
};
class O {
  constructor(t) {
    r(this, "_config");
    this._config = t;
  }
}
class at extends O {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const n = u.sub(i, e), a = u.scale(n, this._config.speed);
    let h = u.add(e, u.scale(a, s));
    return this._shouldFinish(i, e, a) && (h = i, t.callCompleteCallback()), t.callUpdateCallback(), h;
  }
  _shouldFinish(t, e, i) {
    return u.sub(t, e).magnitude < m && i.magnitude < m;
  }
}
class ot extends O {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const a = (i - e) * this._config.speed;
    let h = e + a * s;
    return this._shouldFinish(i, e, a) && (h = i, t.callCompleteCallback()), t.callUpdateCallback(), h;
  }
  _shouldFinish(t, e, i) {
    return Math.abs(t - e) < m && Math.abs(i) < m;
  }
}
class j {
  constructor() {
    r(this, "_config", {});
  }
  update(t) {
    return t.target;
  }
}
const z = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, v = 0.01;
class $ {
  constructor(t) {
    r(this, "_config");
    this._config = t;
  }
}
class ut extends $ {
  constructor() {
    super(...arguments);
    r(this, "_velocity", new u(0, 0));
  }
  update({ animatorProp: e, current: i, target: s, dt: n }) {
    const a = u.scale(
      u.scale(u.sub(i, s), -1),
      this._config.stiffness
    );
    this._velocity = u.add(this._velocity, a), this._velocity = u.scale(this._velocity, this._config.damping);
    let h = u.add(
      i,
      u.scale(this._velocity, n * this._config.speed)
    );
    return this._shouldFinish(s, i) && (h = s, e.callCompleteCallback()), h;
  }
  _shouldFinish(e, i) {
    return u.sub(e, i).magnitude < v && this._velocity.magnitude < v;
  }
}
class ht extends $ {
  constructor() {
    super(...arguments);
    r(this, "_velocity", 0);
  }
  update({ animatorProp: e, current: i, target: s, dt: n }) {
    const a = -(i - s) * this._config.stiffness;
    this._velocity += a, this._velocity *= this._config.damping;
    let h = i + this._velocity * n * this._config.speed;
    return this._shouldFinish(s, i) && (h = s, e.callCompleteCallback()), h;
  }
  _shouldFinish(e, i) {
    return Math.abs(e - i) < v && Math.abs(this._velocity) < v;
  }
}
function lt(o) {
  return o;
}
const F = {
  duration: 500,
  ease: lt
};
class X {
  constructor(t) {
    r(this, "_config");
    r(this, "_startTime");
    this._config = t;
  }
  reset() {
    this._startTime = void 0;
  }
}
class ct extends X {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return n >= 1 && t.callCompleteCallback(), u.add(
      e,
      u.scale(u.sub(i, e), this._config.ease(n))
    );
  }
}
class dt extends X {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return n >= 1 && t.callCompleteCallback(), e + (i - e) * this._config.ease(n);
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
    return new j();
  }
  createTweenAnimator(t) {
    return new ct({ ...F, ...t });
  }
  createDynamicAnimator(t) {
    return new at({ ...k, ...t });
  }
  createSpringAnimator(t) {
    return new ut({ ...z, ...t });
  }
}
class gt extends Y {
  createInstantAnimator() {
    return new j();
  }
  createDynamicAnimator(t) {
    return new ot({ ...k, ...t });
  }
  createTweenAnimator(t) {
    return new dt({ ...F, ...t });
  }
  createSpringAnimator(t) {
    return new ht({ ...z, ...t });
  }
}
function _t(o, t) {
  const e = o.map(t), i = Math.min(...e), s = e.indexOf(i);
  return o[s];
}
function q(o, t, e) {
  return Math.min(Math.max(o, t), e);
}
function pt(o, t, e) {
  return o + (t - o) * e;
}
const Dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clamp: q,
  minBy: _t,
  valueAtPercentage: pt
}, Symbol.toStringTag, { value: "Module" }));
function w(o) {
  return structuredClone(o);
}
class wt {
  constructor(t) {
    r(this, "_viewProp");
    r(this, "_completeCallback");
    r(this, "_updateCallback");
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
    r(this, "_animatorProp");
    r(this, "_animator");
    r(this, "_initialValue");
    r(this, "_previousValue");
    r(this, "_targetValue");
    r(this, "_currentValue");
    r(this, "_hasChanged");
    r(this, "_view");
    r(this, "_animatorFactory");
    this._animatorProp = new wt(this), this._animatorFactory = t, this._initialValue = w(e), this._previousValue = w(e), this._targetValue = w(e), this._currentValue = w(e), this._hasChanged = !1, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
  }
  get animator() {
    return this._animatorProp;
  }
  get _rect() {
    return this._view.rect;
  }
  setAnimator(t, e) {
    this._animator = this._animatorFactory.createAnimatorByName(
      t,
      e
    );
  }
  _setTarget(t, e = !0) {
    var i, s;
    this._previousValue = w(this._currentValue), this._targetValue = t, e ? (s = (i = this._animator).reset) == null || s.call(i) : this._currentValue = t, this._hasChanged = !0;
  }
  hasChanged() {
    return this._hasChanged;
  }
  // @ts-ignore
  update(t, e) {
  }
}
class ft extends x {
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
    const e = typeof t.x > "u" ? this.initialX : t.x, i = typeof t.y > "u" ? this.initialY : t.y, s = new u(e, i), n = new u(this.initialX, this.initialY), a = new u(this.x, this.y), h = u.sub(s, n), l = u.sub(a, n);
    let c = 0;
    return h.dot(l) > 0 && (c = l.magnitude), q(c / h.magnitude, 0, 1);
  }
  set(t, e = !0) {
    const s = { ...{ x: this.x, y: this.y }, ...t };
    this._setTarget(
      new u(
        s.x - this._rect.pageOffset.left,
        s.y - this._rect.pageOffset.top
      ),
      e
    );
  }
  reset(t = !0) {
    this._setTarget(new u(0, 0), t);
  }
  update(t, e) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
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
class mt extends x {
  constructor() {
    super(...arguments);
    r(this, "_unit", "deg");
  }
  get degrees() {
    let e = this._currentValue;
    return this._unit === "rad" && (e = e * (180 / Math.PI)), e;
  }
  get radians() {
    let e = this._currentValue;
    return this._unit === "deg" && (e = e * (Math.PI / 180)), e;
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
      initial: this._previousValue,
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
class vt extends x {
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(t, e = !0) {
    const s = { ...{ x: this._currentValue.x, y: this._currentValue.y }, ...t };
    this._setTarget(new u(s.x, s.y), e);
  }
  setWithSize(t, e = !0) {
    let i = this._currentValue.x, s = this._currentValue.y;
    t.width && (i = t.width / this._rect.size.width), t.height && (s = t.height / this._rect.size.height), !t.width && t.height && (i = s), !t.height && t.width && (s = i);
    const n = { x: i, y: s };
    this._setTarget(new u(n.x, n.y), e);
  }
  reset(t = !0) {
    this._setTarget(new u(1, 1), t);
  }
  update(t, e) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
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
class Pt extends x {
  get width() {
    return this._currentValue.x;
  }
  get height() {
    return this._currentValue.y;
  }
  get widthAfterScale() {
    const t = this._view.scale.x;
    return this._currentValue.x * t;
  }
  get heightAfterScale() {
    const t = this._view.scale.y;
    return this._currentValue.y * t;
  }
  get initialWidth() {
    return this._initialValue.x;
  }
  get initialHeight() {
    return this._initialValue.y;
  }
  set(t, e = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, ...t };
    this._setTarget(new u(s.width, s.height), e);
  }
  reset(t = !0) {
    this._setTarget(
      new u(this.initialWidth, this.initialHeight),
      t
    );
  }
  update(t, e) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
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
class yt {
  constructor(t) {
    r(this, "_props", /* @__PURE__ */ new Map());
    this._props.set(
      "position",
      new ft(new E(), new u(0, 0), t)
    ), this._props.set(
      "scale",
      new vt(new E(), new u(1, 1), t)
    ), this._props.set(
      "rotation",
      new mt(new gt(), 0, t)
    ), this._props.set(
      "size",
      new Pt(
        new E(),
        new u(t.rect.size.width, t.rect.size.height),
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
class Vt {
  constructor(t, e) {
    r(this, "id");
    r(this, "name");
    r(this, "element");
    r(this, "styles", {});
    r(this, "_viewProps");
    r(this, "_rect");
    this.id = R(), this.name = e, this.element = t, this._rect = D(this.element), this._viewProps = new yt(this), this.element.dataset.velViewId = this.id;
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
    return Object.keys(t).filter((s) => s.includes("velData")).map((s) => s.replace("velData", "")).map((s) => `${s[0].toLowerCase()}${s.slice(1)}`).reduce((s, n) => {
      const a = t[`velData${n[0].toUpperCase()}${n.slice(1)}`];
      return !s[n] && a && (s[n] = a), s;
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
    return t >= s.x && t <= s.x + this.size.widthAfterScale && e >= s.y && e <= s.y + this.size.heightAfterScale;
  }
  // Using AABB collision detection
  overlapsWith(t) {
    return this.position.x < t.position.x + t.size.width && this.position.x + this.size.width > t.position.x && this.position.y < t.position.y + t.size.height && this.position.y + this.size.height > t.position.y;
  }
  distanceTo(t) {
    const e = new u(this.position.x, this.position.y), i = new u(t.position.x, t.position.y);
    return u.sub(i, e).magnitude;
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
    const e = this._viewProps.allProps(), i = e.filter((a) => a.isTransform()), s = e.filter((a) => !a.isTransform()), n = i.reduce((a, h, l) => (a += h.projectStyles(), l === i.length - 1 && (a += ";"), a), "transform: ");
    t += n, s.forEach((a) => {
      a.hasChanged() && (t += a.projectStyles());
    }), t += this._getUserStyles(), this.element.style.cssText = t;
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((t, e) => e ? t + `${Z(e)}: ${this.styles[e]};` : t, "");
  }
  markAsAdded() {
    delete this.element.dataset.velProcessing;
  }
}
class bt {
  constructor() {
    r(this, "_plugins", []);
    r(this, "_views", []);
    r(this, "_viewsPerPlugin", /* @__PURE__ */ new Map());
    r(this, "_viewsToBeCreated", []);
    r(this, "_viewsToBeRemoved", []);
    r(this, "_viewsCreatedInPreviousFrame", []);
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
      const s = i.dataset.velPlugin, n = i.dataset.velView;
      if (!n || !s)
        return;
      const a = this.createView(i, n), h = this.getPluginByName(s);
      h && h.addView(a);
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
      const s = i.indexOf(t), n = this._getViewById(t);
      s !== -1 && n && (i.splice(s, 1), e.notifyAboutViewRemoved(n));
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
    !e || !e.length || e.forEach((i) => {
      i.notifyAboutDataChanged({
        dataName: t.dataName,
        dataValue: t.dataValue,
        viewName: t.viewName
      });
    });
  }
  getPlugins() {
    return this._plugins;
  }
  getRenderablePlugins() {
    function t(e) {
      return e.isRenderable();
    }
    return this._plugins.filter(t);
  }
  getPluginByName(t) {
    return this._plugins.find((e) => e.pluginName === t);
  }
  createPlugin(t, e, i = {}) {
    if (!t.pluginName)
      throw Error(
        `Plugin ${t.name} must contain a pluginName field`
      );
    let s = [];
    if (t.scope) {
      const h = document.querySelectorAll(
        `[data-vel-plugin=${t.pluginName}][data-vel-view=${t.scope}]`
      );
      h ? s = Array.from(h) : s = [document.documentElement];
    } else
      s = [document.documentElement];
    const n = s.map((h) => {
      const l = N(
        t,
        this,
        e,
        i
      );
      this._plugins.push(l);
      let c = [];
      h !== document.documentElement && c.push(h);
      const d = h.querySelectorAll(
        `[data-vel-plugin=${l.pluginName}]`
      );
      return c = [...c, ...d], c.length && c.forEach((g) => {
        const _ = g.dataset.velView;
        if (!_)
          return;
        const p = this.createView(g, _);
        l.addView(p), l.notifyAboutViewAdded(p);
      }), l;
    });
    if (n && n.length > 0)
      return n[0];
    const a = N(t, this, e, i);
    return console.log(
      `%c WARNING: The plugin "${a.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), a;
  }
  getViews() {
    return this._views;
  }
  createView(t, e) {
    const i = new Vt(t, e);
    return this._views.push(i), this._viewsCreatedInPreviousFrame.push(i), i;
  }
  addViewToPlugin(t, e) {
    this._viewsPerPlugin.has(e.id) || this._viewsPerPlugin.set(e.id, []);
    const i = this._viewsPerPlugin.get(e.id);
    i.includes(t.id) || i.push(t.id);
  }
  getViewsForPlugin(t) {
    const e = this._viewsPerPlugin.get(t.id);
    return e ? e.map((s) => this._views.find((n) => n.id === s)).filter((s) => !!s) : [];
  }
  getViewsByNameForPlugin(t, e) {
    return this.getViewsForPlugin(t).filter(
      (i) => i.name === e
    );
  }
}
class C {
  constructor() {
    r(this, "_previousTime", 0);
    r(this, "_registry");
    r(this, "_eventBus");
    this._registry = new bt(), this._eventBus = new I(), new J(this._eventBus);
  }
  static create() {
    return new C();
  }
  addPlugin(t, e = {}) {
    this._registry.createPlugin(t, this._eventBus, e);
  }
  onPluginEvent(t, e, i) {
    const s = this._registry.getPluginByName(t.pluginName);
    s && s.on(e, i);
  }
  run() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", this._start.bind(this)) : this._start();
  }
  _start() {
    this._setup(), requestAnimationFrame(this._tick.bind(this));
  }
  _setup() {
    this._listenToNativeEvents();
  }
  _listenToNativeEvents() {
    document.addEventListener("click", (t) => {
      this._eventBus.emitEvent(B, {
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
      T,
      this._onNodeAdded.bind(this)
    ), this._eventBus.subscribeToEvent(
      A,
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
    }), this._registry.getRenderablePlugins().forEach((i) => {
      i.update(t, e);
    }), this._registry.getViews().forEach((i) => {
      i.update(t, e);
    });
  }
  _render() {
    this._registry.getRenderablePlugins().forEach((t) => {
      t.render();
    }), this._registry.getViews().forEach((t) => {
      t.render();
    });
  }
}
function Bt() {
  return C.create();
}
class xt {
  constructor(t) {
    r(this, "view");
    r(this, "previousX");
    r(this, "previousY");
    r(this, "x");
    r(this, "y");
    r(this, "isDragging");
    r(this, "target");
    r(this, "directions", []);
    r(this, "width");
    r(this, "height");
    this.props = t, this.previousX = t.previousX, this.previousY = t.previousY, this.x = t.x, this.y = t.y, this.width = t.width, this.height = t.height, this.view = t.view, this.isDragging = t.isDragging, this.target = t.target, this.directions = t.directions;
  }
}
class Et extends L {
  constructor() {
    super(...arguments);
    r(this, "_pointerX", 0);
    r(this, "_pointerY", 0);
    r(this, "_initialPointer", new u(0, 0));
    r(this, "_initialPointerPerView", /* @__PURE__ */ new Map());
    r(this, "_pointerDownPerView", /* @__PURE__ */ new Map());
    r(this, "_targetPerView", /* @__PURE__ */ new Map());
    r(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
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
    e.subscribeToEvent(V, ({ x: i, y: s, target: n }) => {
      this._initialPointer = new u(i, s), this.getViews().forEach((a) => {
        this._pointerDownPerView.set(a.id, a.intersects(i, s)), this._targetPerView.set(a.id, n);
        const h = new u(
          i - a.position.x,
          s - a.position.y
        );
        this._pointerX = i, this._pointerY = s, this._initialPointerPerView.set(a.id, h);
      });
    }), e.subscribeToEvent(b, () => {
      this.getViews().forEach((i) => {
        this._pointerDownPerView.get(i.id) && this._initialPointerPerView.get(i.id) && (this._pointerDownPerView.set(i.id, !1), this._emitEvent(i, [])), this._viewPointerPositionLog.clear();
      });
    }), e.subscribeToEvent(y, ({ x: i, y: s }) => {
      this._pointerX = i, this._pointerY = s, this.getViews().forEach((n) => {
        if (this._pointerDownPerView.get(n.id) && this._initialPointerPerView.get(n.id)) {
          this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []);
          const a = new u(i, s), h = this._viewPointerPositionLog.get(n.id);
          h && h.push(new u(i, s));
          const l = h && h.length >= 2 ? h[h.length - 2] : a.clone(), c = this._calculateDirections(
            l,
            a
          );
          this._emitEvent(n, c);
        }
      });
    });
  }
  _emitEvent(e, i) {
    const s = this._viewPointerPositionLog.get(e.id), n = s && s.length >= 2 ? s[s.length - 2] : null, a = this._pointerX - this._initialPointerPerView.get(e.id).x, h = this._pointerY - this._initialPointerPerView.get(e.id).y, l = n ? n.x - this._initialPointerPerView.get(e.id).x : a, c = n ? n.y - this._initialPointerPerView.get(e.id).y : h, d = this._pointerY - this._initialPointer.y, g = this._pointerX - this._initialPointer.x, _ = this._targetPerView.get(e.id);
    if (!_ || !e.hasElement(_))
      return;
    const p = this._pointerDownPerView.get(e.id) === !0, f = {
      view: e,
      target: _,
      previousX: l,
      previousY: c,
      x: a,
      y: h,
      width: g,
      height: d,
      isDragging: p,
      directions: i
    };
    this.emit(xt, f);
  }
  _calculateDirections(e, i) {
    const s = {
      up: u.sub(new u(e.x, e.y - 1), e),
      down: u.sub(new u(e.x, e.y + 1), e),
      left: u.sub(new u(e.x - 1, e.y), e),
      right: u.sub(new u(e.x + 1, e.y), e)
    }, n = u.sub(i, e).unitVector;
    return [
      { direction: "up", projection: n.dot(s.up) },
      {
        direction: "down",
        projection: n.dot(s.down)
      },
      {
        direction: "left",
        projection: n.dot(s.left)
      },
      {
        direction: "right",
        projection: n.dot(s.right)
      }
    ].filter(
      (l) => l.projection > 0
    ).map(
      (l) => l.direction
    );
  }
}
r(Et, "pluginName", "DragEventPlugin");
class Tt {
  constructor(t) {
    r(this, "view");
    r(this, "direction");
    this.props = t, this.view = t.view, this.direction = t.direction;
  }
}
class At extends L {
  constructor() {
    super(...arguments);
    r(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map());
    r(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    r(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(e) {
    e.subscribeToEvent(V, ({ x: i, y: s, target: n }) => {
      this.getViews().forEach((a) => {
        this._targetPerView.set(a.id, n), a.intersects(i, s) && this._viewIsPointerDownMap.set(a.id, !0);
      });
    }), e.subscribeToEvent(y, ({ x: i, y: s }) => {
      this.getViews().forEach((n) => {
        if (!this._viewIsPointerDownMap.get(n.id))
          return;
        this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []), this._viewPointerPositionLog.get(n.id).push(new u(i, s));
      });
    }), e.subscribeToEvent(b, ({ x: i, y: s }) => {
      this.getViews().forEach((a) => {
        if (!this._viewIsPointerDownMap.get(a.id) || !this._viewPointerPositionLog.has(a.id))
          return;
        const h = new u(i, s), l = this._viewPointerPositionLog.get(a.id), c = l[l.length - 2] || h.clone(), d = this._targetPerView.get(a.id), g = n(c, h);
        d && a.hasElement(d) && g.hasSwiped && this.emit(Tt, {
          view: a,
          direction: g.direction
        }), this._viewPointerPositionLog.set(a.id, []), this._viewIsPointerDownMap.set(a.id, !1);
      });
      function n(a, h) {
        const l = {
          up: u.sub(new u(a.x, a.y - 1), a),
          down: u.sub(new u(a.x, a.y + 1), a),
          left: u.sub(new u(a.x - 1, a.y), a),
          right: u.sub(new u(a.x + 1, a.y), a)
        }, c = u.sub(h, a).unitVector, d = [
          "up",
          "down",
          "left",
          "right"
        ], g = [
          c.dot(l.up),
          c.dot(l.down),
          c.dot(l.left),
          c.dot(l.right)
        ], _ = Math.max(...g), p = g.indexOf(_), f = d[p], U = u.sub(h, a).magnitude;
        return {
          hasSwiped: c.dot(l[f]) * U > 30,
          direction: f
        };
      }
    });
  }
}
r(At, "pluginName", "SwipeEventPlugin");
const St = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: B,
  PointerDownEvent: V,
  PointerMoveEvent: y,
  PointerUpEvent: b
}, Symbol.toStringTag, { value: "Module" }));
export {
  S as DataChangedEvent,
  xt as DragEvent,
  Et as DragEventPlugin,
  I as EventBus,
  L as EventPlugin,
  St as Events,
  et as Plugin,
  it as PluginContext,
  Tt as SwipeEvent,
  At as SwipeEventPlugin,
  Dt as Utils,
  Vt as View,
  Bt as createApp
};
