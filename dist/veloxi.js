var H = Object.defineProperty;
var W = (o, t, e) => t in o ? H(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var a = (o, t, e) => (W(o, typeof t != "symbol" ? t + "" : t, e), e);
class P {
  constructor(t) {
    a(this, "x");
    a(this, "y");
    a(this, "target");
    this.x = t.x, this.y = t.y, this.target = t.target;
  }
}
class D extends P {
}
class V extends P {
}
class b extends P {
}
class x extends P {
}
class k {
  constructor(t) {
    a(this, "pluginId");
    a(this, "pluginName");
    a(this, "viewName");
    a(this, "dataName");
    a(this, "dataValue");
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
class A {
  constructor(t) {
    a(this, "node");
    this.node = t.node;
  }
}
class C {
  constructor(t) {
    a(this, "node");
    this.node = t.node;
  }
}
class J {
  constructor(t) {
    a(this, "_eventBus");
    a(this, "_observer");
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
        this._eventBus.emitEvent(A, { node: n });
        const r = n.querySelectorAll("[data-vel-plugin]");
        r.length && r.forEach((l) => {
          this._eventBus.emitEvent(A, { node: l });
        });
      }), e.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement) || typeof n.dataset.velProcessing < "u")
          return;
        const r = n.querySelectorAll("[data-vel-plugin]");
        r.length && r.forEach((l) => {
          this._eventBus.emitEvent(C, { node: l });
        }), this._eventBus.emitEvent(C, { node: n });
      });
      const i = e.attributeName;
      if (i && /data-vel-data-.+/gi.test(i)) {
        const n = e.target, r = n.dataset.velPluginId || "", l = n.dataset.velPlugin || "", h = n.dataset.velView || "", c = n.getAttribute(i);
        if (c && c !== e.oldValue) {
          const d = G(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(k, {
            pluginId: r,
            pluginName: l,
            viewName: h,
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
    a(this, "_handler");
    this._handler = e;
  }
  call(e) {
    this._handler(e);
  }
}
class I {
  constructor() {
    a(this, "_listeners", /* @__PURE__ */ new Map());
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
function S() {
  return tt++ + "";
}
class M {
  constructor(t, e, i, s) {
    a(this, "_registry");
    a(this, "_eventBus");
    a(this, "_internalEventBus");
    a(this, "_initialized", !1);
    a(this, "_config");
    a(this, "_pluginName");
    a(this, "_id");
    this._id = S(), this._pluginName = t, this._registry = e, this._eventBus = i, this._internalEventBus = new I(), this._config = s;
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
  getViewById(t) {
    return this._registry.getViewById(t);
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
    this.onViewRemoved(t), t.onRemoveCallback && this._invokeRemoveCallback(t);
  }
  _invokeRemoveCallback(t) {
    const e = this._createTemporaryView(t);
    requestAnimationFrame(() => {
      var i;
      (i = e.onRemoveCallback) == null || i.call(e, e, () => {
        this._deleteView(e);
      }), setTimeout(() => {
        e.element.parentElement && this._deleteView(e);
      }, 1e4);
    });
  }
  _deleteView(t) {
    this._registry.removeViewById(t.id), t.element.remove();
  }
  // This is a temporary view for deleted view. We need to create it
  // to show it again so the user can animate it before it disappears.
  _createTemporaryView(t) {
    const e = t.previousRect.viewportOffset, i = t.previousRect.size, s = t.rotation.degrees < 0 ? 0 : Math.sin(t.rotation.radians) * i.height * t.scale.y, n = t.rotation.degrees > 0 ? 0 : Math.sin(t.rotation.radians) * i.width * t.scale.y, r = t.element;
    r.style.cssText = "", r.style.position = "absolute", r.style.left = `${e.left + s}px`, r.style.top = `${e.top - n}px`, r.style.width = `${i.width}px`, r.style.height = `${i.height}px`, r.style.transform = `
      scale3d(${t.scale.x}, ${t.scale.y}, 1) rotate(${t.rotation.degrees}deg)
    `, r.style.pointerEvents = "none", r.dataset.velRemoved = "", document.body.appendChild(r);
    const l = this._registry.createView(r, t.name);
    return l.styles.position = "absolute", l.styles.left = `${e.left + s}px`, l.styles.top = `${e.top - n}px`, l.rotation.setDegrees(t.rotation.degrees, !1), l.scale.set({ x: t.scale.x, y: t.scale.y }, !1), l.size.set(
      { width: t.size.width, height: t.size.height },
      !1
    ), t._copyAnimatorsToAnotherView(l), t.onRemoveCallback && l.onRemove(t.onRemoveCallback), l;
  }
  // @ts-ignore
  onViewRemoved(t) {
  }
  notifyAboutViewAdded(t) {
    this.onViewAdded(t), this._invokeAddCallbacks(t);
  }
  _invokeAddCallbacks(t) {
    var e;
    (e = t.onAddCallbacks) == null || e.beforeEnter(t), requestAnimationFrame(() => {
      var i;
      (i = t.onAddCallbacks) == null || i.afterEnter(t);
    });
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
  isInitialized() {
    return this._initialized;
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
    a(this, "_plugin");
    this._plugin = t;
  }
  get initialized() {
    return this._plugin.isInitialized();
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
  getViewById(t) {
    return this._plugin.getViewById(t);
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
    a(this, "x");
    a(this, "y");
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
function E(o) {
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
const y = 0.01, F = {
  speed: 15
};
class O {
  constructor(t) {
    a(this, "name", "dynamic");
    a(this, "_config");
    this._config = t;
  }
  get config() {
    return this._config;
  }
}
class at extends O {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const n = u.sub(i, e), r = u.scale(n, this._config.speed);
    let l = u.add(e, u.scale(r, s));
    return this._shouldFinish(i, e, r) && (l = i, t.callCompleteCallback()), t.callUpdateCallback(), l;
  }
  _shouldFinish(t, e, i) {
    return u.sub(t, e).magnitude < y && i.magnitude < y;
  }
}
class ot extends O {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const r = (i - e) * this._config.speed;
    let l = e + r * s;
    return this._shouldFinish(i, e, r) && (l = i, t.callCompleteCallback()), t.callUpdateCallback(), l;
  }
  _shouldFinish(t, e, i) {
    return Math.abs(t - e) < y && Math.abs(i) < y;
  }
}
class $ {
  constructor() {
    a(this, "name", "instant");
    a(this, "_config", {});
  }
  get config() {
    return this._config;
  }
  update(t) {
    return t.animatorProp.callCompleteCallback(), t.target;
  }
}
const z = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, v = 0.01;
class j {
  constructor(t) {
    a(this, "name", "spring");
    a(this, "_config");
    this._config = t;
  }
  get config() {
    return this._config;
  }
}
class ut extends j {
  constructor() {
    super(...arguments);
    a(this, "_velocity", new u(0, 0));
  }
  update({ animatorProp: e, current: i, target: s, dt: n }) {
    const r = u.scale(
      u.scale(u.sub(i, s), -1),
      this._config.stiffness
    );
    this._velocity = u.add(this._velocity, r), this._velocity = u.scale(this._velocity, this._config.damping);
    let l = u.add(
      i,
      u.scale(this._velocity, n * this._config.speed)
    );
    return this._shouldFinish(s, i) && (l = s, e.callCompleteCallback()), l;
  }
  _shouldFinish(e, i) {
    return u.sub(e, i).magnitude < v && this._velocity.magnitude < v;
  }
}
class lt extends j {
  constructor() {
    super(...arguments);
    a(this, "_velocity", 0);
  }
  update({ animatorProp: e, current: i, target: s, dt: n }) {
    const r = -(i - s) * this._config.stiffness;
    this._velocity += r, this._velocity *= this._config.damping;
    let l = i + this._velocity * n * this._config.speed;
    return this._shouldFinish(s, i) && (l = s, e.callCompleteCallback()), l;
  }
  _shouldFinish(e, i) {
    return Math.abs(e - i) < v && Math.abs(this._velocity) < v;
  }
}
function ht(o) {
  return o;
}
const X = {
  duration: 500,
  ease: ht
};
class Y {
  constructor(t) {
    a(this, "name", "tween");
    a(this, "_config");
    a(this, "_startTime");
    this._config = t;
  }
  get config() {
    return this._config;
  }
  reset() {
    this._startTime = void 0;
  }
}
class ct extends Y {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return n >= 1 && t.callCompleteCallback(), u.add(
      e,
      u.scale(u.sub(i, e), this._config.ease(n))
    );
  }
}
class dt extends Y {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return n >= 1 && t.callCompleteCallback(), e + (i - e) * this._config.ease(n);
  }
}
class U {
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
class T extends U {
  createInstantAnimator() {
    return new $();
  }
  createTweenAnimator(t) {
    return new ct({ ...X, ...t });
  }
  createDynamicAnimator(t) {
    return new at({ ...F, ...t });
  }
  createSpringAnimator(t) {
    return new ut({ ...z, ...t });
  }
}
class B extends U {
  createInstantAnimator() {
    return new $();
  }
  createDynamicAnimator(t) {
    return new ot({ ...F, ...t });
  }
  createTweenAnimator(t) {
    return new dt({ ...X, ...t });
  }
  createSpringAnimator(t) {
    return new lt({ ...z, ...t });
  }
}
function m(o) {
  return structuredClone(o);
}
class gt {
  constructor(t) {
    a(this, "_viewProp");
    a(this, "_completeCallback");
    a(this, "_updateCallback");
    this._viewProp = t;
  }
  set(t, e) {
    this._viewProp.setAnimator(t, e);
  }
  get name() {
    return this._viewProp.getAnimator().name;
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
class f {
  constructor(t, e, i) {
    a(this, "_animatorProp");
    a(this, "_animator");
    a(this, "_initialValue");
    a(this, "_previousValue");
    a(this, "_targetValue");
    a(this, "_currentValue");
    a(this, "_hasChanged");
    a(this, "_view");
    a(this, "_animatorFactory");
    this._animatorProp = new gt(this), this._animatorFactory = t, this._initialValue = m(e), this._previousValue = m(e), this._targetValue = m(e), this._currentValue = m(e), this._hasChanged = !1, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
  }
  getAnimator() {
    return this._animator;
  }
  get animator() {
    return this._animatorProp;
  }
  get _rect() {
    return this._view.rect;
  }
  get _previousRect() {
    return this._view.previousRect;
  }
  setAnimator(t, e) {
    this._animator = this._animatorFactory.createAnimatorByName(
      t,
      e
    );
  }
  _setTarget(t, e = !0) {
    var i, s;
    this._previousValue = m(this._currentValue), this._targetValue = t, e ? (s = (i = this._animator).reset) == null || s.call(i) : this._currentValue = t, this._hasChanged = !0;
  }
  hasChanged() {
    return this._hasChanged;
  }
  // @ts-ignore
  update(t, e) {
  }
}
class _t extends f {
  get value() {
    return this._currentValue;
  }
  set(t, e = !0) {
    this._setTarget(t, e);
  }
  reset(t = !0) {
    this._setTarget(1, t);
  }
  update(t, e) {
    this._targetValue !== this._currentValue && (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: t,
      dt: e
    }));
  }
  projectStyles() {
    return `opacity: ${this.value};`;
  }
  isTransform() {
    return !1;
  }
}
class pt extends f {
  constructor() {
    super(...arguments);
    a(this, "_animateLayoutUpdateNextFrame", !1);
  }
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
  progressTo(e) {
    const i = typeof e.x > "u" ? this.initialX : e.x, s = typeof e.y > "u" ? this.initialY : e.y, n = new u(i, s), r = new u(this.initialX, this.initialY), l = new u(this.x, this.y), h = u.sub(l, r), c = u.sub(n, r);
    return 1 - u.sub(c, h).magnitude / c.magnitude;
  }
  set(e, i = !0) {
    const n = { ...{ x: this.x, y: this.y }, ...e };
    this._setTarget(
      new u(
        n.x - this._rect.pageOffset.left,
        n.y - this._rect.pageOffset.top
      ),
      i
    );
  }
  reset(e = !0) {
    this._setTarget(new u(0, 0), e);
  }
  update(e, i) {
    this._view.isLayoutTransitionEnabled && this._runLayoutTransition(), !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y) && (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: e,
      dt: i
    }));
  }
  _runLayoutTransition() {
    const e = this._rect.pageOffset.left - this._previousRect.pageOffset.left, i = this._rect.pageOffset.top - this._previousRect.pageOffset.top;
    e !== 0 || i !== 0 ? (this._animateLayoutUpdateNextFrame = !0, this._setTarget(
      new u(this._initialValue.x - e, this._currentValue.y - i),
      !1
    )) : this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
  }
  projectStyles() {
    return `translate3d(${this._currentValue.x}px, ${this._currentValue.y}px, 0)`;
  }
  isTransform() {
    return !0;
  }
}
class mt extends f {
  constructor() {
    super(...arguments);
    a(this, "_unit", "deg");
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
class ft extends f {
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
class wt extends f {
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
    a(this, "_props", /* @__PURE__ */ new Map());
    this._props.set(
      "position",
      new pt(new T(), new u(0, 0), t)
    ), this._props.set(
      "scale",
      new ft(new T(), new u(1, 1), t)
    ), this._props.set(
      "rotation",
      new mt(new B(), 0, t)
    ), this._props.set(
      "size",
      new wt(
        new T(),
        new u(t.rect.size.width, t.rect.size.height),
        t
      )
    ), this._props.set(
      "opacity",
      new _t(new B(), 1, t)
    );
  }
  allProps() {
    return Array.from(this._props.values());
  }
  allPropNames() {
    return Array.from(this._props.keys());
  }
  getPropByName(t) {
    return this._props.get(t);
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
  get opacity() {
    return this._props.get("opacity");
  }
}
class vt {
  constructor(t, e) {
    a(this, "id");
    a(this, "name");
    a(this, "element");
    a(this, "styles", {});
    a(this, "_viewProps");
    a(this, "_rect");
    a(this, "_previousRect");
    a(this, "_onAddCallbacks");
    a(this, "_onRemoveCallback");
    a(this, "_skipFirstRenderFrame");
    a(this, "_layoutTransition");
    this.id = S(), this.name = e, this.element = t, this._rect = E(this.element), this._previousRect = E(this.element), this._viewProps = new yt(this), this._skipFirstRenderFrame = !0, this._layoutTransition = !1, this.element.dataset.velViewId = this.id;
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
  get opacity() {
    return this._viewProps.opacity;
  }
  get data() {
    const t = this.element.dataset;
    return Object.keys(t).filter((s) => s.includes("velData")).map((s) => s.replace("velData", "")).map((s) => `${s[0].toLowerCase()}${s.slice(1)}`).reduce((s, n) => {
      const r = t[`velData${n[0].toUpperCase()}${n.slice(1)}`];
      return !s[n] && r && (s[n] = r), s;
    }, {});
  }
  get onAddCallbacks() {
    return this._onAddCallbacks;
  }
  get onRemoveCallback() {
    return this._onRemoveCallback;
  }
  get isLayoutTransitionEnabled() {
    return this._layoutTransition;
  }
  layoutTransition(t) {
    this._layoutTransition = t;
  }
  get _isRemoved() {
    return typeof this.element.dataset.velRemoved < "u";
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
    const e = t.size.width * t.scale.x, i = t.size.height * t.scale.y, s = this.size.width * this.scale.x, n = this.size.height * this.scale.y;
    return this.position.x < t.position.x + e && this.position.x + s > t.position.x && this.position.y < t.position.y + i && this.position.y + n > t.position.y;
  }
  distanceTo(t) {
    const e = new u(this.position.x, this.position.y), i = new u(t.position.x, t.position.y);
    return u.sub(i, e).magnitude;
  }
  read() {
    this._rect = E(this.element);
  }
  get rect() {
    return this._rect;
  }
  get previousRect() {
    return this._previousRect;
  }
  update(t, e) {
    this._viewProps.allProps().forEach((i) => i.update(t, e)), this._previousRect = this._rect;
  }
  render() {
    if (this._isRemoved && this._skipFirstRenderFrame) {
      this._skipFirstRenderFrame = !1;
      return;
    }
    let t = "";
    const e = this._viewProps.allProps(), i = e.filter((r) => r.isTransform()), s = e.filter((r) => !r.isTransform()), n = i.reduce((r, l, h) => (r += l.projectStyles(), h === i.length - 1 && (r += ";"), r), "transform: ");
    t += n, s.forEach((r) => {
      r.hasChanged() && (t += r.projectStyles());
    }), t += this._getUserStyles(), this.element.style.cssText = t;
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((t, e) => e ? t + `${Z(e)}: ${this.styles[e]};` : t, "");
  }
  markAsAdded() {
    delete this.element.dataset.velProcessing;
  }
  onAdd(t) {
    this._onAddCallbacks = t;
  }
  onRemove(t) {
    this._onRemoveCallback = t;
  }
  get viewProps() {
    return this._viewProps;
  }
  _copyAnimatorsToAnotherView(t) {
    t.viewProps.allPropNames().forEach((e) => {
      var s, n;
      const i = (s = this.viewProps.getPropByName(e)) == null ? void 0 : s.getAnimator();
      i && ((n = t.viewProps.getPropByName(e)) == null || n.setAnimator(i.name, i.config));
    });
  }
}
class Pt {
  constructor() {
    a(this, "_plugins", []);
    a(this, "_views", []);
    a(this, "_viewsPerPlugin", /* @__PURE__ */ new Map());
    a(this, "_viewsToBeCreated", []);
    a(this, "_viewsToBeRemoved", []);
    a(this, "_viewsCreatedInPreviousFrame", []);
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
      const r = this.createView(i, n), l = this.getPluginByName(s);
      l && (l.addView(r), l.notifyAboutViewAdded(r));
    }), this._viewsToBeCreated = []);
    const e = this._viewsToBeRemoved.filter((i) => i.dataset.velViewId);
    e.length && (e.forEach((i) => {
      const s = i.dataset.velViewId;
      s && this.removeViewById(s);
    }), this._viewsToBeRemoved = []);
  }
  removeViewById(t) {
    this._plugins.forEach((e) => {
      const i = this._viewsPerPlugin.get(e.id);
      if (!i)
        return;
      const s = i.indexOf(t), n = this.getViewById(t);
      s !== -1 && n && (i.splice(s, 1), e.notifyAboutViewRemoved(n));
    }), this._views = this._views.filter((e) => e.id !== t);
  }
  getViewById(t) {
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
      const l = document.querySelectorAll(
        `[data-vel-plugin=${t.pluginName}][data-vel-view=${t.scope}]`
      );
      l ? s = Array.from(l) : s = [document.documentElement];
    } else
      s = [document.documentElement];
    const n = s.map((l) => {
      const h = N(
        t,
        this,
        e,
        i
      );
      this._plugins.push(h);
      let c = [];
      l !== document.documentElement && c.push(l);
      const d = l.querySelectorAll(
        `[data-vel-plugin=${h.pluginName}]`
      );
      return c = [...c, ...d], c.length && c.forEach((g) => {
        const _ = g.dataset.velView;
        if (!_)
          return;
        const p = this.createView(g, _);
        h.addView(p), h.notifyAboutViewAdded(p);
      }), h;
    });
    if (n && n.length > 0)
      return n[0];
    const r = N(t, this, e, i);
    return console.log(
      `%c WARNING: The plugin "${r.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), r;
  }
  getViews() {
    return this._views;
  }
  createView(t, e) {
    const i = new vt(t, e);
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
class R {
  constructor() {
    a(this, "_previousTime", 0);
    a(this, "_registry");
    a(this, "_eventBus");
    this._registry = new Pt(), this._eventBus = new I(), new J(this._eventBus);
  }
  static create() {
    return new R();
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
      this._eventBus.emitEvent(D, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointermove", (t) => {
      this._eventBus.emitEvent(V, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerdown", (t) => {
      this._eventBus.emitEvent(b, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerup", (t) => {
      this._eventBus.emitEvent(x, {
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
      A,
      this._onNodeAdded.bind(this)
    ), this._eventBus.subscribeToEvent(
      C,
      this._onNodeRemoved.bind(this)
    ), this._eventBus.subscribeToEvent(
      k,
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
  return R.create();
}
class Vt {
  constructor(t) {
    a(this, "view");
    a(this, "previousX");
    a(this, "previousY");
    a(this, "x");
    a(this, "y");
    a(this, "isDragging");
    a(this, "target");
    a(this, "directions", []);
    a(this, "width");
    a(this, "height");
    this.props = t, this.previousX = t.previousX, this.previousY = t.previousY, this.x = t.x, this.y = t.y, this.width = t.width, this.height = t.height, this.view = t.view, this.isDragging = t.isDragging, this.target = t.target, this.directions = t.directions;
  }
}
class bt extends L {
  constructor() {
    super(...arguments);
    a(this, "_pointerX", 0);
    a(this, "_pointerY", 0);
    a(this, "_initialPointer", new u(0, 0));
    a(this, "_initialPointerPerView", /* @__PURE__ */ new Map());
    a(this, "_pointerDownPerView", /* @__PURE__ */ new Map());
    a(this, "_targetPerView", /* @__PURE__ */ new Map());
    a(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
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
    e.subscribeToEvent(b, ({ x: i, y: s, target: n }) => {
      this._initialPointer = new u(i, s), this.getViews().forEach((r) => {
        this._pointerDownPerView.set(r.id, r.intersects(i, s)), this._targetPerView.set(r.id, n);
        const l = new u(
          i - r.position.x,
          s - r.position.y
        );
        this._pointerX = i, this._pointerY = s, this._initialPointerPerView.set(r.id, l);
      });
    }), e.subscribeToEvent(x, () => {
      this.getViews().forEach((i) => {
        this._pointerDownPerView.get(i.id) && this._initialPointerPerView.get(i.id) && (this._pointerDownPerView.set(i.id, !1), this._emitEvent(i, []));
      });
    }), e.subscribeToEvent(V, ({ x: i, y: s }) => {
      this._pointerX = i, this._pointerY = s, this.getViews().forEach((n) => {
        if (this._pointerDownPerView.get(n.id) && this._initialPointerPerView.get(n.id)) {
          this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []);
          const r = new u(i, s), l = this._viewPointerPositionLog.get(n.id);
          l && l.push(new u(i, s));
          const h = l && l.length >= 2 ? l[l.length - 2] : r.clone(), c = this._calculateDirections(
            h,
            r
          );
          this._emitEvent(n, c);
        }
      });
    });
  }
  _emitEvent(e, i) {
    const s = this._viewPointerPositionLog.get(e.id), n = s && s.length >= 2 ? s[s.length - 2] : null, r = this._pointerX - this._initialPointerPerView.get(e.id).x, l = this._pointerY - this._initialPointerPerView.get(e.id).y, h = n ? n.x - this._initialPointerPerView.get(e.id).x : r, c = n ? n.y - this._initialPointerPerView.get(e.id).y : l, d = this._pointerY - this._initialPointer.y, g = this._pointerX - this._initialPointer.x, _ = this._targetPerView.get(e.id);
    if (!_ || !e.hasElement(_))
      return;
    const p = this._pointerDownPerView.get(e.id) === !0;
    p || this._viewPointerPositionLog.clear();
    const w = {
      view: e,
      target: _,
      previousX: h,
      previousY: c,
      x: r,
      y: l,
      width: g,
      height: d,
      isDragging: p,
      directions: i
    };
    this.emit(Vt, w);
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
      (h) => h.projection > 0
    ).map(
      (h) => h.direction
    );
  }
}
a(bt, "pluginName", "DragEventPlugin");
class xt {
  constructor(t) {
    a(this, "view");
    a(this, "direction");
    this.props = t, this.view = t.view, this.direction = t.direction;
  }
}
class Et extends L {
  constructor() {
    super(...arguments);
    a(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map());
    a(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    a(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(e) {
    e.subscribeToEvent(b, ({ x: i, y: s, target: n }) => {
      this.getViews().forEach((r) => {
        this._targetPerView.set(r.id, n), r.intersects(i, s) && this._viewIsPointerDownMap.set(r.id, !0);
      });
    }), e.subscribeToEvent(V, ({ x: i, y: s }) => {
      this.getViews().forEach((n) => {
        if (!this._viewIsPointerDownMap.get(n.id))
          return;
        this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []), this._viewPointerPositionLog.get(n.id).push(new u(i, s));
      });
    }), e.subscribeToEvent(x, ({ x: i, y: s }) => {
      this.getViews().forEach((r) => {
        if (!this._viewIsPointerDownMap.get(r.id) || !this._viewPointerPositionLog.has(r.id))
          return;
        const l = new u(i, s), h = this._viewPointerPositionLog.get(r.id), c = h[h.length - 2] || l.clone(), d = this._targetPerView.get(r.id), g = n(c, l);
        d && r.hasElement(d) && g.hasSwiped && this.emit(xt, {
          view: r,
          direction: g.direction
        }), this._viewPointerPositionLog.set(r.id, []), this._viewIsPointerDownMap.set(r.id, !1);
      });
      function n(r, l) {
        const h = {
          up: u.sub(new u(r.x, r.y - 1), r),
          down: u.sub(new u(r.x, r.y + 1), r),
          left: u.sub(new u(r.x - 1, r.y), r),
          right: u.sub(new u(r.x + 1, r.y), r)
        }, c = u.sub(l, r).unitVector, d = [
          "up",
          "down",
          "left",
          "right"
        ], g = [
          c.dot(h.up),
          c.dot(h.down),
          c.dot(h.left),
          c.dot(h.right)
        ], _ = Math.max(...g), p = g.indexOf(_), w = d[p], q = u.sub(l, r).magnitude;
        return {
          hasSwiped: c.dot(h[w]) * q > 30,
          direction: w
        };
      }
    });
  }
}
a(Et, "pluginName", "SwipeEventPlugin");
function Tt(o, t) {
  const e = o.map(t), i = Math.min(...e), s = e.indexOf(i);
  return o[s];
}
function At(o, t, e) {
  return Math.min(Math.max(o, t), e);
}
function Ct(o, t, e) {
  return o + (t - o) * e;
}
const Dt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clamp: At,
  minBy: Tt,
  valueAtPercentage: Ct
}, Symbol.toStringTag, { value: "Module" })), kt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: D,
  PointerDownEvent: b,
  PointerMoveEvent: V,
  PointerUpEvent: x
}, Symbol.toStringTag, { value: "Module" }));
export {
  k as DataChangedEvent,
  Vt as DragEvent,
  bt as DragEventPlugin,
  I as EventBus,
  L as EventPlugin,
  kt as Events,
  et as Plugin,
  it as PluginContext,
  xt as SwipeEvent,
  Et as SwipeEventPlugin,
  Dt as Utils,
  vt as View,
  Bt as createApp
};
