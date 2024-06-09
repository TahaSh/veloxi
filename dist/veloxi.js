var At = Object.defineProperty;
var Tt = (o, t, e) => t in o ? At(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var a = (o, t, e) => (Tt(o, typeof t != "symbol" ? t + "" : t, e), e);
class N {
  constructor(t) {
    a(this, "x");
    a(this, "y");
    a(this, "target");
    this.x = t.x, this.y = t.y, this.target = t.target;
  }
}
class z extends N {
}
class B extends N {
}
class L extends N {
}
class S extends N {
}
class gt {
  constructor(t) {
    a(this, "pluginId");
    a(this, "pluginName");
    a(this, "viewName");
    a(this, "dataName");
    a(this, "dataValue");
    this.event = t, this.pluginId = t.pluginId, this.pluginName = t.pluginName, this.viewName = t.viewName, this.dataName = t.dataName, this.dataValue = t.dataValue;
  }
}
function Ct(o) {
  return o.replace(/(?:^\w|[A-Z]|\b\w)/g, function(t, e) {
    return e === 0 ? t.toLowerCase() : t.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function It(o) {
  return o.split("").map((t, e) => t.toUpperCase() === t ? `${e !== 0 ? "-" : ""}${t.toLowerCase()}` : t).join("");
}
class D {
  constructor(t) {
    a(this, "node");
    this.node = t.node;
  }
}
class O {
  constructor(t) {
    a(this, "node");
    this.node = t.node;
  }
}
class Nt {
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
        let r = n;
        if (n.dataset.velView || (r = n.querySelector("[data-vel-view][data-vel-plugin]")), !r)
          return;
        this._eventBus.emitEvent(D, { node: r });
        const u = r.querySelectorAll("[data-vel-plugin]");
        u.length && u.forEach((h) => {
          this._eventBus.emitEvent(D, { node: h });
        });
      }), e.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement) || typeof n.dataset.velProcessing < "u")
          return;
        const r = n.querySelectorAll("[data-vel-plugin]");
        r.length && r.forEach((u) => {
          this._eventBus.emitEvent(O, { node: u });
        }), this._eventBus.emitEvent(O, { node: n });
      });
      const i = e.attributeName;
      if (i && /data-vel-data-.+/gi.test(i)) {
        const n = e.target, r = n.dataset.velPluginId || "", u = n.dataset.velPlugin || "", h = n.dataset.velView || "", c = n.getAttribute(i);
        if (c && c !== e.oldValue) {
          const d = Ct(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(gt, {
            pluginId: r,
            pluginName: u,
            viewName: h,
            dataName: d,
            dataValue: c
          });
        }
      }
    });
  }
}
class Bt {
  execute(t) {
    this.call(t);
  }
}
class ut extends Bt {
  constructor(e) {
    super();
    a(this, "_handler");
    this._handler = e;
  }
  call(e) {
    this._handler(e);
  }
}
class k {
  constructor() {
    a(this, "_listeners", /* @__PURE__ */ new Map());
    a(this, "_keyedListeners", /* @__PURE__ */ new Map());
  }
  subscribeToEvent(t, e, i) {
    if (i) {
      this._subscribeToKeyedEvent(t, e, i);
      return;
    }
    let s = this._listeners.get(t);
    s || (s = [], this._listeners.set(t, s)), s.push(new ut(e));
  }
  _subscribeToKeyedEvent(t, e, i) {
    let s = this._keyedListeners.get(t);
    s || (s = /* @__PURE__ */ new Map(), this._keyedListeners.set(t, s));
    let n = s.get(i);
    n || (n = [], s.set(i, n)), n.push(new ut(e));
  }
  emitEvent(t, e, i) {
    if (i) {
      this._emitKeyedEvent(t, e, i);
      return;
    }
    const s = this._listeners.get(t);
    s && s.forEach((n) => {
      n.execute(e);
    });
  }
  _emitKeyedEvent(t, e, i) {
    const s = this._keyedListeners.get(t);
    if (!s)
      return;
    const n = s.get(i);
    n && n.forEach((r) => {
      r.execute(e);
    });
  }
  _convertListener(t) {
    return (e) => t(e);
  }
  subscribeToPluginReadyEvent(t, e, i = !1) {
    if (i) {
      this.subscribeToEvent(
        _t,
        this._convertListener(t),
        e
      );
      return;
    }
    this.subscribeToEvent(
      dt,
      this._convertListener(t),
      e
    );
  }
  emitPluginReadyEvent(t, e, i = !1) {
    if (i) {
      this.emitEvent(
        _t,
        e,
        t
      );
      return;
    }
    this.emitEvent(
      dt,
      e,
      t
    );
  }
  reset() {
    this._listeners.clear();
  }
}
let Lt = 0;
function pt() {
  return Lt++ + "";
}
class ft {
  constructor(t, e, i, s, n, r, u) {
    a(this, "_registry");
    a(this, "_eventBus");
    a(this, "_appEventBus");
    a(this, "_internalEventBus");
    a(this, "_initialized", !1);
    a(this, "_config");
    a(this, "_pluginFactory");
    a(this, "_pluginName");
    a(this, "_id");
    a(this, "_pluginKey");
    a(this, "_layoutIdViewMapWaitingToEnter");
    a(this, "_apiData");
    a(this, "_isReady", !1);
    this._id = pt(), this._pluginFactory = t, this._pluginName = e, this._registry = i, this._eventBus = s, this._appEventBus = n, this._internalEventBus = new k(), this._config = r, this._layoutIdViewMapWaitingToEnter = /* @__PURE__ */ new Map(), this._pluginKey = u, this._apiData = {}, this._appEventBus.subscribeToPluginReadyEvent(
      () => {
        this._isReady = !0;
      },
      this._pluginName,
      !0
    );
  }
  get api() {
    return this._apiData;
  }
  _setApi(t) {
    this._apiData = t;
  }
  get pluginName() {
    return this._pluginName;
  }
  get pluginFactory() {
    return this._pluginFactory;
  }
  get pluginKey() {
    return this._pluginKey;
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
    this._registry.assignViewToPlugin(t, this);
  }
  setInternalEventBus(t) {
    this._internalEventBus = t;
  }
  get internalBusEvent() {
    return this._internalEventBus;
  }
  emit(t, e) {
    this._internalEventBus.emitEvent(t, e);
  }
  on(t, e) {
    this._internalEventBus.subscribeToEvent(t, e);
  }
  useEventPlugin(t, e = {}) {
    const i = this._registry.createPlugin(
      t,
      this._eventBus,
      e
    );
    return this._registry.associateEventPluginWithPlugin(this.id, i.id), i;
  }
  notifyAboutDataChanged(t) {
    this.onDataChanged(t);
  }
  // @ts-ignore
  onDataChanged(t) {
  }
  removeView(t) {
    t.onRemoveCallback ? this._invokeRemoveCallback(t) : this._deleteView(t), this.onViewRemoved(t);
  }
  _invokeRemoveCallback(t) {
    const e = this._createTemporaryView(t);
    requestAnimationFrame(() => {
      var i;
      (i = e.onRemoveCallback) == null || i.call(e, e, () => {
        var s, n;
        if ((s = t.onAddCallbacks) != null && s.afterRemoved && t.layoutId) {
          const r = this._layoutIdViewMapWaitingToEnter.get(
            t.layoutId
          );
          (n = r == null ? void 0 : r.onAddCallbacks) == null || n.afterEnter(r), this._layoutIdViewMapWaitingToEnter.delete(t.layoutId);
        }
        this._deleteView(e, !0);
      }), setTimeout(() => {
        e.element.parentElement && this._deleteView(e, !0);
      }, 1e4);
    });
  }
  _deleteView(t, e = !1) {
    (e || !t.layoutId) && (this._registry.removeViewById(t.id, this.id), t.element.remove());
  }
  // This is a temporary view for deleted view. We need to create it
  // to show it again so the user can animate it before it disappears.
  _createTemporaryView(t) {
    const e = t.previousRect.viewportOffset, i = t.previousRect.size, s = t.rotation.degrees < 0 ? 0 : Math.sin(t.rotation.radians) * i.height * t.scale.y, n = t.rotation.degrees > 0 ? 0 : Math.sin(t.rotation.radians) * i.width * t.scale.y, r = t.element.cloneNode(!0);
    t.element.remove(), r.style.cssText = "", r.style.position = "absolute", r.style.left = `${e.left + s}px`, r.style.top = `${e.top - n}px`, r.style.width = `${i.width}px`, r.style.height = `${i.height}px`, r.style.transform = `
      scale3d(${t.scale.x}, ${t.scale.y}, 1) rotate(${t.rotation.degrees}deg)
    `, r.style.pointerEvents = "none", r.dataset.velRemoved = "", document.body.appendChild(r);
    const u = this._registry.createView(r, t.name);
    return u.setAsTemporaryView(), u.styles.position = "absolute", u.styles.left = `${e.left + s}px`, u.styles.top = `${e.top - n}px`, u.rotation.setDegrees(t.rotation.degrees, !1), u.scale.set({ x: t.scale.x, y: t.scale.y }, !1), u.size.set(
      { width: t.size.width, height: t.size.height },
      !1
    ), t._copyAnimatorsToAnotherView(u), t.onRemoveCallback && u.onRemove(t.onRemoveCallback), u;
  }
  // @ts-ignore
  onViewRemoved(t) {
  }
  notifyAboutViewAdded(t) {
    this.onViewAdded(t), this._invokeAddCallbacks(t);
  }
  _invokeAddCallbacks(t) {
    var e, i, s;
    !((e = t.onAddCallbacks) != null && e.onInitialLoad) && !this._initialized || ((i = t.onAddCallbacks) == null || i.beforeEnter(t), !((s = t.onAddCallbacks) != null && s.afterRemoved) || !this._initialized ? requestAnimationFrame(() => {
      var n;
      (n = t.onAddCallbacks) == null || n.afterEnter(t);
    }) : t.layoutId && this._layoutIdViewMapWaitingToEnter.set(t.layoutId, t));
  }
  // @ts-ignore
  onViewAdded(t) {
  }
  init() {
    !this._initialized && this._isReady && (this.setup(), this._initialized = !0);
  }
  setup() {
  }
  // @ts-ignore
  subscribeToEvents(t) {
  }
}
class St extends ft {
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
class U extends ft {
  isRenderable() {
    return !1;
  }
}
class Ft {
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
  api(t) {
    this._plugin._setApi(t);
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
function lt(o, t, e, i, s, n) {
  if ($t(o))
    return new o(
      o,
      o.pluginName,
      t,
      e,
      i,
      s,
      n
    );
  const r = new St(
    o,
    o.pluginName,
    t,
    e,
    i,
    s,
    n
  ), u = new Ft(r);
  return o(u), r;
}
function $t(o) {
  var t;
  return ((t = o.prototype) == null ? void 0 : t.constructor.toString().indexOf("class ")) === 0;
}
class l {
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
    const t = new l(0, 0), e = this.magnitude;
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
    return new l(this.x, this.y);
  }
  static scale(t, e) {
    return new l(t.x * e, t.y * e);
  }
  static sub(t, e) {
    return new l(t.x - e.x, t.y - e.y);
  }
  static add(t, e) {
    return new l(t.x + e.x, t.y + e.y);
  }
}
function Dt(o, t, e) {
  return Math.min(Math.max(o, t), e);
}
function Ot(o, t, e) {
  return o + (t - o) * e;
}
function v(o, t) {
  const i = o - t;
  return Math.abs(i) <= 0.01;
}
function p(o) {
  let t = o.match(/^([\d.]+)([a-zA-Z%]*)$/);
  t || (t = "0px".match(/^([\d.]+)([a-zA-Z%]*)$/));
  const e = parseFloat(t[1]), i = t[2];
  return { value: e, unit: i, valueWithUnit: o };
}
function kt(o, t, e = !1) {
  if (o === t)
    return !0;
  if (o.length !== t.length)
    return !1;
  for (let i = 0; i < o.length; i++) {
    if (e && !v(o[i].value, t[i].value))
      return !1;
    if (o[i].value !== t[i].value)
      return !1;
  }
  return !0;
}
function ht(o, t) {
  return kt(o, t, !0);
}
class b {
  constructor(t, e, i, s) {
    a(this, "_topLeft");
    a(this, "_topRight");
    a(this, "_bottomLeft");
    a(this, "_bottomRight");
    this._topLeft = t, this._topRight = e, this._bottomLeft = i, this._bottomRight = s;
  }
  get value() {
    return {
      topLeft: this._topLeft,
      topRight: this._topRight,
      bottomRight: this._bottomRight,
      bottomLeft: this._bottomLeft
    };
  }
  equals(t) {
    return v(this.value.topLeft.value, t.value.topLeft.value) && v(this.value.topRight.value, t.value.topRight.value) && v(this.value.bottomRight.value, t.value.bottomRight.value) && v(this.value.bottomLeft.value, t.value.bottomLeft.value);
  }
  toCssPercentageForNewSize(t) {
    const e = this._convertToPercentage(this._topLeft, t), i = this._convertToPercentage(this._topRight, t), s = this._convertToPercentage(this._bottomLeft, t), n = this._convertToPercentage(this._bottomRight, t);
    return `${e.h} ${i.h} ${n.h} ${s.h} / ${e.v} ${i.v} ${n.v} ${s.v}`;
  }
  _convertToPercentage(t, e) {
    if (t.unit === "%")
      return { h: `${t.value}%`, v: `${t.value}%` };
    const i = t.value / e.width * 100, s = t.value / e.height * 100;
    return { h: `${i}%`, v: `${s}%` };
  }
}
function M(o) {
  const t = o.split(" ").map((i) => p(i)), e = {
    value: 0,
    unit: "",
    valueWithUnit: "0"
  };
  switch (t.length) {
    case 1:
      return new b(t[0], t[0], t[0], t[0]);
    case 2:
      return new b(t[0], t[1], t[0], t[1]);
    case 3:
      return new b(t[0], t[1], t[2], t[1]);
    case 4:
      return new b(t[0], t[1], t[3], t[2]);
    default:
      return new b(
        e,
        e,
        e,
        e
      );
  }
}
function Mt(o, t) {
  const e = r(o.topLeft, t), i = r(o.topRight, t), s = r(o.bottomLeft, t), n = r(o.bottomRight, t);
  return {
    v: {
      topLeft: e.v,
      topRight: i.v,
      bottomRight: n.v,
      bottomLeft: s.v
    },
    h: {
      topLeft: e.h,
      topRight: i.h,
      bottomRight: n.h,
      bottomLeft: s.h
    }
  };
  function r(u, h) {
    if (u.unit === "%")
      return {
        h: p(`${u.value}%`),
        v: p(`${u.value}%`)
      };
    const c = u.value / h.width * 100, d = u.value / h.height * 100;
    return { h: p(`${c}%`), v: p(`${d}%`) };
  }
}
class zt {
  constructor(t) {
    a(this, "_value");
    this._value = t;
  }
  get value() {
    return this._value;
  }
  equals(t) {
    return v(this.value, t.value);
  }
}
function Ut(o) {
  return new zt(parseFloat(o));
}
class qt {
  constructor(t, e) {
    a(this, "_x");
    a(this, "_y");
    this._x = t, this._y = e;
  }
  get value() {
    return new l(this._x, this._y);
  }
}
function Wt(o, t) {
  const [e, i] = o.split(" "), s = p(e), n = p(i);
  return new qt(
    s.value / t.width,
    n.value / t.height
  );
}
function Yt(o) {
  const t = Xt(o), e = jt(o);
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
function Xt(o) {
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
function jt(o) {
  let t = o, e = 0, i = 0;
  for (; t; )
    e += t.offsetTop, i += t.offsetLeft, t = t.offsetParent;
  return { top: e, left: i };
}
class Ht {
  constructor(t) {
    a(this, "_rect");
    a(this, "_computedStyle");
    this._rect = Yt(t), this._computedStyle = getComputedStyle(t);
  }
  read(t) {
    switch (t) {
      case "opacity":
        return this.opacity;
      case "borderRadius":
        return this.borderRadius;
    }
  }
  get rect() {
    return this._rect;
  }
  get opacity() {
    return Ut(this._computedStyle.opacity);
  }
  get borderRadius() {
    return M(this._computedStyle.borderRadius);
  }
  get origin() {
    return Wt(
      this._computedStyle.transformOrigin,
      this._rect.size
    );
  }
}
function $(o) {
  return new Ht(o);
}
const V = 0.01, q = {
  speed: 15
};
class W {
  constructor(t) {
    a(this, "name", "dynamic");
    a(this, "_config");
    this._config = t;
  }
  get config() {
    return this._config;
  }
}
class Kt extends W {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const n = l.sub(i, e), r = l.scale(n, this._config.speed);
    let u = l.add(e, l.scale(r, s));
    return this._shouldFinish(i, e, r) && (u = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), t.callUpdateCallback(), u;
  }
  _shouldFinish(t, e, i) {
    return l.sub(t, e).magnitude < V && i.magnitude < V;
  }
}
class Gt extends W {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    const r = (i - e) * this._config.speed;
    let u = e + r * s;
    return this._shouldFinish(i, e, r) && (u = i, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), t.callUpdateCallback(), u;
  }
  _shouldFinish(t, e, i) {
    return Math.abs(t - e) < V && Math.abs(i) < V;
  }
}
class Zt extends W {
  update({ animatorProp: t, current: e, target: i, dt: s }) {
    return i.map((n, r) => {
      const u = e[r], h = n.value === 0 ? u.unit : n.unit, d = (n.value - u.value) * this._config.speed, g = u.value + d * s;
      let _ = p(`${g}${h}`);
      return this._shouldFinish(n.value, u.value, d) && (_ = n, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), t.callUpdateCallback(), _;
    });
  }
  _shouldFinish(t, e, i) {
    return Math.abs(t - e) < V && Math.abs(i) < V;
  }
}
class Y {
  constructor() {
    a(this, "name", "instant");
    a(this, "_config", {});
  }
  get config() {
    return this._config;
  }
  update(t) {
    return requestAnimationFrame(() => {
      t.animatorProp.callCompleteCallback();
    }), t.target;
  }
}
const X = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, P = 0.01;
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
class Jt extends j {
  constructor() {
    super(...arguments);
    a(this, "_velocity", new l(0, 0));
  }
  update({ animatorProp: e, current: i, target: s, dt: n }) {
    const r = l.scale(
      l.scale(l.sub(i, s), -1),
      this._config.stiffness
    );
    this._velocity = l.add(this._velocity, r), this._velocity = l.scale(this._velocity, this._config.damping);
    let u = l.add(
      i,
      l.scale(this._velocity, n * this._config.speed)
    );
    return this._shouldFinish(s, i) && (u = s, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), u;
  }
  _shouldFinish(e, i) {
    return l.sub(e, i).magnitude < P && this._velocity.magnitude < P;
  }
}
class Qt extends j {
  constructor() {
    super(...arguments);
    a(this, "_velocity", 0);
  }
  update({ animatorProp: e, current: i, target: s, dt: n }) {
    const r = -(i - s) * this._config.stiffness;
    this._velocity += r, this._velocity *= this._config.damping;
    let u = i + this._velocity * n * this._config.speed;
    return this._shouldFinish(s, i) && (u = s, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), u;
  }
  _shouldFinish(e, i) {
    return Math.abs(e - i) < P && Math.abs(this._velocity) < P;
  }
}
class te extends j {
  constructor() {
    super(...arguments);
    a(this, "_velocity", 0);
  }
  update({ animatorProp: e, current: i, target: s, dt: n }) {
    return s.map((r, u) => {
      const h = i[u], c = r.value === 0 ? h.unit : r.unit, d = -(h.value - r.value) * this._config.stiffness;
      this._velocity += d, this._velocity *= this._config.damping;
      const g = h.value + this._velocity * n * this._config.speed;
      let _ = p(`${g}${c}`);
      return this._shouldFinish(r.value, h.value) && (_ = r, requestAnimationFrame(() => {
        e.callCompleteCallback();
      })), _;
    });
  }
  _shouldFinish(e, i) {
    return Math.abs(e - i) < P && Math.abs(this._velocity) < P;
  }
}
function ee(o) {
  return o;
}
const H = {
  duration: 350,
  ease: ee
};
class K {
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
class ie extends K {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return v(n, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : l.add(
      e,
      l.scale(l.sub(i, e), this._config.ease(n))
    );
  }
}
class se extends K {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return v(n, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : e.map((r, u) => {
      const h = i[u], c = h.value === 0 ? r.unit : h.unit, d = r.value + this._config.ease(n) * (i[u].value - r.value);
      return p(`${d}${c}`);
    });
  }
}
class ne extends K {
  update({ animatorProp: t, initial: e, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return v(n, 1) ? (requestAnimationFrame(() => {
      t.callCompleteCallback();
    }), i) : e + (i - e) * this._config.ease(n);
  }
}
class G {
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
class I extends G {
  createInstantAnimator() {
    return new Y();
  }
  createTweenAnimator(t) {
    return new ie({ ...H, ...t });
  }
  createDynamicAnimator(t) {
    return new Kt({ ...q, ...t });
  }
  createSpringAnimator(t) {
    return new Jt({ ...X, ...t });
  }
}
class re extends G {
  createInstantAnimator() {
    return new Y();
  }
  createTweenAnimator(t) {
    return new se({ ...H, ...t });
  }
  createDynamicAnimator(t) {
    return new Zt({
      ...q,
      ...t
    });
  }
  createSpringAnimator(t) {
    return new te({ ...X, ...t });
  }
}
class ct extends G {
  createInstantAnimator() {
    return new Y();
  }
  createDynamicAnimator(t) {
    return new Gt({ ...q, ...t });
  }
  createTweenAnimator(t) {
    return new ne({ ...H, ...t });
  }
  createSpringAnimator(t) {
    return new Qt({ ...X, ...t });
  }
}
function R(o) {
  return structuredClone(o);
}
class ae {
  constructor(t) {
    a(this, "_viewProp");
    a(this, "_completeCallback");
    a(this, "_updateCallback");
    a(this, "_isAnimating");
    this._viewProp = t, this._isAnimating = !1;
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
  get isAnimating() {
    return this._isAnimating;
  }
  markAsAnimating() {
    this._isAnimating = !0;
  }
  callCompleteCallback() {
    var t;
    (t = this._completeCallback) == null || t.call(this), this._isAnimating = !1;
  }
  onUpdate(t) {
    this._updateCallback = t;
  }
  callUpdateCallback() {
    var t;
    (t = this._updateCallback) == null || t.call(this);
  }
}
class y {
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
    this._animatorProp = new ae(this), this._animatorFactory = t, this._initialValue = R(e), this._previousValue = R(e), this._targetValue = R(e), this._currentValue = R(e), this._hasChanged = !1, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
  }
  get isAnimating() {
    return this.animator.isAnimating;
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
    this._previousValue = R(this._currentValue), this._targetValue = t, e ? ((s = (i = this._animator).reset) == null || s.call(i), this.animator.markAsAnimating()) : this._currentValue = t, this._hasChanged = !0;
  }
  hasChanged() {
    return this._hasChanged;
  }
  // @ts-ignore
  update(t, e) {
  }
}
class oe extends y {
  constructor() {
    super(...arguments);
    a(this, "_invertedBorderRadius");
    a(this, "_forceStyleUpdateThisFrame", !1);
  }
  setFromElementPropValue(e) {
    this._setTarget(
      [
        e.value.topLeft,
        e.value.topRight,
        e.value.bottomRight,
        e.value.bottomLeft
      ],
      !0
    );
  }
  get value() {
    return {
      topLeft: this._currentValue[0],
      topRight: this._currentValue[1],
      bottomRight: this._currentValue[2],
      bottomLeft: this._currentValue[3]
    };
  }
  get invertedBorderRadius() {
    return this._invertedBorderRadius;
  }
  set(e, i = !0) {
    let s;
    if (typeof e == "string") {
      const c = M(e.trim());
      s = {
        topLeft: c.value.topLeft.valueWithUnit,
        topRight: c.value.topRight.valueWithUnit,
        bottomRight: c.value.bottomRight.valueWithUnit,
        bottomLeft: c.value.bottomLeft.valueWithUnit
      };
    } else
      s = e;
    const n = s.topLeft ? p(s.topLeft) : this._currentValue[0], r = s.topRight ? p(s.topRight) : this._currentValue[1], u = s.bottomRight ? p(s.bottomRight) : this._currentValue[2], h = s.bottomLeft ? p(s.bottomLeft) : this._currentValue[3];
    this._setTarget([n, r, u, h], i);
  }
  reset(e = !0) {
    this._setTarget(this._initialValue, e);
  }
  update(e, i) {
    if (this._forceStyleUpdateThisFrame)
      this._hasChanged = !0, this._forceStyleUpdateThisFrame = !1;
    else if (this._view.scale.isAnimating)
      this._hasChanged = !0;
    else if (ht(this._targetValue, this._currentValue)) {
      this._hasChanged = !ht(
        this._targetValue,
        this._initialValue
      );
      return;
    }
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: e,
      dt: i
    }), this._applyScaleInverse();
  }
  applyScaleInverse() {
    this._forceStyleUpdateThisFrame = !0;
  }
  _applyScaleInverse() {
    const e = this._rect.size.width * this._view.scale.x, i = this._rect.size.height * this._view.scale.y;
    this._invertedBorderRadius = Mt(
      M(
        `${this._currentValue[0].valueWithUnit} ${this._currentValue[1].valueWithUnit} ${this._currentValue[2].valueWithUnit} ${this._currentValue[3].valueWithUnit}`
      ).value,
      {
        width: e,
        height: i
      }
    );
  }
  projectStyles() {
    return this.invertedBorderRadius ? `border-radius: ${this.invertedBorderRadius.h.topLeft.valueWithUnit} ${this.invertedBorderRadius.h.topRight.valueWithUnit} ${this.invertedBorderRadius.h.bottomRight.valueWithUnit} ${this.invertedBorderRadius.h.bottomLeft.valueWithUnit} / ${this.invertedBorderRadius.v.topLeft.valueWithUnit} ${this.invertedBorderRadius.v.topRight.valueWithUnit} ${this.invertedBorderRadius.v.bottomRight.valueWithUnit} ${this.invertedBorderRadius.v.bottomLeft.valueWithUnit};` : `border-radius: ${this.value.topLeft.valueWithUnit} ${this.value.topRight.valueWithUnit} ${this.value.bottomRight.valueWithUnit} ${this.value.bottomLeft.valueWithUnit};`;
  }
  isTransform() {
    return !1;
  }
}
class ue extends y {
  setFromElementPropValue(t) {
    this._setTarget(t.value, !0);
  }
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
    if (v(this._targetValue, this._currentValue)) {
      this._hasChanged = !v(this._targetValue, this._initialValue);
      return;
    }
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: t,
      dt: e
    });
  }
  projectStyles() {
    return `opacity: ${this.value};`;
  }
  isTransform() {
    return !1;
  }
}
class le extends y {
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(t) {
    const i = { ...{ x: this.x, y: this.y }, ...t };
    if (i.x < 0 || i.x > 1) {
      console.log(
        `%c WARNING: ${this._view.name}.origin.x property can only be a value from 0 to 1`,
        "background: #885500"
      );
      return;
    }
    if (i.y < 0 || i.y > 1) {
      console.log(
        `%c WARNING: ${this._view.name}.origin.y property can only be a value from 0 to 1`,
        "background: #885500"
      );
      return;
    }
    this._setTarget(new l(i.x, i.y), !1);
  }
  reset() {
    this._setTarget(this._initialValue, !1);
  }
  projectStyles() {
    return `transform-origin: ${this.x * 100}% ${this.y * 100}%;`;
  }
  isTransform() {
    return !1;
  }
}
class he extends y {
  constructor() {
    super(...arguments);
    a(this, "_animateLayoutUpdateNextFrame", !1);
    a(this, "_parentScaleInverse", new l(1, 1));
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
    const i = typeof e.x > "u" ? this.initialX : e.x, s = typeof e.y > "u" ? this.initialY : e.y, n = new l(i, s), r = new l(this.initialX, this.initialY), u = new l(this.x, this.y), h = l.sub(u, r), c = l.sub(n, r);
    return 1 - l.sub(c, h).magnitude / c.magnitude;
  }
  set(e, i = !0) {
    const n = { ...{ x: this.x, y: this.y }, ...e };
    this._setTarget(
      new l(
        n.x - this._rect.pageOffset.left,
        n.y - this._rect.pageOffset.top
      ),
      i
    );
  }
  reset(e = !0) {
    this._setTarget(new l(0, 0), e);
  }
  update(e, i) {
    if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
      const c = this._view._parent, d = c ? c.scale.x : 1, g = c ? c.scale.y : 1;
      this._parentScaleInverse = new l(1 / d, 1 / g), this._parentScaleInverse.equals(new l(1, 1)) || (this._hasChanged = !0);
    }
    if (this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y)
      return;
    const s = this._view._parent, n = s ? s.scale.x : 1, r = s ? s.scale.y : 1, u = s ? s.scale._previousValue.x : 1, h = s ? s.scale._previousValue.y : 1;
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: new l(
        this._currentValue.x * n,
        this._currentValue.y * r
      ),
      target: this._targetValue,
      initial: new l(
        this._previousValue.x * u,
        this._previousValue.y * h
      ),
      ts: e,
      dt: i
    }), this._currentValue = new l(
      this._currentValue.x / n,
      this._currentValue.y / r
    );
  }
  _runLayoutTransition() {
    const e = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), i = !(this._view.scale._targetValue.x === this._view.scale._currentValue.x && this._view.scale._targetValue.y === this._view.scale._currentValue.y), s = e || i, n = this._rect.pageOffset.left - this._previousRect.pageOffset.left, r = this._rect.pageOffset.top - this._previousRect.pageOffset.top, u = this._previousRect.size.width / this._rect.size.width, h = this._previousRect.size.height / this._rect.size.height;
    let c = !1;
    if (n !== 0 || r !== 0 || !Number.isNaN(u) && u !== 1 || !Number.isNaN(h) && h !== 1 ? c = !0 : c = (() => {
      const d = this._view._parents;
      for (let g = 0; g < d.length; g++) {
        const _ = d[g], f = _.previousRect.size.width / _.rect.size.width, m = _.previousRect.size.height / _.rect.size.height;
        if (f !== 1 || m !== 1)
          return !0;
      }
      return !1;
    })(), c) {
      if (this._currentValue.x !== 0 || this._currentValue.y !== 0 || this._view.scale._currentValue.x !== 1 || this._view.scale._currentValue.y !== 1) {
        if (!s) {
          const A = this._rect.pageOffset.left - this._previousRect.pageOffset.left, T = this._rect.pageOffset.top - this._previousRect.pageOffset.top;
          this._setTarget(
            new l(this._currentValue.x - A, this._currentValue.y - T),
            !1
          );
          return;
        }
        const w = this._view._parent, tt = this._rect.pageOffset, et = this._view.getScroll(), E = {
          left: this._previousRect.viewportOffset.left + et.x,
          top: this._previousRect.viewportOffset.top + et.y
        }, bt = E.left - tt.left, Rt = E.top - tt.top;
        let it = 0, st = 0, nt = 0, rt = 0;
        if (w) {
          const A = w.rect.pageOffset, T = w.getScroll(), C = {
            left: w.previousRect.viewportOffset.left + T.x,
            top: w.previousRect.viewportOffset.top + T.y
          };
          it = C.left - A.left, st = C.top - A.top;
          const at = E.top - C.top, ot = E.left - C.left, xt = w.scale.y * at;
          nt = (at - xt) / w.scale.y;
          const Et = w.scale.x * ot;
          rt = (ot - Et) / w.scale.x;
        }
        this._setTarget(
          new l(bt - it + rt, Rt - st + nt),
          !1
        ), s && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      this._animateLayoutUpdateNextFrame = !0;
      const d = this._previousRect, g = this._rect, _ = this._view._parent;
      let f = 0, m = 0;
      _ && (f = _.previousRect.viewportOffset.left - _.rect.viewportOffset.left), _ && (m = _.previousRect.viewportOffset.top - _.rect.viewportOffset.top);
      let x = 1, F = 1;
      _ && (x = _.previousRect.size.width / _.rect.size.width, F = _.previousRect.size.height / _.rect.size.height);
      const mt = _ ? _.previousRect.viewportOffset.left : 0, vt = _ ? _.previousRect.viewportOffset.top : 0, J = d.viewportOffset.left - mt, Q = d.viewportOffset.top - vt, wt = J / x - J, yt = Q / F - Q;
      let Vt = d.viewportOffset.left - g.viewportOffset.left - f + wt;
      const Pt = d.viewportOffset.top - g.viewportOffset.top - m + yt;
      this._setTarget(new l(Vt, Pt), !1);
    } else
      this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
  }
  projectStyles() {
    let e = 0, i = 0;
    return (this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && (e = (this._rect.size.width * this._parentScaleInverse.x * this._view.scale.x - this._rect.size.width) * this._view.origin.x, i = (this._rect.size.height * this._parentScaleInverse.y * this._view.scale.y - this._rect.size.height) * this._view.origin.y), `translate3d(${this._currentValue.x + e}px, ${this._currentValue.y + i}px, 0)`;
  }
  isTransform() {
    return !0;
  }
}
class ce extends y {
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
class de extends y {
  constructor() {
    super(...arguments);
    a(this, "_animateLayoutUpdateNextFrame", !1);
  }
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(e, i = !0) {
    const r = { ...{ x: this._currentValue.x, y: this._currentValue.y }, ...typeof e == "number" ? { x: e, y: e } : e };
    this._setTarget(new l(r.x, r.y), i);
  }
  setWithSize(e, i = !0) {
    let s = this._currentValue.x, n = this._currentValue.y;
    e.width && (s = e.width / this._rect.size.width), e.height && (n = e.height / this._rect.size.height), !e.width && e.height && (s = n), !e.height && e.width && (n = s);
    const r = { x: s, y: n };
    this._setTarget(new l(r.x, r.y), i);
  }
  reset(e = !0) {
    this._setTarget(new l(1, 1), e);
  }
  update(e, i) {
    if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
      const s = this._view._parent, n = s ? s.scale.x : 1, r = s ? s.scale.y : 1;
      this._hasChanged = n !== 1 || r !== 1;
    }
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: new l(this._previousValue.x, this._previousValue.y),
      ts: e,
      dt: i
    }));
  }
  _runLayoutTransition() {
    const e = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), i = this._previousRect.size.width / this._rect.size.width, s = this._previousRect.size.height / this._rect.size.height;
    let n = !1;
    if ((!Number.isNaN(i) && i !== 1 || !Number.isNaN(s) && s !== 1) && (n = !0), n) {
      if (this._currentValue.x !== 1 || this._currentValue.y !== 1) {
        const d = this._view.previousRect.size.width / this._view.rect.size.width, g = this._view.previousRect.size.height / this._view.rect.size.height;
        this._setTarget(
          new l(this._currentValue.x * d, this._currentValue.y * g),
          !1
        ), e && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      const r = this._previousRect.size.width / this._rect.size.width, u = this._previousRect.size.height / this._rect.size.height, h = r, c = u;
      this._view.viewProps.borderRadius.applyScaleInverse(), this._setTarget(new l(h, c), !1), this._animateLayoutUpdateNextFrame = !0;
    } else
      this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
  }
  projectStyles() {
    const e = this._view._parent ? this._view._parent.scale.x : 1, i = this._view._parent ? this._view._parent.scale.y : 1, s = this._currentValue.x / e, n = this._currentValue.y / i;
    return `scale3d(${s}, ${n}, 1)`;
  }
  isTransform() {
    return !0;
  }
}
class _e extends y {
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
    this._setTarget(new l(s.width, s.height), e);
  }
  setWidth(t, e = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, width: t };
    this._setTarget(new l(s.width, s.height), e);
  }
  setHeight(t, e = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, height: t };
    this._setTarget(new l(s.width, s.height), e);
  }
  reset(t = !0) {
    this._setTarget(
      new l(this.initialWidth, this.initialHeight),
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
class ge {
  constructor(t) {
    a(this, "_props", /* @__PURE__ */ new Map());
    this._props.set(
      "position",
      new he(new I(), new l(0, 0), t)
    ), this._props.set(
      "scale",
      new de(new I(), new l(1, 1), t)
    ), this._props.set(
      "rotation",
      new ce(new ct(), 0, t)
    ), this._props.set(
      "size",
      new _e(
        new I(),
        new l(t.rect.size.width, t.rect.size.height),
        t
      )
    ), this._props.set(
      "opacity",
      new ue(
        new ct(),
        t.elementReader.opacity.value,
        t
      )
    ), this._props.set(
      "borderRadius",
      new oe(
        new re(),
        [
          t.elementReader.borderRadius.value.topLeft,
          t.elementReader.borderRadius.value.topRight,
          t.elementReader.borderRadius.value.bottomRight,
          t.elementReader.borderRadius.value.bottomLeft
        ],
        t
      )
    ), this._props.set(
      "origin",
      new le(
        new I(),
        t.elementReader.origin.value,
        t
      )
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
  get borderRadius() {
    return this._props.get("borderRadius");
  }
  get origin() {
    return this._props.get("origin");
  }
}
class pe {
  constructor(t, e, i) {
    a(this, "id");
    a(this, "name");
    a(this, "element");
    a(this, "styles", {});
    a(this, "_viewProps");
    a(this, "_previousRect");
    a(this, "_onAddCallbacks");
    a(this, "_onRemoveCallback");
    a(this, "_skipFirstRenderFrame");
    a(this, "_layoutTransition");
    a(this, "_registry");
    a(this, "_layoutId");
    a(this, "_elementReader");
    a(this, "_temporaryView");
    a(this, "_inverseEffect");
    this.id = pt(), this.name = e, this.element = t, this._elementReader = $(t), this._previousRect = this._elementReader.rect, this._viewProps = new ge(this), this._skipFirstRenderFrame = !0, this._layoutId = t.dataset.velLayoutId, this._layoutTransition = !!this._layoutId, this._registry = i, this.element.dataset.velViewId = this.id, this._temporaryView = !1, this._inverseEffect = !1;
  }
  destroy() {
    this.element.removeAttribute("data-vel-view-id"), this.element.removeAttribute("data-vel-plugin-id");
  }
  get elementReader() {
    return this._elementReader;
  }
  setElement(t) {
    this.element = t, this._elementReader = $(this.element), this.element.dataset.velViewId = this.id;
  }
  get layoutId() {
    return this._layoutId;
  }
  get position() {
    return this._viewProps.position;
  }
  get scale() {
    return this._viewProps.scale;
  }
  get _children() {
    return Array.from(this.element.children).map((e) => e.dataset.velViewId).filter((e) => e && typeof e == "string").map((e) => this._registry.getViewById(e)).filter((e) => !!e);
  }
  get _parent() {
    var i;
    const t = this.element.parentElement;
    if (!t)
      return;
    const e = t.closest("[data-vel-view-id]");
    if ((i = e == null ? void 0 : e.dataset) != null && i.velViewId)
      return this._registry.getViewById(e.dataset.velViewId);
  }
  get _parents() {
    var i;
    const t = [];
    let e = this.element.parentElement;
    if (!e)
      return t;
    for (e = e.closest("[data-vel-view-id]"); e; ) {
      const s = e.dataset.velViewId;
      if (s) {
        const n = this._registry.getViewById(s);
        n && t.push(n);
      }
      e = (i = e.parentElement) == null ? void 0 : i.closest(
        "[data-vel-view-id]"
      );
    }
    return t;
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
  get borderRadius() {
    return this._viewProps.borderRadius;
  }
  get origin() {
    return this._viewProps.origin;
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
  get hasLayoutTransitionEnabledForParents() {
    return this._parents.some((t) => t.isLayoutTransitionEnabled);
  }
  get isInverseEffectEnabled() {
    return this._parents.some((t) => t._inverseEffect);
  }
  layoutTransition(t) {
    this._layoutTransition = t, this.inverseEffect(t);
  }
  inverseEffect(t) {
    this._inverseEffect = t, t && this._children.forEach((e) => {
      if (e.position.animator.name === "instant") {
        const i = this.viewProps.position.getAnimator();
        e.position.setAnimator(
          i.name,
          i.config
        );
      }
      if (e.scale.animator.name === "instant") {
        const i = this.viewProps.scale.getAnimator();
        e.scale.setAnimator(i.name, i.config);
      }
    });
  }
  setAnimatorsFromParent() {
    let t = this._parent;
    for (; t && !t._inverseEffect; )
      t = t._parent;
    if (t) {
      if (this.position.animator.name === "instant") {
        const e = t.viewProps.position.getAnimator();
        this.position.setAnimator(e.name, e.config);
      }
      if (this.scale.animator.name === "instant") {
        const e = t.viewProps.scale.getAnimator();
        this.scale.setAnimator(e.name, e.config);
      }
    }
  }
  get _isRemoved() {
    return !this._registry.getViewById(this.id);
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
    const e = new l(this.position.x, this.position.y), i = new l(t.position.x, t.position.y);
    return l.sub(i, e).magnitude;
  }
  read() {
    this._elementReader = $(this.element);
  }
  get rect() {
    return this._elementReader.rect;
  }
  get previousRect() {
    return this._previousRect;
  }
  update(t, e) {
    this._viewProps.allProps().forEach((i) => i.update(t, e));
  }
  _updatePreviousRect() {
    this._previousRect = this._elementReader.rect;
  }
  setAsTemporaryView() {
    this._temporaryView = !0;
  }
  get isTemporaryView() {
    return this._temporaryView;
  }
  render() {
    if (this._isRemoved && this._skipFirstRenderFrame) {
      this._skipFirstRenderFrame = !1;
      return;
    }
    let t = "";
    const e = this._viewProps.allProps(), i = e.filter((n) => n.isTransform()), s = e.filter((n) => !n.isTransform());
    if (i.some((n) => n.hasChanged())) {
      const n = i.reduce((r, u, h) => (r += u.projectStyles(), h === i.length - 1 && (r += ";"), r), "transform: ");
      t += n;
    }
    s.forEach((n) => {
      n.hasChanged() && (t += n.projectStyles());
    }), t += this._getUserStyles(), this.element.style.cssText = t;
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((t, e) => e ? t + `${It(e)}: ${this.styles[e]};` : t, "");
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
  getPropByName(t) {
    return this._viewProps.getPropByName(t);
  }
  _copyAnimatorsToAnotherView(t) {
    t.viewProps.allPropNames().forEach((e) => {
      var s, n;
      const i = (s = this.viewProps.getPropByName(e)) == null ? void 0 : s.getAnimator();
      i && ((n = t.viewProps.getPropByName(e)) == null || n.setAnimator(i.name, i.config));
    });
  }
}
class fe {
  constructor(t, e) {
    a(this, "_appEventBus");
    a(this, "_eventBus");
    a(this, "_plugins", []);
    a(this, "_views", []);
    a(this, "_viewsPerPlugin", /* @__PURE__ */ new Map());
    a(this, "_viewsToBeCreated", []);
    a(this, "_viewsToBeRemoved", []);
    a(this, "_viewsCreatedInPreviousFrame", []);
    a(this, "_layoutIdToViewMap", /* @__PURE__ */ new Map());
    a(this, "_eventPluginsPerPlugin", /* @__PURE__ */ new Map());
    this._appEventBus = t, this._eventBus = e;
  }
  update() {
    this._handleRemovedViews(), this._handleAddedViews();
  }
  associateEventPluginWithPlugin(t, e) {
    let i = this._eventPluginsPerPlugin.get(t);
    i || (i = [], this._eventPluginsPerPlugin.set(t, i)), i.push(e);
  }
  _handleRemovedViews() {
    const t = this._viewsToBeRemoved.filter((e) => e.dataset.velViewId);
    t.length && (t.forEach((e) => {
      const i = e.dataset.velViewId;
      i && this._handleRemoveView(i);
    }), this._viewsToBeRemoved = []);
  }
  _getPluginNameForElement(t) {
    const e = t.dataset.velPlugin;
    if (e && e.length > 0)
      return e;
    const i = t.closest("[data-vel-plugin]");
    if (i)
      return i.dataset.velPlugin;
  }
  _handleAddedViews() {
    this._viewsCreatedInPreviousFrame.forEach((e) => {
      e.markAsAdded();
    }), this._viewsCreatedInPreviousFrame = [];
    const t = this._viewsToBeCreated.filter((e) => {
      const i = this._getPluginNameForElement(e);
      return i ? this.getPluginByName(i) : !1;
    });
    t.length !== 0 && (t.forEach((e) => {
      const i = this._getPluginNameForElement(e), s = e.dataset.velView, n = e.dataset.velLayoutId;
      if (!s || !i)
        return;
      const r = this.getPluginByName(i);
      if (!r)
        return;
      let u;
      n && this._layoutIdToViewMap.has(n) ? (u = this._layoutIdToViewMap.get(n), u.setElement(e), u.setPluginId(r.id), this._createChildrenForView(u, r)) : u = this._createNewView(e, s, r), u.isInverseEffectEnabled && u.setAnimatorsFromParent(), r.notifyAboutViewAdded(u);
    }), this._viewsToBeCreated = []);
  }
  _createNewView(t, e, i) {
    const s = this.createView(t, e);
    return i.addView(s), s.layoutId && this._layoutIdToViewMap.set(s.layoutId, s), this._createChildrenForView(s, i), this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api, !0), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api);
      });
    }), s;
  }
  _createChildrenForView(t, e) {
    const i = t.element.querySelectorAll("*");
    if (!i.length)
      return;
    Array.from(i).filter(
      (n) => {
        const r = n, u = r.dataset.velPlugin;
        if (!r.dataset.velView || !u)
          return !0;
      }
    ).forEach((n) => {
      const r = n, u = r.dataset.velView ? r.dataset.velView : `${t.name}-child`, h = this.createView(n, u);
      e.addView(h), e.notifyAboutViewAdded(h);
    });
  }
  _handleRemoveView(t) {
    this._plugins.forEach((e) => {
      if (!this._viewsPerPlugin.get(e.id))
        return;
      const s = this._getPluginViewById(e, t);
      s && e.removeView(s);
    });
  }
  removeViewById(t, e) {
    this._unassignViewFromPlugin(t, e), this._views = this._views.filter((i) => i.id !== t);
  }
  _unassignViewFromPlugin(t, e) {
    const i = this._viewsPerPlugin.get(e);
    if (!i)
      return;
    const s = i.indexOf(t);
    s !== -1 && i.splice(s, 1);
  }
  getViewById(t) {
    return this._views.find((e) => e.id === t);
  }
  _getPluginById(t) {
    return this._plugins.find((e) => e.id === t);
  }
  _getPluginViewById(t, e) {
    return this.getViewsForPlugin(t).find((i) => i.id === e);
  }
  destroy(t, e) {
    if (!t) {
      this._destroyAll();
      return;
    }
    let i = [];
    if (t && t.length > 0) {
      const s = this.getPluginByName(t);
      if (s) {
        const r = (this._eventPluginsPerPlugin.get(s.id) || []).map((u) => this._getPluginById(u)).filter((u) => typeof u < "u");
        i.push(s), i.push(...r);
      }
    } else
      i = this._plugins;
    requestAnimationFrame(() => {
      i.forEach((s) => {
        this._destroyPlugin(s);
      }), requestAnimationFrame(() => {
        e == null || e();
      });
    });
  }
  _destroyPlugin(t) {
    const e = this.getViewsForPlugin(t);
    e.forEach((i) => {
      i.layoutId && this._layoutIdToViewMap.delete(i.layoutId), i.destroy();
    }), this._views = this._views.filter(
      (i) => !e.find((s) => s.id === i.id)
    ), this._viewsPerPlugin.delete(t.id), this._plugins = this._plugins.filter((i) => i.id !== t.id);
  }
  _destroyAll() {
    this._plugins = [], this._views = [], this._viewsPerPlugin.clear(), this._viewsToBeCreated = [], this._viewsToBeRemoved = [], this._viewsCreatedInPreviousFrame = [], this._layoutIdToViewMap.clear(), this._eventPluginsPerPlugin.clear();
  }
  reset(t, e) {
    let i = [];
    if (t && t.length > 0) {
      const s = this.getPluginByName(t);
      if (s) {
        const r = (this._eventPluginsPerPlugin.get(s.id) || []).map((u) => this._getPluginById(u)).filter((u) => typeof u < "u");
        i.push(s), i.push(...r);
      }
    } else
      i = this._plugins;
    requestAnimationFrame(() => {
      i.forEach((s) => {
        this._resetPlugin(s);
      }), requestAnimationFrame(() => {
        e == null || e();
      });
    });
  }
  _resetPlugin(t) {
    const e = t.config, i = t.pluginFactory, s = t.internalBusEvent, n = !t.isRenderable(), r = this.getViewsForPlugin(t);
    r.forEach((u) => {
      u.layoutId && this._layoutIdToViewMap.delete(u.layoutId), u.destroy();
    }), this._views = this._views.filter(
      (u) => !r.find((h) => h.id === u.id)
    ), this._viewsPerPlugin.delete(t.id), this._plugins = this._plugins.filter((u) => u.id !== t.id), n || requestAnimationFrame(() => {
      this.createPlugin(
        i,
        this._eventBus,
        e
      ).setInternalEventBus(s);
    });
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
  getPluginByName(t, e) {
    return this._plugins.find((i) => e ? i.pluginKey === e && i.pluginName === t : i.pluginName === t);
  }
  getPluginsByName(t, e) {
    return this._plugins.filter((i) => e ? i.pluginKey === e && i.pluginName === t : i.pluginName === t);
  }
  hasPlugin(t) {
    return t.pluginName ? !!this.getPluginByName(t.pluginName) : !1;
  }
  createPlugin(t, e, i = {}) {
    if (!t.pluginName)
      throw Error(
        `Plugin ${t.name} must contain a pluginName field`
      );
    let s = [];
    if (t.scope) {
      const u = document.querySelectorAll(
        `[data-vel-plugin=${t.pluginName}][data-vel-view=${t.scope}]`
      );
      u ? s = Array.from(u) : s = [document.documentElement];
    } else
      s = [document.documentElement];
    const n = s.map((u) => {
      const h = u.dataset.velPluginKey, c = lt(
        t,
        this,
        e,
        this._appEventBus,
        i,
        h
      );
      this._plugins.push(c);
      let d = [];
      u !== document.documentElement && d.push(u);
      const g = u.querySelectorAll(
        `[data-vel-plugin=${c.pluginName}]`
      );
      return d = [...d, ...g], d.length && d.forEach((_) => {
        const f = _.dataset.velView;
        if (!f)
          return;
        const m = this._createNewView(_, f, c);
        c.notifyAboutViewAdded(m);
      }), c;
    });
    if (n && n.length > 0)
      return n[0];
    const r = lt(
      t,
      this,
      e,
      this._appEventBus,
      i
    );
    return console.log(
      `%c WARNING: The plugin "${r.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), r;
  }
  getViews() {
    return this._views;
  }
  createView(t, e) {
    const i = new pe(t, e, this);
    return this._views.push(i), this._viewsCreatedInPreviousFrame.push(i), i;
  }
  assignViewToPlugin(t, e) {
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
class dt {
  constructor(t) {
    a(this, "pluginApi");
    this.pluginApi = t.pluginApi;
  }
}
class _t {
  constructor(t) {
    a(this, "pluginApi");
    this.pluginApi = t.pluginApi;
  }
}
class Z {
  constructor() {
    a(this, "_previousTime", 0);
    a(this, "_registry");
    a(this, "_eventBus");
    a(this, "_appEventBus");
    this._eventBus = new k(), this._appEventBus = new k(), this._registry = new fe(this._appEventBus, this._eventBus), new Nt(this._eventBus);
  }
  static create() {
    return new Z();
  }
  addPlugin(t, e = {}) {
    this._registry.hasPlugin(t) || this._registry.createPlugin(t, this._eventBus, e);
  }
  reset(t, e) {
    this._registry.reset(t, e);
  }
  destroy(t, e) {
    this._registry.destroy(t, e);
  }
  getPlugin(t, e) {
    let i = typeof t == "string" ? t : t.pluginName;
    const s = this._registry.getPluginByName(i, e);
    if (!s)
      throw new Error(
        `You can't call getPlugin for ${i} with key: ${e} because it does not exist in your app`
      );
    return s.api;
  }
  getPlugins(t, e) {
    let i = typeof t == "string" ? t : t.pluginName;
    const s = this._registry.getPluginsByName(i, e);
    if (s.length === 0)
      throw new Error(
        `You can't call getPlugins for ${i} with key: ${e} because they don't exist in your app`
      );
    return s.map((n) => n.api);
  }
  onPluginEvent(t, e, i) {
    const s = this._registry.getPluginByName(t.pluginName);
    s && s.on(e, i);
  }
  run() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", this._start.bind(this)) : this._start();
  }
  ready(t, e) {
    this._appEventBus.subscribeToPluginReadyEvent(e, t);
  }
  _start() {
    this._setup(), requestAnimationFrame(this._tick.bind(this));
  }
  _setup() {
    this._listenToNativeEvents(), this._subscribeToEvents();
  }
  _listenToNativeEvents() {
    document.addEventListener("click", (t) => {
      this._eventBus.emitEvent(z, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointermove", (t) => {
      this._eventBus.emitEvent(B, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerdown", (t) => {
      this._eventBus.emitEvent(L, {
        x: t.clientX,
        y: t.clientY,
        target: t.target
      });
    }), document.addEventListener("pointerup", (t) => {
      this._eventBus.emitEvent(S, {
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
      D,
      this._onNodeAdded.bind(this)
    ), this._eventBus.subscribeToEvent(
      O,
      this._onNodeRemoved.bind(this)
    ), this._eventBus.subscribeToEvent(
      gt,
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
    }), this._registry.getViews().forEach((i) => {
      i._updatePreviousRect();
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
function Ae() {
  return Z.create();
}
class me {
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
class ve extends U {
  constructor() {
    super(...arguments);
    a(this, "_pointerX", 0);
    a(this, "_pointerY", 0);
    a(this, "_initialPointer", new l(0, 0));
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
    e.subscribeToEvent(L, ({ x: i, y: s, target: n }) => {
      this._initialPointer = new l(i, s), this.getViews().forEach((r) => {
        this._pointerDownPerView.set(r.id, r.intersects(i, s)), this._targetPerView.set(r.id, n);
        const u = new l(
          i - r.position.x,
          s - r.position.y
        );
        this._pointerX = i, this._pointerY = s, this._initialPointerPerView.set(r.id, u);
      });
    }), e.subscribeToEvent(S, () => {
      this.getViews().forEach((i) => {
        this._pointerDownPerView.get(i.id) && this._initialPointerPerView.get(i.id) && (this._pointerDownPerView.set(i.id, !1), this._emitEvent(i, []));
      });
    }), e.subscribeToEvent(B, ({ x: i, y: s }) => {
      this._pointerX = i, this._pointerY = s, this.getViews().forEach((n) => {
        if (this._pointerDownPerView.get(n.id) && this._initialPointerPerView.get(n.id)) {
          this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []);
          const r = new l(i, s), u = this._viewPointerPositionLog.get(n.id);
          u && u.push(new l(i, s));
          const h = u && u.length >= 2 ? u[u.length - 2] : r.clone(), c = this._calculateDirections(
            h,
            r
          );
          this._emitEvent(n, c);
        }
      });
    });
  }
  _emitEvent(e, i) {
    const s = this._viewPointerPositionLog.get(e.id), n = s && s.length >= 2 ? s[s.length - 2] : null, r = this._pointerX - this._initialPointerPerView.get(e.id).x, u = this._pointerY - this._initialPointerPerView.get(e.id).y, h = n ? n.x - this._initialPointerPerView.get(e.id).x : r, c = n ? n.y - this._initialPointerPerView.get(e.id).y : u, d = this._pointerY - this._initialPointer.y, g = this._pointerX - this._initialPointer.x, _ = this._targetPerView.get(e.id);
    if (!_ || !e.hasElement(_))
      return;
    const f = this._pointerDownPerView.get(e.id) === !0;
    f || this._viewPointerPositionLog.clear();
    const m = {
      view: e,
      target: _,
      previousX: h,
      previousY: c,
      x: r,
      y: u,
      width: g,
      height: d,
      isDragging: f,
      directions: i
    };
    this.emit(me, m);
  }
  _calculateDirections(e, i) {
    const s = {
      up: l.sub(new l(e.x, e.y - 1), e),
      down: l.sub(new l(e.x, e.y + 1), e),
      left: l.sub(new l(e.x - 1, e.y), e),
      right: l.sub(new l(e.x + 1, e.y), e)
    }, n = l.sub(i, e).unitVector;
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
a(ve, "pluginName", "DragEventPlugin");
class we {
  constructor(t) {
    a(this, "view");
    a(this, "direction");
    this.props = t, this.view = t.view, this.direction = t.direction;
  }
}
class ye extends U {
  constructor() {
    super(...arguments);
    a(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map());
    a(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    a(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(e) {
    e.subscribeToEvent(L, ({ x: i, y: s, target: n }) => {
      this.getViews().forEach((r) => {
        this._targetPerView.set(r.id, n), r.intersects(i, s) && this._viewIsPointerDownMap.set(r.id, !0);
      });
    }), e.subscribeToEvent(B, ({ x: i, y: s }) => {
      this.getViews().forEach((n) => {
        if (!this._viewIsPointerDownMap.get(n.id))
          return;
        this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []), this._viewPointerPositionLog.get(n.id).push(new l(i, s));
      });
    }), e.subscribeToEvent(S, ({ x: i, y: s }) => {
      this.getViews().forEach((r) => {
        if (!this._viewIsPointerDownMap.get(r.id) || !this._viewPointerPositionLog.has(r.id))
          return;
        const u = new l(i, s), h = this._viewPointerPositionLog.get(r.id), c = h[h.length - 2] || u.clone(), d = this._targetPerView.get(r.id), g = n(c, u);
        d && r.hasElement(d) && g.hasSwiped && this.emit(we, {
          view: r,
          direction: g.direction
        }), this._viewPointerPositionLog.set(r.id, []), this._viewIsPointerDownMap.set(r.id, !1);
      });
      function n(r, u) {
        const h = {
          up: l.sub(new l(r.x, r.y - 1), r),
          down: l.sub(new l(r.x, r.y + 1), r),
          left: l.sub(new l(r.x - 1, r.y), r),
          right: l.sub(new l(r.x + 1, r.y), r)
        }, c = l.sub(u, r).unitVector, d = [
          "up",
          "down",
          "left",
          "right"
        ], g = [
          c.dot(h.up),
          c.dot(h.down),
          c.dot(h.left),
          c.dot(h.right)
        ], _ = Math.max(...g), f = g.indexOf(_), m = d[f], x = l.sub(u, r).magnitude;
        return {
          hasSwiped: c.dot(h[m]) * x > 30,
          direction: m
        };
      }
    });
  }
}
a(ye, "pluginName", "SwipeEventPlugin");
class Ve {
  constructor(t) {
    a(this, "view");
    this.props = t, this.view = t.view;
  }
}
class Pe extends U {
  subscribeToEvents(t) {
    t.subscribeToEvent(z, ({ x: e, y: i, target: s }) => {
      this.getViews().forEach((n) => {
        const r = s, u = n.element === r || n.element.contains(r);
        n.intersects(e, i) && u && this.emit(Ve, {
          view: n
        });
      });
    });
  }
}
a(Pe, "pluginName", "ClickEventPlugin");
function be(o, t) {
  const e = o.map(t), i = Math.min(...e), s = e.indexOf(i);
  return o[s];
}
const Te = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clamp: Dt,
  minBy: be,
  valueAtPercentage: Ot
}, Symbol.toStringTag, { value: "Module" })), Ce = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: z,
  PointerDownEvent: L,
  PointerMoveEvent: B,
  PointerUpEvent: S
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ve as ClickEvent,
  Pe as ClickEventPlugin,
  gt as DataChangedEvent,
  me as DragEvent,
  ve as DragEventPlugin,
  k as EventBus,
  U as EventPlugin,
  Ce as Events,
  St as Plugin,
  Ft as PluginContext,
  we as SwipeEvent,
  ye as SwipeEventPlugin,
  Te as Utils,
  Ae as createApp
};
