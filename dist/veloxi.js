var Ie = Object.defineProperty;
var Ce = (a, e, t) => e in a ? Ie(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var o = (a, e, t) => (Ce(a, typeof e != "symbol" ? e + "" : e, t), t);
class C {
  constructor(e) {
    o(this, "x");
    o(this, "y");
    o(this, "target");
    this.x = e.x, this.y = e.y, this.target = e.target;
  }
}
class U extends C {
}
class L extends C {
}
class B extends C {
}
class S extends C {
}
class fe {
  constructor(e) {
    o(this, "pluginId");
    o(this, "pluginName");
    o(this, "viewName");
    o(this, "dataName");
    o(this, "dataValue");
    this.event = e, this.pluginId = e.pluginId, this.pluginName = e.pluginName, this.viewName = e.viewName, this.dataName = e.dataName, this.dataValue = e.dataValue;
  }
}
function Le(a) {
  return a.replace(/(?:^\w|[A-Z]|\b\w)/g, function(e, t) {
    return t === 0 ? e.toLowerCase() : e.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function Be(a) {
  return a.split("").map((e, t) => e.toUpperCase() === e ? `${t !== 0 ? "-" : ""}${e.toLowerCase()}` : e).join("");
}
class D {
  constructor(e) {
    o(this, "node");
    this.node = e.node;
  }
}
class O {
  constructor(e) {
    o(this, "node");
    this.node = e.node;
  }
}
class Se {
  constructor(e) {
    o(this, "_eventBus");
    o(this, "_observer");
    this._eventBus = e, this._observer = new MutationObserver(this._handler.bind(this)), this._observer.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeOldValue: !0
    });
  }
  _handler(e) {
    e.forEach((t) => {
      t.addedNodes.forEach((n) => {
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
      }), t.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement) || typeof n.dataset.velProcessing < "u")
          return;
        const r = n.querySelectorAll("[data-vel-plugin]");
        r.length && r.forEach((u) => {
          this._eventBus.emitEvent(O, { node: u });
        }), this._eventBus.emitEvent(O, { node: n });
      });
      const i = t.attributeName;
      if (i && /data-vel-data-.+/gi.test(i)) {
        const n = t.target, r = n.dataset.velPluginId || "", u = n.dataset.velPlugin || "", h = n.dataset.velView || "", c = n.getAttribute(i);
        if (c && c !== t.oldValue) {
          const g = Le(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(fe, {
            pluginId: r,
            pluginName: u,
            viewName: h,
            dataName: g,
            dataValue: c
          });
        }
      }
    });
  }
}
class Fe {
  execute(e) {
    this.call(e);
  }
}
class he extends Fe {
  constructor(t) {
    super();
    o(this, "_handler");
    this._handler = t;
  }
  call(t) {
    this._handler(t);
  }
}
class k {
  constructor() {
    o(this, "_listeners", /* @__PURE__ */ new Map());
    o(this, "_keyedListeners", /* @__PURE__ */ new Map());
  }
  subscribeToEvent(e, t, i) {
    if (i) {
      this._subscribeToKeyedEvent(e, t, i);
      return;
    }
    let s = this._listeners.get(e);
    s || (s = [], this._listeners.set(e, s)), s.push(new he(t));
  }
  _subscribeToKeyedEvent(e, t, i) {
    let s = this._keyedListeners.get(e);
    s || (s = /* @__PURE__ */ new Map(), this._keyedListeners.set(e, s));
    let n = s.get(i);
    n || (n = [], s.set(i, n)), n.push(new he(t));
  }
  emitEvent(e, t, i) {
    if (i) {
      this._emitKeyedEvent(e, t, i);
      return;
    }
    const s = this._listeners.get(e);
    s && s.forEach((n) => {
      n.execute(t);
    });
  }
  _emitKeyedEvent(e, t, i) {
    const s = this._keyedListeners.get(e);
    if (!s)
      return;
    const n = s.get(i);
    n && n.forEach((r) => {
      r.execute(t);
    });
  }
  _convertListener(e) {
    return (t) => e(t);
  }
  subscribeToPluginReadyEvent(e, t, i = !1) {
    if (i) {
      this.subscribeToEvent(
        pe,
        this._convertListener(e),
        t
      );
      return;
    }
    this.subscribeToEvent(
      _e,
      this._convertListener(e),
      t
    );
  }
  emitPluginReadyEvent(e, t, i = !1) {
    if (i) {
      this.emitEvent(
        pe,
        t,
        e
      );
      return;
    }
    this.emitEvent(
      _e,
      t,
      e
    );
  }
  reset() {
    this._listeners.clear();
  }
}
let Me = 0;
function me() {
  return Me++ + "";
}
class ve {
  constructor(e, t, i, s, n, r, u) {
    o(this, "_registry");
    o(this, "_eventBus");
    o(this, "_appEventBus");
    o(this, "_internalEventBus");
    o(this, "_initialized", !1);
    o(this, "_config");
    o(this, "_pluginFactory");
    o(this, "_pluginName");
    o(this, "_id");
    o(this, "_pluginKey");
    o(this, "_layoutIdViewMapWaitingToEnter");
    o(this, "_apiData");
    o(this, "_isReady", !1);
    this._id = me(), this._pluginFactory = e, this._pluginName = t, this._registry = i, this._eventBus = s, this._appEventBus = n, this._internalEventBus = new k(), this._config = r, this._layoutIdViewMapWaitingToEnter = /* @__PURE__ */ new Map(), this._pluginKey = u, this._apiData = {}, this._appEventBus.subscribeToPluginReadyEvent(
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
  _setApi(e) {
    this._apiData = e;
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
  getViews(e) {
    return e ? this._registry.getViewsByNameForPlugin(this, e) : this._registry.getViewsForPlugin(this);
  }
  getView(e) {
    return e ? this._registry.getViewsByNameForPlugin(this, e)[0] : this._registry.getViewsForPlugin(this)[0];
  }
  getViewById(e) {
    return this._registry.getViewById(e);
  }
  addView(e) {
    this._registry.assignViewToPlugin(e, this);
  }
  setInternalEventBus(e) {
    this._internalEventBus = e;
  }
  get internalBusEvent() {
    return this._internalEventBus;
  }
  emit(e, t) {
    this._internalEventBus.emitEvent(e, t);
  }
  on(e, t) {
    this._internalEventBus.subscribeToEvent(e, t);
  }
  useEventPlugin(e, t = {}) {
    const i = this._registry.createPlugin(
      e,
      this._eventBus,
      t
    );
    return this._registry.associateEventPluginWithPlugin(this.id, i.id), i;
  }
  notifyAboutDataChanged(e) {
    this.onDataChanged(e);
  }
  // @ts-ignore
  onDataChanged(e) {
  }
  removeView(e) {
    e.onRemoveCallback ? this._invokeRemoveCallback(e) : this._deleteView(e), this.onViewRemoved(e);
  }
  _invokeRemoveCallback(e) {
    const t = this._createTemporaryView(e);
    requestAnimationFrame(() => {
      var i;
      (i = t.onRemoveCallback) == null || i.call(t, t, () => {
        var s, n;
        if ((s = e.onAddCallbacks) != null && s.afterRemoved && e.layoutId) {
          const r = this._layoutIdViewMapWaitingToEnter.get(
            e.layoutId
          );
          (n = r == null ? void 0 : r.onAddCallbacks) == null || n.afterEnter(r), this._layoutIdViewMapWaitingToEnter.delete(e.layoutId);
        }
        this._deleteView(t, !0);
      }), setTimeout(() => {
        t.element.parentElement && this._deleteView(t, !0);
      }, 1e4);
    });
  }
  _deleteView(e, t = !1) {
    (t || !e.layoutId) && (this._registry.removeViewById(e.id, this.id), e.element.remove());
  }
  // This is a temporary view for deleted view. We need to create it
  // to show it again so the user can animate it before it disappears.
  _createTemporaryView(e) {
    const t = e.previousRect.viewportOffset, i = e.previousRect.size, s = e.rotation.degrees < 0 ? 0 : Math.sin(e.rotation.radians) * i.height * e.scale.y, n = e.rotation.degrees > 0 ? 0 : Math.sin(e.rotation.radians) * i.width * e.scale.y, r = e.element.cloneNode(!0);
    e.element.remove(), r.style.cssText = "", r.style.position = "absolute", r.style.left = `${t.left + s}px`, r.style.top = `${t.top - n}px`, r.style.width = `${i.width}px`, r.style.height = `${i.height}px`, r.style.transform = `
      scale3d(${e.scale.x}, ${e.scale.y}, 1) rotate(${e.rotation.degrees}deg)
    `, r.style.pointerEvents = "none", r.dataset.velRemoved = "", document.body.appendChild(r);
    const u = this._registry.createView(r, e.name);
    return u.setAsTemporaryView(), u.styles.position = "absolute", u.styles.left = `${t.left + s}px`, u.styles.top = `${t.top - n}px`, u.rotation.setDegrees(e.rotation.degrees, !1), u.scale.set({ x: e.scale.x, y: e.scale.y }, !1), u.size.set(
      { width: e._localWidth, height: e._localHeight },
      !1
    ), e._copyAnimatorsToAnotherView(u), e.onRemoveCallback && u.onRemove(e.onRemoveCallback), u;
  }
  // @ts-ignore
  onViewRemoved(e) {
  }
  notifyAboutViewAdded(e) {
    this.onViewAdded(e), this._invokeAddCallbacks(e);
  }
  _invokeAddCallbacks(e) {
    var t, i, s;
    !((t = e.onAddCallbacks) != null && t.onInitialLoad) && !this._initialized || ((i = e.onAddCallbacks) == null || i.beforeEnter(e), !((s = e.onAddCallbacks) != null && s.afterRemoved) || !this._initialized ? requestAnimationFrame(() => {
      var n;
      (n = e.onAddCallbacks) == null || n.afterEnter(e);
    }) : e.layoutId && this._layoutIdViewMapWaitingToEnter.set(e.layoutId, e));
  }
  // @ts-ignore
  onViewAdded(e) {
  }
  init() {
    !this._initialized && this._isReady && (this.setup(), this._initialized = !0);
  }
  setup() {
  }
  // @ts-ignore
  subscribeToEvents(e) {
  }
}
class $e extends ve {
  isRenderable() {
    return !0;
  }
  isInitialized() {
    return this._initialized;
  }
  get initialized() {
    return this._initialized;
  }
  // @ts-ignore
  update(e, t) {
  }
  render() {
  }
  addView(e) {
    e.setPluginId(this.id), super.addView(e);
  }
}
class q extends ve {
  isRenderable() {
    return !1;
  }
}
class De {
  constructor(e) {
    o(this, "_plugin");
    this._plugin = e;
  }
  get initialized() {
    return this._plugin.isInitialized();
  }
  get config() {
    return this._plugin.config;
  }
  setup(e) {
    this._plugin.setup = e;
  }
  api(e) {
    this._plugin._setApi(e);
  }
  update(e) {
    this._plugin.update = e;
  }
  render(e) {
    this._plugin.render = e;
  }
  getViews(e) {
    return this._plugin.getViews(e);
  }
  getView(e) {
    return this._plugin.getView(e);
  }
  getViewById(e) {
    return this._plugin.getViewById(e);
  }
  useEventPlugin(e, t = {}) {
    return this._plugin.useEventPlugin(e, t);
  }
  emit(e, t) {
    this._plugin.emit(e, t);
  }
  on(e, t) {
    this._plugin.on(e, t);
  }
  onDataChanged(e) {
    this._plugin.onDataChanged = e;
  }
  onViewRemoved(e) {
    this._plugin.onViewRemoved = e;
  }
  onViewAdded(e) {
    this._plugin.onViewAdded = e;
  }
  subscribeToEvents(e) {
    this._plugin.subscribeToEvents = e;
  }
}
function M(a, e, t, i, s, n) {
  if (Oe(a))
    return new a(
      a,
      a.pluginName,
      e,
      t,
      i,
      s,
      n
    );
  const r = new $e(
    a,
    a.pluginName,
    e,
    t,
    i,
    s,
    n
  ), u = new De(r);
  return a(u), r;
}
function Oe(a) {
  var e;
  return ((e = a.prototype) == null ? void 0 : e.constructor.toString().indexOf("class ")) === 0;
}
class l {
  constructor(e, t) {
    o(this, "x");
    o(this, "y");
    this.x = e, this.y = t;
  }
  get magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  get unitVector() {
    const e = new l(0, 0), t = this.magnitude;
    return t !== 0 && (e.x = this.x / t, e.y = this.y / t), e;
  }
  add(e) {
    this.x += e.x, this.y += e.y;
  }
  sub(e) {
    this.x -= e.x, this.y -= e.y;
  }
  scale(e) {
    this.x *= e, this.y *= e;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y;
  }
  clone() {
    return new l(this.x, this.y);
  }
  static scale(e, t) {
    return new l(e.x * t, e.y * t);
  }
  static sub(e, t) {
    return new l(e.x - t.x, e.y - t.y);
  }
  static add(e, t) {
    return new l(e.x + t.x, e.y + t.y);
  }
}
function we(a, e, t) {
  return Math.min(Math.max(a, e), t);
}
function ke(a, e, t) {
  return a + (e - a) * t;
}
function p(a, e) {
  const i = a - e;
  return Math.abs(i) <= 0.01;
}
function ze(a, e, t, i, s) {
  return (a - e) / (t - e) * (s - i) + i;
}
function We(a, e, t) {
  const i = e.getScroll(), s = e.position.x - i.x, n = e.position.y - i.y, r = a.x || s, u = a.y || n, h = Math.abs(s - r), c = Math.abs(n - u), g = Math.sqrt(h * h + c * c);
  return 1 - we(0, g / t, 1);
}
function m(a) {
  let e = a.match(/^([\d.]+)([a-zA-Z%]*)$/);
  e || (e = "0px".match(/^([\d.]+)([a-zA-Z%]*)$/));
  const t = parseFloat(e[1]), i = e[2];
  return { value: t, unit: i, valueWithUnit: a };
}
function Ue(a, e, t = !1) {
  if (a === e)
    return !0;
  if (a.length !== e.length)
    return !1;
  for (let i = 0; i < a.length; i++) {
    if (t && !p(a[i].value, e[i].value))
      return !1;
    if (a[i].value !== e[i].value)
      return !1;
  }
  return !0;
}
function ce(a, e) {
  return Ue(a, e, !0);
}
class R {
  constructor(e, t, i, s) {
    o(this, "_topLeft");
    o(this, "_topRight");
    o(this, "_bottomLeft");
    o(this, "_bottomRight");
    this._topLeft = e, this._topRight = t, this._bottomLeft = i, this._bottomRight = s;
  }
  get value() {
    return {
      topLeft: this._topLeft,
      topRight: this._topRight,
      bottomRight: this._bottomRight,
      bottomLeft: this._bottomLeft
    };
  }
  equals(e) {
    return p(this.value.topLeft.value, e.value.topLeft.value) && p(this.value.topRight.value, e.value.topRight.value) && p(this.value.bottomRight.value, e.value.bottomRight.value) && p(this.value.bottomLeft.value, e.value.bottomLeft.value);
  }
  toCssPercentageForNewSize(e) {
    const t = this._convertToPercentage(this._topLeft, e), i = this._convertToPercentage(this._topRight, e), s = this._convertToPercentage(this._bottomLeft, e), n = this._convertToPercentage(this._bottomRight, e);
    return `${t.h} ${i.h} ${n.h} ${s.h} / ${t.v} ${i.v} ${n.v} ${s.v}`;
  }
  _convertToPercentage(e, t) {
    if (e.unit === "%")
      return { h: `${e.value}%`, v: `${e.value}%` };
    const i = e.value / t.width * 100, s = e.value / t.height * 100;
    return { h: `${i}%`, v: `${s}%` };
  }
}
function z(a) {
  const e = a.split(" ").map((i) => m(i)), t = {
    value: 0,
    unit: "",
    valueWithUnit: "0"
  };
  switch (e.length) {
    case 1:
      return new R(e[0], e[0], e[0], e[0]);
    case 2:
      return new R(e[0], e[1], e[0], e[1]);
    case 3:
      return new R(e[0], e[1], e[2], e[1]);
    case 4:
      return new R(e[0], e[1], e[3], e[2]);
    default:
      return new R(
        t,
        t,
        t,
        t
      );
  }
}
function qe(a, e) {
  const t = r(a.topLeft, e), i = r(a.topRight, e), s = r(a.bottomLeft, e), n = r(a.bottomRight, e);
  return {
    v: {
      topLeft: t.v,
      topRight: i.v,
      bottomRight: n.v,
      bottomLeft: s.v
    },
    h: {
      topLeft: t.h,
      topRight: i.h,
      bottomRight: n.h,
      bottomLeft: s.h
    }
  };
  function r(u, h) {
    if (u.unit === "%")
      return {
        h: m(`${u.value}%`),
        v: m(`${u.value}%`)
      };
    const c = u.value / h.width * 100, g = u.value / h.height * 100;
    return { h: m(`${c}%`), v: m(`${g}%`) };
  }
}
function de(a, e) {
  return p(a.topLeft.value, e.topLeft.value) && p(a.topRight.value, e.topRight.value) && p(a.bottomRight.value, e.bottomRight.value) && p(a.bottomLeft.value, e.bottomLeft.value);
}
class Ye {
  constructor(e) {
    o(this, "_value");
    this._value = e;
  }
  get value() {
    return this._value;
  }
  equals(e) {
    return p(this.value, e.value);
  }
}
function Xe(a) {
  return new Ye(parseFloat(a));
}
class je {
  constructor(e, t) {
    o(this, "_x");
    o(this, "_y");
    this._x = e, this._y = t;
  }
  get value() {
    return new l(this._x, this._y);
  }
}
function He(a, e) {
  const [t, i] = a.split(" "), s = m(t), n = m(i);
  return new je(
    s.value / e.width,
    n.value / e.height
  );
}
function Ke(a) {
  const e = Ge(a), t = Ze(a);
  return {
    viewportOffset: {
      left: Math.round(e.left),
      top: Math.round(e.top),
      right: Math.round(e.right),
      bottom: Math.round(e.bottom)
    },
    pageOffset: {
      top: t.top,
      left: t.left
    },
    size: {
      width: a.offsetWidth,
      height: a.offsetHeight
    }
  };
}
function Ge(a) {
  const e = a.getBoundingClientRect();
  return {
    left: e.left,
    top: e.top,
    right: e.right,
    bottom: e.bottom,
    width: e.width,
    height: e.height
  };
}
function Ze(a) {
  let e = a, t = 0, i = 0;
  for (; e; )
    t += e.offsetTop, i += e.offsetLeft, e = e.offsetParent;
  return { top: t, left: i };
}
class Je {
  constructor(e) {
    o(this, "_rect");
    o(this, "_computedStyle");
    this._rect = Ke(e), this._computedStyle = getComputedStyle(e);
  }
  read(e) {
    switch (e) {
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
    return Xe(this._computedStyle.opacity);
  }
  get borderRadius() {
    return z(this._computedStyle.borderRadius);
  }
  get origin() {
    return He(
      this._computedStyle.transformOrigin,
      this._rect.size
    );
  }
}
function $(a) {
  return new Je(a);
}
function W(a, e) {
  const t = {
    set: (i, s, n) => (typeof i[s] == "object" && i[s] !== null ? i[s] = W(n, e) : (e(), i[s] = n), !0),
    get: (i, s) => typeof i[s] == "object" && i[s] !== null ? W(i[s], e) : i[s]
  };
  return new Proxy(a, t);
}
const P = 0.01, Y = {
  speed: 15
};
class X {
  constructor(e) {
    o(this, "name", "dynamic");
    o(this, "_config");
    this._config = e;
  }
  get config() {
    return this._config;
  }
}
class Qe extends X {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    const n = l.sub(i, t), r = l.scale(n, this._config.speed);
    let u = l.add(t, l.scale(r, s));
    return this._shouldFinish(i, t, r) && (u = i, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), e.callUpdateCallback(), u;
  }
  _shouldFinish(e, t, i) {
    return l.sub(e, t).magnitude < P && i.magnitude < P;
  }
}
class et extends X {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    const r = (i - t) * this._config.speed;
    let u = t + r * s;
    return this._shouldFinish(i, t, r) && (u = i, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), e.callUpdateCallback(), u;
  }
  _shouldFinish(e, t, i) {
    return Math.abs(e - t) < P && Math.abs(i) < P;
  }
}
class tt extends X {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    return i.map((n, r) => {
      const u = t[r], h = n.value === 0 ? u.unit : n.unit, g = (n.value - u.value) * this._config.speed, _ = u.value + g * s;
      let d = m(`${_}${h}`);
      return this._shouldFinish(n.value, u.value, g) && (d = n, requestAnimationFrame(() => {
        e.callCompleteCallback();
      })), e.callUpdateCallback(), d;
    });
  }
  _shouldFinish(e, t, i) {
    return Math.abs(e - t) < P && Math.abs(i) < P;
  }
}
class j {
  constructor() {
    o(this, "name", "instant");
    o(this, "_config", {});
  }
  get config() {
    return this._config;
  }
  update(e) {
    return requestAnimationFrame(() => {
      e.animatorProp.callCompleteCallback();
    }), e.target;
  }
}
const H = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, b = 0.01;
class K {
  constructor(e) {
    o(this, "name", "spring");
    o(this, "_config");
    this._config = e;
  }
  get config() {
    return this._config;
  }
}
class it extends K {
  constructor() {
    super(...arguments);
    o(this, "_velocity", new l(0, 0));
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
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
      t.callCompleteCallback();
    })), u;
  }
  _shouldFinish(t, i) {
    return l.sub(t, i).magnitude < b && this._velocity.magnitude < b;
  }
}
class st extends K {
  constructor() {
    super(...arguments);
    o(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
    const r = -(i - s) * this._config.stiffness;
    this._velocity += r, this._velocity *= this._config.damping;
    let u = i + this._velocity * n * this._config.speed;
    return this._shouldFinish(s, i) && (u = s, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), u;
  }
  _shouldFinish(t, i) {
    return Math.abs(t - i) < b && Math.abs(this._velocity) < b;
  }
}
class nt extends K {
  constructor() {
    super(...arguments);
    o(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
    return s.map((r, u) => {
      const h = i[u], c = r.value === 0 ? h.unit : r.unit, g = -(h.value - r.value) * this._config.stiffness;
      this._velocity += g, this._velocity *= this._config.damping;
      const _ = h.value + this._velocity * n * this._config.speed;
      let d = m(`${_}${c}`);
      return this._shouldFinish(r.value, h.value) && (d = r, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), d;
    });
  }
  _shouldFinish(t, i) {
    return Math.abs(t - i) < b && Math.abs(this._velocity) < b;
  }
}
function rt(a) {
  return a;
}
const G = {
  duration: 350,
  ease: rt
};
class Z {
  constructor(e) {
    o(this, "name", "tween");
    o(this, "_config");
    o(this, "_startTime");
    this._config = e;
  }
  get config() {
    return this._config;
  }
  reset() {
    this._startTime = void 0;
  }
}
class at extends Z {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : l.add(
      t,
      l.scale(l.sub(i, t), this._config.ease(n))
    );
  }
}
class ot extends Z {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : t.map((r, u) => {
      const h = i[u], c = h.value === 0 ? r.unit : h.unit, g = r.value + this._config.ease(n) * (i[u].value - r.value);
      return m(`${g}${c}`);
    });
  }
}
class ut extends Z {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : t + (i - t) * this._config.ease(n);
  }
}
class J {
  createAnimatorByName(e, t) {
    switch (e) {
      case "instant":
        return this.createInstantAnimator();
      case "dynamic":
        return this.createDynamicAnimator(t);
      case "tween":
        return this.createTweenAnimator(t);
      case "spring":
        return this.createSpringAnimator(t);
    }
    return this.createInstantAnimator();
  }
}
class I extends J {
  createInstantAnimator() {
    return new j();
  }
  createTweenAnimator(e) {
    return new at({ ...G, ...e });
  }
  createDynamicAnimator(e) {
    return new Qe({ ...Y, ...e });
  }
  createSpringAnimator(e) {
    return new it({ ...H, ...e });
  }
}
class lt extends J {
  createInstantAnimator() {
    return new j();
  }
  createTweenAnimator(e) {
    return new ot({ ...G, ...e });
  }
  createDynamicAnimator(e) {
    return new tt({
      ...Y,
      ...e
    });
  }
  createSpringAnimator(e) {
    return new nt({ ...H, ...e });
  }
}
class ge extends J {
  createInstantAnimator() {
    return new j();
  }
  createDynamicAnimator(e) {
    return new et({ ...Y, ...e });
  }
  createTweenAnimator(e) {
    return new ut({ ...G, ...e });
  }
  createSpringAnimator(e) {
    return new st({ ...H, ...e });
  }
}
function x(a) {
  return structuredClone(a);
}
class ht {
  constructor(e) {
    o(this, "_viewProp");
    o(this, "_completeCallback");
    o(this, "_updateCallback");
    o(this, "_isAnimating");
    this._viewProp = e, this._isAnimating = !1;
  }
  set(e, t) {
    this._viewProp.setAnimator(e, t);
  }
  get name() {
    return this._viewProp.getAnimator().name;
  }
  onComplete(e) {
    this._completeCallback = e;
  }
  get isAnimating() {
    return this._isAnimating;
  }
  markAsAnimating() {
    this._isAnimating = !0;
  }
  callCompleteCallback() {
    var e;
    (e = this._completeCallback) == null || e.call(this), this._isAnimating = !1;
  }
  onUpdate(e) {
    this._updateCallback = e;
  }
  callUpdateCallback() {
    var e;
    (e = this._updateCallback) == null || e.call(this);
  }
}
class V {
  constructor(e, t, i) {
    o(this, "_animatorProp");
    o(this, "_animator");
    o(this, "_initialValue");
    o(this, "_previousValue");
    o(this, "_targetValue");
    o(this, "_currentValue");
    o(this, "_hasChanged");
    o(this, "_view");
    o(this, "_animatorFactory");
    o(this, "_previousRenderValue");
    this._animatorProp = new ht(this), this._animatorFactory = e, this._initialValue = x(t), this._previousValue = x(t), this._targetValue = x(t), this._currentValue = x(t), this._hasChanged = !1, this._previousRenderValue = void 0, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
  }
  get shouldRender() {
    return !0;
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
  setAnimator(e, t) {
    this._animator = this._animatorFactory.createAnimatorByName(
      e,
      t
    );
  }
  _setTarget(e, t = !0) {
    var i, s;
    this._previousValue = x(this._currentValue), this._targetValue = e, t ? ((s = (i = this._animator).reset) == null || s.call(i), this.animator.markAsAnimating()) : this._currentValue = e, this._hasChanged = !0;
  }
  hasChanged() {
    return this._hasChanged;
  }
  destroy() {
    this._hasChanged = !1;
  }
  // @ts-ignore
  update(e, t) {
  }
}
class ct extends V {
  constructor() {
    super(...arguments);
    o(this, "_invertedBorderRadius");
    o(this, "_forceStyleUpdateThisFrame", !1);
    o(this, "_updateWithScale", !1);
  }
  setFromElementPropValue(t) {
    this._setTarget(
      [
        t.value.topLeft,
        t.value.topRight,
        t.value.bottomRight,
        t.value.bottomLeft
      ],
      !0
    );
  }
  enableUpdateWithScale() {
    this._updateWithScale = !0;
  }
  disableUpdateWithScale() {
    this._updateWithScale = !1;
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
  set(t, i = !0) {
    let s;
    if (typeof t == "string") {
      const c = z(t.trim());
      s = {
        topLeft: c.value.topLeft.valueWithUnit,
        topRight: c.value.topRight.valueWithUnit,
        bottomRight: c.value.bottomRight.valueWithUnit,
        bottomLeft: c.value.bottomLeft.valueWithUnit
      };
    } else
      s = t;
    const n = s.topLeft ? m(s.topLeft) : this._currentValue[0], r = s.topRight ? m(s.topRight) : this._currentValue[1], u = s.bottomRight ? m(s.bottomRight) : this._currentValue[2], h = s.bottomLeft ? m(s.bottomLeft) : this._currentValue[3];
    this._setTarget([n, r, u, h], i);
  }
  reset(t = !0) {
    this._setTarget(this._initialValue, t);
  }
  update(t, i) {
    if (this._forceStyleUpdateThisFrame)
      this._hasChanged = !0, this._forceStyleUpdateThisFrame = !1;
    else if (this._view.scale.isAnimating && this._updateWithScale)
      this._hasChanged = !0;
    else if (ce(this._targetValue, this._currentValue)) {
      this._hasChanged = !ce(
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
      ts: t,
      dt: i
    }), this._updateWithScale && this._applyScaleInverse();
  }
  applyScaleInverse() {
    this._updateWithScale && (this._forceStyleUpdateThisFrame = !0);
  }
  _applyScaleInverse() {
    if (p(this._view.scale.x, 1) && p(this._view.scale.y, 1))
      return;
    const t = this._rect.size.width * this._view.scale.x, i = this._rect.size.height * this._view.scale.y;
    this._invertedBorderRadius = qe(
      z(
        `${this._currentValue[0].valueWithUnit} ${this._currentValue[1].valueWithUnit} ${this._currentValue[2].valueWithUnit} ${this._currentValue[3].valueWithUnit}`
      ).value,
      {
        width: t,
        height: i
      }
    );
  }
  get shouldRender() {
    return this._hasChanged ? this._previousRenderValue ? !(de(
      this.renderValue.v,
      this._previousRenderValue.v
    ) && de(this.renderValue.h, this._previousRenderValue.h)) : !0 : !1;
  }
  get renderValue() {
    return this.invertedBorderRadius ? {
      v: {
        topLeft: this.invertedBorderRadius.v.topLeft,
        topRight: this.invertedBorderRadius.v.topRight,
        bottomLeft: this.invertedBorderRadius.v.bottomLeft,
        bottomRight: this.invertedBorderRadius.v.bottomRight
      },
      h: {
        topLeft: this.invertedBorderRadius.h.topLeft,
        topRight: this.invertedBorderRadius.h.topRight,
        bottomLeft: this.invertedBorderRadius.h.bottomLeft,
        bottomRight: this.invertedBorderRadius.h.bottomRight
      }
    } : {
      v: {
        topLeft: this.value.topLeft,
        topRight: this.value.topRight,
        bottomLeft: this.value.bottomLeft,
        bottomRight: this.value.bottomRight
      },
      h: {
        topLeft: this.value.topLeft,
        topRight: this.value.topRight,
        bottomLeft: this.value.bottomLeft,
        bottomRight: this.value.bottomRight
      }
    };
  }
  projectStyles() {
    const t = this.renderValue, i = `border-radius: ${t.h.topLeft.valueWithUnit} ${t.h.topRight.valueWithUnit} ${t.h.bottomRight.valueWithUnit} ${t.h.bottomLeft.valueWithUnit} / ${t.v.topLeft.valueWithUnit} ${t.v.topRight.valueWithUnit} ${t.v.bottomRight.valueWithUnit} ${t.v.bottomLeft.valueWithUnit};`;
    return this._previousRenderValue = t, i;
  }
  isTransform() {
    return !1;
  }
}
class dt extends V {
  setFromElementPropValue(e) {
    this._setTarget(e.value, !0);
  }
  get value() {
    return this._currentValue;
  }
  set(e, t = !0) {
    this._setTarget(e, t);
  }
  reset(e = !0) {
    this._setTarget(1, e);
  }
  update(e, t) {
    if (p(this._targetValue, this._currentValue)) {
      this._hasChanged = !p(this._targetValue, this._initialValue);
      return;
    }
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: e,
      dt: t
    });
  }
  get shouldRender() {
    return this._hasChanged ? typeof this._previousRenderValue > "u" ? !0 : this.renderValue !== this._previousRenderValue : !1;
  }
  get renderValue() {
    return this.value;
  }
  projectStyles() {
    const e = this.renderValue, t = `opacity: ${e};`;
    return this._previousRenderValue = e, t;
  }
  isTransform() {
    return !1;
  }
}
class gt extends V {
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(e) {
    const i = { ...{ x: this.x, y: this.y }, ...e };
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
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const e = this.renderValue;
    return !(p(e.x, this._previousRenderValue.x) && p(e.y, this._previousRenderValue.y));
  }
  get renderValue() {
    return new l(this.x * 100, this.y * 100);
  }
  projectStyles() {
    const e = this.renderValue, t = `transform-origin: ${e.x}% ${e.y}%;`;
    return this._previousRenderValue = e, t;
  }
  isTransform() {
    return !1;
  }
}
class _t extends V {
  constructor() {
    super(...arguments);
    o(this, "_animateLayoutUpdateNextFrame", !1);
    o(this, "_parentScaleInverse", new l(1, 1));
  }
  get _parentDiff() {
    let t = this._view._parent, i = 0, s = 0;
    if (t) {
      const n = t.rect.pageOffset, r = t.getScroll(), u = {
        left: t.previousRect.viewportOffset.left + r.x,
        top: t.previousRect.viewportOffset.top + r.y
      };
      i = u.left - n.left, s = u.top - n.top;
    }
    return { parentDx: i, parentDy: s };
  }
  get x() {
    return this._currentValue.x + this._rect.pageOffset.left + this._parentDiff.parentDx;
  }
  get y() {
    return this._currentValue.y + this._rect.pageOffset.top + this._parentDiff.parentDy;
  }
  get initialX() {
    return this._rect.pageOffset.left;
  }
  get initialY() {
    return this._rect.pageOffset.top;
  }
  progressTo(t) {
    const i = typeof t.x > "u" ? this.initialX : t.x, s = typeof t.y > "u" ? this.initialY : t.y, n = new l(i, s), r = new l(this.initialX, this.initialY), u = new l(this.x, this.y), h = l.sub(u, r), c = l.sub(n, r);
    return 1 - l.sub(c, h).magnitude / c.magnitude;
  }
  set(t, i = !0) {
    const n = { ...{ x: this.x, y: this.y }, ...t };
    this._setTarget(
      new l(
        n.x - this._rect.pageOffset.left,
        n.y - this._rect.pageOffset.top
      ),
      i
    );
  }
  reset(t = !0) {
    this._setTarget(new l(0, 0), t);
  }
  update(t, i) {
    if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
      const c = this._view._parent, g = c ? c.scale.x : 1, _ = c ? c.scale.y : 1;
      this._parentScaleInverse = new l(1 / g, 1 / _), this._parentScaleInverse.equals(new l(1, 1)) || (this._hasChanged = !0);
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
      ts: t,
      dt: i
    }), this._currentValue = new l(
      this._currentValue.x / n,
      this._currentValue.y / r
    );
  }
  _runLayoutTransition() {
    const t = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), i = !(this._view.scale._targetValue.x === this._view.scale._currentValue.x && this._view.scale._targetValue.y === this._view.scale._currentValue.y), s = t || i, n = this._rect.pageOffset.left - this._previousRect.pageOffset.left, r = this._rect.pageOffset.top - this._previousRect.pageOffset.top, u = this._previousRect.size.width / this._rect.size.width, h = this._previousRect.size.height / this._rect.size.height;
    let c = !1;
    if (n !== 0 || r !== 0 || !Number.isNaN(u) && u !== 1 || !Number.isNaN(h) && h !== 1 ? c = !0 : c = (() => {
      const g = this._view._parents;
      for (let _ = 0; _ < g.length; _++) {
        const d = g[_], f = d.previousRect.size.width / d.rect.size.width, v = d.previousRect.size.height / d.rect.size.height;
        if (f !== 1 || v !== 1)
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
        const w = this._view._parent, ie = this._rect.pageOffset, se = this._view.getScroll(), E = {
          left: this._previousRect.viewportOffset.left + se.x,
          top: this._previousRect.viewportOffset.top + se.y
        }, Ee = E.left - ie.left, Ae = E.top - ie.top;
        let ne = 0, re = 0, ae = 0, oe = 0;
        if (w && w.position.animator.name !== "instant") {
          const A = w.rect.pageOffset, T = w.getScroll(), N = {
            left: w.previousRect.viewportOffset.left + T.x,
            top: w.previousRect.viewportOffset.top + T.y
          };
          ne = N.left - A.left, re = N.top - A.top;
          const ue = E.top - N.top, le = E.left - N.left, Te = w.scale.y * ue;
          ae = (ue - Te) / w.scale.y;
          const Ne = w.scale.x * le;
          oe = (le - Ne) / w.scale.x;
        }
        this._setTarget(
          new l(Ee - ne + oe, Ae - re + ae),
          !1
        ), s && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      this._animateLayoutUpdateNextFrame = !0;
      const g = this._previousRect, _ = this._rect, d = this._view._parent;
      let f = 0, v = 0;
      d && d.position.animator.name !== "instant" && (f = d.previousRect.viewportOffset.left - d.rect.viewportOffset.left), d && d.position.animator.name !== "instant" && (v = d.previousRect.viewportOffset.top - d.rect.viewportOffset.top);
      let y = 1, F = 1;
      d && d.scale.animator.name !== "instant" && (y = d.previousRect.size.width / d.rect.size.width, F = d.previousRect.size.height / d.rect.size.height);
      const ye = d && d.position.animator.name !== "instant" ? d.previousRect.viewportOffset.left : 0, Ve = d && d.position.animator.name !== "instant" ? d.previousRect.viewportOffset.top : 0, ee = g.viewportOffset.left - ye, te = g.viewportOffset.top - Ve, Pe = ee / y - ee, be = te / F - te;
      let Re = g.viewportOffset.left - _.viewportOffset.left - f + Pe;
      const xe = g.viewportOffset.top - _.viewportOffset.top - v + be;
      this._setTarget(new l(Re, xe), !1);
    } else
      this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const t = this.renderValue;
    return !(p(t.x, this._previousRenderValue.x) && p(t.y, this._previousRenderValue.y));
  }
  get renderValue() {
    let t = 0, i = 0;
    return (this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && (t = (this._rect.size.width * this._parentScaleInverse.x * this._view.scale.x - this._rect.size.width) * this._view.origin.x, i = (this._rect.size.height * this._parentScaleInverse.y * this._view.scale.y - this._rect.size.height) * this._view.origin.y), new l(
      this._currentValue.x + t,
      this._currentValue.y + i
    );
  }
  projectStyles() {
    const t = this.renderValue, i = `translate3d(${t.x}px, ${t.y}px, 0)`;
    return this._previousRenderValue = t, i;
  }
  isTransform() {
    return !0;
  }
}
class pt extends V {
  constructor() {
    super(...arguments);
    o(this, "_unit", "deg");
  }
  get degrees() {
    let t = this._currentValue;
    return this._unit === "rad" && (t = t * (180 / Math.PI)), t;
  }
  get radians() {
    let t = this._currentValue;
    return this._unit === "deg" && (t = t * (Math.PI / 180)), t;
  }
  setDegrees(t, i = !0) {
    this._unit = "deg", this._setTarget(t, i);
  }
  setRadians(t, i = !0) {
    this._unit = "rad", this._setTarget(t, i);
  }
  reset(t = !0) {
    this._setTarget(0, t);
  }
  update(t, i) {
    this._targetValue !== this._currentValue && (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: t,
      dt: i
    }));
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (typeof this._previousRenderValue > "u")
      return !0;
    const t = this.renderValue;
    return !p(t, this._previousRenderValue);
  }
  get renderValue() {
    return this._currentValue;
  }
  projectStyles() {
    const t = this.renderValue, i = `rotate(${t}${this._unit})`;
    return this._previousRenderValue = t, i;
  }
  isTransform() {
    return !0;
  }
}
class ft extends V {
  constructor() {
    super(...arguments);
    o(this, "_animateLayoutUpdateNextFrame", !1);
  }
  get x() {
    return this._currentValue.x;
  }
  get y() {
    return this._currentValue.y;
  }
  set(t, i = !0) {
    const r = { ...{ x: this._currentValue.x, y: this._currentValue.y }, ...typeof t == "number" ? { x: t, y: t } : t };
    this._setTarget(new l(r.x, r.y), i);
  }
  setWithSize(t, i = !0) {
    let s = this._currentValue.x, n = this._currentValue.y;
    t.width && (s = t.width / this._rect.size.width), t.height && (n = t.height / this._rect.size.height), !t.width && t.height && (s = n), !t.height && t.width && (n = s);
    const r = { x: s, y: n };
    this._setTarget(new l(r.x, r.y), i);
  }
  reset(t = !0) {
    this._setTarget(new l(1, 1), t);
  }
  update(t, i) {
    if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
      const s = this._view._parent, n = s ? s.scale.x : 1, r = s ? s.scale.y : 1;
      this._hasChanged = n !== 1 || r !== 1;
    }
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: new l(this._previousValue.x, this._previousValue.y),
      ts: t,
      dt: i
    }));
  }
  _runLayoutTransition() {
    const t = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), i = this._previousRect.size.width / this._rect.size.width, s = this._previousRect.size.height / this._rect.size.height;
    let n = !1;
    if ((!Number.isNaN(i) && i !== 1 || !Number.isNaN(s) && s !== 1) && (n = !0), n) {
      if (this._currentValue.x !== 1 || this._currentValue.y !== 1) {
        const g = this._view.previousRect.size.width / this._view.rect.size.width, _ = this._view.previousRect.size.height / this._view.rect.size.height;
        this._setTarget(
          new l(this._currentValue.x * g, this._currentValue.y * _),
          !1
        ), t && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      const r = this._previousRect.size.width / this._rect.size.width, u = this._previousRect.size.height / this._rect.size.height, h = r, c = u;
      this._view.viewProps.borderRadius.applyScaleInverse(), this._setTarget(new l(h, c), !1), this._animateLayoutUpdateNextFrame = !0;
    } else
      this._animateLayoutUpdateNextFrame && (this._setTarget(this._initialValue, !0), this._animateLayoutUpdateNextFrame = !1);
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const t = this.renderValue;
    return !(p(t.x, this._previousRenderValue.x) && p(t.y, this._previousRenderValue.y));
  }
  get renderValue() {
    const t = this._view._parent ? this._view._parent.scale.x : 1, i = this._view._parent ? this._view._parent.scale.y : 1, s = this._currentValue.x / t, n = this._currentValue.y / i;
    return new l(s, n);
  }
  projectStyles() {
    const t = this.renderValue, i = `scale3d(${t.x}, ${t.y}, 1)`;
    return this._previousRenderValue = t, i;
  }
  isTransform() {
    return !0;
  }
}
class mt extends V {
  get width() {
    return this._view.rect.size.width;
  }
  get height() {
    return this._view.rect.size.height;
  }
  get localWidth() {
    return this._currentValue.x;
  }
  get localHeight() {
    return this._currentValue.y;
  }
  get widthAfterScale() {
    const e = this._view.scale.x;
    return this.localWidth * e;
  }
  get heightAfterScale() {
    const e = this._view.scale.y;
    return this.localHeight * e;
  }
  get initialWidth() {
    return this._initialValue.x;
  }
  get initialHeight() {
    return this._initialValue.y;
  }
  set(e, t = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, ...e };
    this._setTarget(new l(s.width, s.height), t);
  }
  setWidth(e, t = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, width: e };
    this._setTarget(new l(s.width, s.height), t);
  }
  setHeight(e, t = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, height: e };
    this._setTarget(new l(s.width, s.height), t);
  }
  reset(e = !0) {
    this._setTarget(
      new l(this.initialWidth, this.initialHeight),
      e
    );
  }
  update(e, t) {
    this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts: e,
      dt: t
    }));
  }
  get shouldRender() {
    if (!this._hasChanged)
      return !1;
    if (!this._previousRenderValue)
      return !0;
    const e = this.renderValue;
    return !(p(e.x, this._previousRenderValue.x) && p(e.y, this._previousRenderValue.y));
  }
  get renderValue() {
    return new l(this._currentValue.x, this._currentValue.y);
  }
  projectStyles() {
    const e = this.renderValue, t = `width: ${e.x}px; height: ${e.y}px;`;
    return this._previousRenderValue = e, t;
  }
  isTransform() {
    return !1;
  }
}
class vt {
  constructor(e) {
    o(this, "_props", /* @__PURE__ */ new Map());
    this._props.set(
      "position",
      new _t(new I(), new l(0, 0), e)
    ), this._props.set(
      "scale",
      new ft(new I(), new l(1, 1), e)
    ), this._props.set(
      "rotation",
      new pt(new ge(), 0, e)
    ), this._props.set(
      "size",
      new mt(
        new I(),
        new l(e.rect.size.width, e.rect.size.height),
        e
      )
    ), this._props.set(
      "opacity",
      new dt(
        new ge(),
        e.elementReader.opacity.value,
        e
      )
    ), this._props.set(
      "borderRadius",
      new ct(
        new lt(),
        [
          e.elementReader.borderRadius.value.topLeft,
          e.elementReader.borderRadius.value.topRight,
          e.elementReader.borderRadius.value.bottomRight,
          e.elementReader.borderRadius.value.bottomLeft
        ],
        e
      )
    ), this._props.set(
      "origin",
      new gt(
        new I(),
        e.elementReader.origin.value,
        e
      )
    );
  }
  allProps() {
    return Array.from(this._props.values());
  }
  allPropNames() {
    return Array.from(this._props.keys());
  }
  getPropByName(e) {
    return this._props.get(e);
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
class wt {
  constructor(e, t, i, s) {
    o(this, "id");
    o(this, "name");
    o(this, "element");
    o(this, "styles", {});
    o(this, "_viewProps");
    o(this, "_previousRect");
    o(this, "_onAddCallbacks");
    o(this, "_onRemoveCallback");
    o(this, "_skipFirstRenderFrame");
    o(this, "_layoutTransition");
    o(this, "_registry");
    o(this, "_layoutId");
    o(this, "_elementReader");
    o(this, "_temporaryView");
    o(this, "_inverseEffect");
    o(this, "_renderNextTick");
    this.id = me(), this.name = t, this.element = e, this._elementReader = $(e), this._previousRect = this._elementReader.rect, this._viewProps = new vt(this), this._skipFirstRenderFrame = !0, this._layoutId = s, this._layoutTransition = !1, this._registry = i, this.element.dataset.velViewId = this.id, this._temporaryView = !1, this._inverseEffect = !1, this.styles = W(this.styles, () => {
      this._renderNextTick = !0;
    }), this._renderNextTick = !1;
  }
  destroy() {
    this._viewProps.allProps().forEach((e) => e.destroy()), this.element.removeAttribute("data-vel-view-id"), this.element.removeAttribute("data-vel-plugin-id"), this._renderNextTick = !0;
  }
  get elementReader() {
    return this._elementReader;
  }
  setElement(e) {
    this.element = e, this._elementReader = $(this.element), this.element.dataset.velViewId = this.id;
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
    return Array.from(this.element.children).map((t) => t.dataset.velViewId).filter((t) => t && typeof t == "string").map((t) => this._registry.getViewById(t)).filter((t) => !!t);
  }
  get _parent() {
    var i;
    const e = this.element.parentElement;
    if (!e)
      return;
    const t = e.closest("[data-vel-view-id]");
    if ((i = t == null ? void 0 : t.dataset) != null && i.velViewId)
      return this._registry.getViewById(t.dataset.velViewId);
  }
  get _parents() {
    var i;
    const e = [];
    let t = this.element.parentElement;
    if (!t)
      return e;
    for (t = t.closest("[data-vel-view-id]"); t; ) {
      const s = t.dataset.velViewId;
      if (s) {
        const n = this._registry.getViewById(s);
        n && e.push(n);
      }
      t = (i = t.parentElement) == null ? void 0 : i.closest(
        "[data-vel-view-id]"
      );
    }
    return e;
  }
  get rotation() {
    return this._viewProps.rotation;
  }
  get size() {
    return this._viewProps.size;
  }
  get _localWidth() {
    return this._viewProps.size.localWidth;
  }
  get _localHeight() {
    return this._viewProps.size.localHeight;
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
    const e = this.element.dataset;
    return Object.keys(e).filter((s) => s.includes("velData")).map((s) => s.replace("velData", "")).map((s) => `${s[0].toLowerCase()}${s.slice(1)}`).reduce((s, n) => {
      const r = e[`velData${n[0].toUpperCase()}${n.slice(1)}`];
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
    return this._parents.some((e) => e.isLayoutTransitionEnabled);
  }
  get isInverseEffectEnabled() {
    return this._parents.some((e) => e._inverseEffect);
  }
  layoutTransition(e) {
    this._layoutTransition = e, this.inverseEffect(e);
  }
  inverseEffect(e) {
    this._inverseEffect = e, e && this._children.forEach((t) => {
      if (t.position.animator.name === "instant") {
        const i = this.viewProps.position.getAnimator();
        t.position.setAnimator(
          i.name,
          i.config
        );
      }
      if (t.scale.animator.name === "instant") {
        const i = this.viewProps.scale.getAnimator();
        t.scale.setAnimator(i.name, i.config);
      }
    });
  }
  setAnimatorsFromParent() {
    let e = this._parent;
    for (; e && !e._inverseEffect; )
      e = e._parent;
    if (e) {
      if (this.position.animator.name === "instant") {
        const t = e.viewProps.position.getAnimator();
        this.position.setAnimator(t.name, t.config);
      }
      if (this.scale.animator.name === "instant") {
        const t = e.viewProps.scale.getAnimator();
        this.scale.setAnimator(t.name, t.config);
      }
    }
  }
  get _isRemoved() {
    return !this._registry.getViewById(this.id);
  }
  setPluginId(e) {
    this.element.dataset.velPluginId = e;
  }
  hasElement(e) {
    return this.element.contains(e);
  }
  getScroll() {
    let e = this.element, t = 0, i = 0;
    for (; e; )
      t += e.scrollTop, i += e.scrollLeft, e = e.offsetParent;
    return i += window.scrollX, t += window.scrollY, { y: t, x: i };
  }
  intersects(e, t) {
    const i = this.getScroll(), s = {
      x: this.position.x - i.x,
      y: this.position.y - i.y
    };
    return e >= s.x && e <= s.x + this.size.widthAfterScale && t >= s.y && t <= s.y + this.size.heightAfterScale;
  }
  // Using AABB collision detection
  overlapsWith(e) {
    const t = e._localWidth * e.scale.x, i = e._localHeight * e.scale.y, s = this._localWidth * this.scale.x, n = this._localHeight * this.scale.y;
    return this.position.x < e.position.x + t && this.position.x + s > e.position.x && this.position.y < e.position.y + i && this.position.y + n > e.position.y;
  }
  distanceTo(e) {
    const t = new l(this.position.x, this.position.y), i = new l(e.position.x, e.position.y);
    return l.sub(i, t).magnitude;
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
  update(e, t) {
    this._viewProps.allProps().forEach((i) => i.update(e, t));
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
  get shouldRender() {
    return this._renderNextTick || this._viewProps.allProps().some((e) => e.shouldRender);
  }
  render() {
    if (!this.shouldRender)
      return;
    if (this._isRemoved && this._skipFirstRenderFrame) {
      this._skipFirstRenderFrame = !1;
      return;
    }
    let e = "";
    const t = this._viewProps.allProps(), i = t.filter((n) => n.isTransform()), s = t.filter((n) => !n.isTransform());
    if (i.some((n) => n.hasChanged())) {
      const n = i.reduce((r, u, h) => (r += u.projectStyles(), h === i.length - 1 && (r += ";"), r), "transform: ");
      e += n;
    }
    s.forEach((n) => {
      n.hasChanged() && (e += n.projectStyles());
    }), e += this._getUserStyles(), this.element.style.cssText = e, this._renderNextTick = !1;
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((e, t) => t ? e + `${Be(t)}: ${this.styles[t]};` : e, "");
  }
  markAsAdded() {
    delete this.element.dataset.velProcessing;
  }
  onAdd(e) {
    this._onAddCallbacks = e;
  }
  onRemove(e) {
    this._onRemoveCallback = e;
  }
  get viewProps() {
    return this._viewProps;
  }
  getPropByName(e) {
    return this._viewProps.getPropByName(e);
  }
  _copyAnimatorsToAnotherView(e) {
    e.viewProps.allPropNames().forEach((t) => {
      var s, n;
      const i = (s = this.viewProps.getPropByName(t)) == null ? void 0 : s.getAnimator();
      i && ((n = e.viewProps.getPropByName(t)) == null || n.setAnimator(i.name, i.config));
    });
  }
}
class yt {
  constructor(e, t) {
    o(this, "_appEventBus");
    o(this, "_eventBus");
    o(this, "_plugins", []);
    o(this, "_views", []);
    o(this, "_viewsPerPlugin", /* @__PURE__ */ new Map());
    o(this, "_viewsToBeCreated", []);
    o(this, "_viewsToBeRemoved", []);
    o(this, "_viewsCreatedInPreviousFrame", []);
    o(this, "_layoutIdToViewMap", /* @__PURE__ */ new Map());
    o(this, "_eventPluginsPerPlugin", /* @__PURE__ */ new Map());
    o(this, "_pluginNameToPluginFactoryMap", /* @__PURE__ */ new Map());
    o(this, "_pluginNameToPluginConfigMap", /* @__PURE__ */ new Map());
    this._appEventBus = e, this._eventBus = t;
  }
  update() {
    this._handleRemovedViews(), this._handleAddedViews();
  }
  associateEventPluginWithPlugin(e, t) {
    let i = this._eventPluginsPerPlugin.get(e);
    i || (i = [], this._eventPluginsPerPlugin.set(e, i)), i.push(t);
  }
  _handleRemovedViews() {
    const e = this._viewsToBeRemoved.filter((t) => t.dataset.velViewId);
    e.length && (e.forEach((t) => {
      const i = t.dataset.velViewId;
      i && this._handleRemoveView(i);
    }), this._viewsToBeRemoved = []);
  }
  _getPluginNameForElement(e) {
    const t = e.dataset.velPlugin;
    if (t && t.length > 0)
      return t;
    const i = e.closest("[data-vel-plugin]");
    if (i)
      return i.dataset.velPlugin;
  }
  _getPluginIdForElement(e) {
    const t = this._getPluginNameForElement(e);
    if (!t)
      return;
    const i = e.closest("[data-vel-plugin-id]");
    if (i)
      return i.dataset.velPluginId;
    const s = this.getPluginByName(t);
    if (s)
      return s.id;
  }
  _isScopedElement(e) {
    const t = this._getPluginNameForElement(e);
    if (!t)
      return !1;
    const i = this._pluginNameToPluginFactoryMap.get(t), s = i == null ? void 0 : i.scope;
    return e.dataset.velView === s;
  }
  _handleAddedViews() {
    this._viewsCreatedInPreviousFrame.forEach((s) => {
      s.markAsAdded();
    }), this._viewsCreatedInPreviousFrame = [];
    const e = this._viewsToBeCreated.filter(
      (s) => this._isScopedElement(s)
    ), t = this._viewsToBeCreated.filter(
      (s) => !this._isScopedElement(s)
    );
    this._viewsToBeCreated = [], e.forEach((s) => {
      const n = this._getPluginNameForElement(s), r = this._pluginNameToPluginFactoryMap.get(n), u = this._pluginNameToPluginConfigMap.get(n), h = s.dataset.velPluginKey, c = M(
        r,
        this,
        this._eventBus,
        this._appEventBus,
        u,
        h
      );
      this._plugins.push(c);
      const g = s.dataset.velView, _ = this._createNewView(s, g, c);
      _.isInverseEffectEnabled && _.setAnimatorsFromParent(), c.notifyAboutViewAdded(_);
    });
    const i = t.filter((s) => !!this._getPluginIdForElement(s));
    i.length !== 0 && i.forEach((s) => {
      const n = this._getPluginIdForElement(s), r = s.dataset.velView;
      if (!r || !n)
        return;
      const u = this._getPluginById(n);
      if (!u)
        return;
      const h = this._getLayoutIdForElement(s, u);
      let c;
      h && this._layoutIdToViewMap.has(h) ? (c = this._layoutIdToViewMap.get(h), c.setElement(s), c.setPluginId(u.id), this._createChildrenForView(c, u)) : c = this._createNewView(s, r, u), c.isInverseEffectEnabled && c.setAnimatorsFromParent(), u.notifyAboutViewAdded(c);
    });
  }
  _getLayoutIdForElement(e, t) {
    const i = e.dataset.velLayoutId;
    if (i)
      return `${i}-${t.id}`;
  }
  _createNewView(e, t, i) {
    const s = this._getLayoutIdForElement(e, i), n = this.createView(e, t, s);
    return i.addView(n), n.layoutId && this._layoutIdToViewMap.set(n.layoutId, n), this._createChildrenForView(n, i), this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api, !0), requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._appEventBus.emitPluginReadyEvent(i.pluginName, i.api);
      });
    }), n;
  }
  _createChildrenForView(e, t) {
    const i = e.element.querySelectorAll("*");
    if (i.length) {
      if (Array.from(i).some(
        (s) => this._getPluginNameForElement(s) !== t.pluginName
      )) {
        console.log(
          `%c WARNING: The plugin "${t.pluginName}" has view(s) created for a different plugin. Make sure all views inside that plugin don't have data-vel-plugin set or the pluginName is set to "${t.pluginName}"`,
          "background: #885500"
        );
        return;
      }
      Array.from(i).forEach((s) => {
        const n = s, r = n.dataset.velView ? n.dataset.velView : `${e.name}-child`, u = this._getLayoutIdForElement(n, t), h = this.createView(n, r, u);
        u && !this._layoutIdToViewMap.has(u) && this._layoutIdToViewMap.set(u, h), t.addView(h), t.notifyAboutViewAdded(h);
      });
    }
  }
  _handleRemoveView(e) {
    this._plugins.forEach((t) => {
      if (!this._viewsPerPlugin.get(t.id))
        return;
      const s = this._getPluginViewById(t, e);
      s && t.removeView(s);
    });
  }
  removeViewById(e, t) {
    this._unassignViewFromPlugin(e, t), this._views = this._views.filter((i) => i.id !== e);
  }
  _unassignViewFromPlugin(e, t) {
    const i = this._viewsPerPlugin.get(t);
    if (!i)
      return;
    const s = i.indexOf(e);
    s !== -1 && i.splice(s, 1);
  }
  getViewById(e) {
    return this._views.find((t) => t.id === e);
  }
  _getPluginById(e) {
    return this._plugins.find((t) => t.id === e);
  }
  _getPluginViewById(e, t) {
    return this.getViewsForPlugin(e).find((i) => i.id === t);
  }
  destroy(e, t) {
    if (!e) {
      this._destroyAll(t);
      return;
    }
    let i = [];
    if (e && e.length > 0) {
      const s = this.getPluginByName(e);
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
        t == null || t();
      });
    });
  }
  _destroyPlugin(e) {
    const t = this.getViewsForPlugin(e);
    t.forEach((i) => {
      i.layoutId && this._layoutIdToViewMap.delete(i.layoutId), i.destroy();
    }), this._views = this._views.filter(
      (i) => !t.find((s) => s.id === i.id)
    ), this._viewsPerPlugin.delete(e.id), this._plugins = this._plugins.filter((i) => i.id !== e.id);
  }
  _destroyAll(e) {
    this._views.forEach((t) => t.destroy()), requestAnimationFrame(() => {
      this._plugins = [], this._views = [], this._viewsPerPlugin.clear(), this._viewsToBeCreated = [], this._viewsToBeRemoved = [], this._viewsCreatedInPreviousFrame = [], this._layoutIdToViewMap.clear(), this._eventPluginsPerPlugin.clear(), e == null || e();
    });
  }
  reset(e, t) {
    let i = [];
    if (e && e.length > 0) {
      const s = this.getPluginByName(e);
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
        t == null || t();
      });
    });
  }
  _resetPlugin(e) {
    const t = e.config, i = e.pluginFactory, s = e.internalBusEvent, n = !e.isRenderable(), r = this.getViewsForPlugin(e);
    r.forEach((u) => {
      u.layoutId && this._layoutIdToViewMap.delete(u.layoutId), u.destroy();
    }), this._views = this._views.filter(
      (u) => !r.find((h) => h.id === u.id)
    ), this._viewsPerPlugin.delete(e.id), this._plugins = this._plugins.filter((u) => u.id !== e.id), n || requestAnimationFrame(() => {
      this.createPlugin(
        i,
        this._eventBus,
        t
      ).setInternalEventBus(s);
    });
  }
  queueNodeToBeCreated(e) {
    this._viewsToBeCreated.push(e);
  }
  queueNodeToBeRemoved(e) {
    this._viewsToBeRemoved.push(e);
  }
  notifyPluginAboutDataChange(e) {
    const t = this._plugins.filter(
      (i) => i.id === e.pluginId
    );
    !t || !t.length || t.forEach((i) => {
      i.notifyAboutDataChanged({
        dataName: e.dataName,
        dataValue: e.dataValue,
        viewName: e.viewName
      });
    });
  }
  getPlugins() {
    return this._plugins;
  }
  getRenderablePlugins() {
    function e(t) {
      return t.isRenderable();
    }
    return this._plugins.filter(e);
  }
  getPluginByName(e, t) {
    return this._plugins.find((i) => t ? i.pluginKey === t && i.pluginName === e : i.pluginName === e);
  }
  getPluginsByName(e, t) {
    return this._plugins.filter((i) => t ? i.pluginKey === t && i.pluginName === e : i.pluginName === e);
  }
  hasPlugin(e) {
    return e.pluginName ? !!this.getPluginByName(e.pluginName) : !1;
  }
  createPlugin(e, t, i = {}) {
    if (!e.pluginName)
      throw Error(
        `Plugin ${e.name} must contain a pluginName field`
      );
    let s = [];
    if (e.scope) {
      const u = document.querySelectorAll(
        `[data-vel-plugin=${e.pluginName}][data-vel-view=${e.scope}]`
      );
      this._pluginNameToPluginFactoryMap.has(e.pluginName) || this._pluginNameToPluginFactoryMap.set(
        e.pluginName,
        e
      ), this._pluginNameToPluginConfigMap.has(e.pluginName) || this._pluginNameToPluginConfigMap.set(e.pluginName, i), u ? s = Array.from(u) : s = [document.documentElement];
    } else
      s = [document.documentElement];
    const n = s.map((u) => {
      const h = u.dataset.velPluginKey, c = M(
        e,
        this,
        t,
        this._appEventBus,
        i,
        h
      );
      this._plugins.push(c);
      let g = [];
      u !== document.documentElement && g.push(u);
      const _ = u.querySelectorAll(
        `[data-vel-plugin=${c.pluginName}]`
      );
      g = [...g, ..._];
      const d = g.filter((f) => {
        if (!f.parentElement)
          return !0;
        const y = this._getPluginNameForElement(f.parentElement);
        return !(y && y.length > 0);
      });
      return d.length && d.forEach((f) => {
        const v = f.dataset.velView;
        if (!v)
          return;
        const y = this._createNewView(f, v, c);
        c.notifyAboutViewAdded(y);
      }), c;
    });
    if (n && n.length > 0)
      return n[0];
    const r = M(
      e,
      this,
      t,
      this._appEventBus,
      i
    );
    return e.scope || console.log(
      `%c WARNING: The plugin "${r.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), r;
  }
  getViews() {
    return this._views;
  }
  createView(e, t, i) {
    const s = new wt(e, t, this, i);
    return this._views.push(s), this._viewsCreatedInPreviousFrame.push(s), s;
  }
  assignViewToPlugin(e, t) {
    this._viewsPerPlugin.has(t.id) || this._viewsPerPlugin.set(t.id, []);
    const i = this._viewsPerPlugin.get(t.id);
    i.includes(e.id) || i.push(e.id);
  }
  getViewsForPlugin(e) {
    const t = this._viewsPerPlugin.get(e.id);
    return t ? t.map((s) => this._views.find((n) => n.id === s)).filter((s) => !!s) : [];
  }
  getViewsByNameForPlugin(e, t) {
    return this.getViewsForPlugin(e).filter(
      (i) => i.name === t
    );
  }
}
class _e {
  constructor(e) {
    o(this, "pluginApi");
    this.pluginApi = e.pluginApi;
  }
}
class pe {
  constructor(e) {
    o(this, "pluginApi");
    this.pluginApi = e.pluginApi;
  }
}
class Q {
  constructor() {
    o(this, "_previousTime", 0);
    o(this, "_registry");
    o(this, "_eventBus");
    o(this, "_appEventBus");
    this._eventBus = new k(), this._appEventBus = new k(), this._registry = new yt(this._appEventBus, this._eventBus), new Se(this._eventBus);
  }
  static create() {
    return new Q();
  }
  addPlugin(e, t = {}) {
    this._registry.hasPlugin(e) || this._registry.createPlugin(e, this._eventBus, t);
  }
  reset(e, t) {
    this._registry.reset(e, t);
  }
  destroy(e, t) {
    this._registry.destroy(e, t);
  }
  getPlugin(e, t) {
    let i = typeof e == "string" ? e : e.pluginName;
    const s = this._registry.getPluginByName(i, t);
    if (!s)
      throw new Error(
        `You can't call getPlugin for ${i} with key: ${t} because it does not exist in your app`
      );
    return s.api;
  }
  getPlugins(e, t) {
    let i = typeof e == "string" ? e : e.pluginName;
    const s = this._registry.getPluginsByName(i, t);
    if (s.length === 0)
      throw new Error(
        `You can't call getPlugins for ${i} with key: ${t} because they don't exist in your app`
      );
    return s.map((n) => n.api);
  }
  onPluginEvent(e, t, i) {
    const s = this._registry.getPluginByName(e.pluginName);
    s && s.on(t, i);
  }
  run() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", this._start.bind(this)) : this._start();
  }
  ready(e, t) {
    this._appEventBus.subscribeToPluginReadyEvent(t, e);
  }
  _start() {
    this._setup(), requestAnimationFrame(this._tick.bind(this));
  }
  _setup() {
    this._listenToNativeEvents(), this._subscribeToEvents();
  }
  _listenToNativeEvents() {
    document.addEventListener("click", (e) => {
      this._eventBus.emitEvent(U, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointermove", (e) => {
      this._eventBus.emitEvent(L, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointerdown", (e) => {
      this._eventBus.emitEvent(B, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointerup", (e) => {
      this._eventBus.emitEvent(S, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    });
  }
  _tick(e) {
    let t = (e - this._previousTime) / 1e3;
    t > 0.016 && (t = 1 / 60), this._previousTime = e, this._eventBus.reset(), this._subscribeToEvents(), this._read(), this._update(e, t), this._render(), requestAnimationFrame(this._tick.bind(this));
  }
  _subscribeToEvents() {
    this._eventBus.subscribeToEvent(
      D,
      this._onNodeAdded.bind(this)
    ), this._eventBus.subscribeToEvent(
      O,
      this._onNodeRemoved.bind(this)
    ), this._eventBus.subscribeToEvent(
      fe,
      this._onDataChanged.bind(this)
    ), this._registry.getPlugins().forEach((e) => {
      e.subscribeToEvents(this._eventBus);
    });
  }
  _onNodeAdded({ node: e }) {
    this._registry.queueNodeToBeCreated(e);
  }
  _onNodeRemoved({ node: e }) {
    this._registry.queueNodeToBeRemoved(e);
  }
  _onDataChanged(e) {
    this._registry.notifyPluginAboutDataChange(e);
  }
  _read() {
    this._registry.getViews().forEach((e) => {
      e.read();
    });
  }
  _update(e, t) {
    this._registry.update(), this._registry.getPlugins().slice().reverse().forEach((i) => {
      i.init();
    }), this._registry.getRenderablePlugins().forEach((i) => {
      i.update(e, t);
    }), this._registry.getViews().forEach((i) => {
      i.update(e, t);
    }), this._registry.getViews().forEach((i) => {
      i._updatePreviousRect();
    });
  }
  _render() {
    this._registry.getRenderablePlugins().forEach((e) => {
      e.render();
    }), this._registry.getViews().forEach((e) => {
      e.render();
    });
  }
}
function Ct() {
  return Q.create();
}
class Vt {
  constructor(e) {
    o(this, "view");
    o(this, "previousX");
    o(this, "previousY");
    o(this, "x");
    o(this, "y");
    o(this, "isDragging");
    o(this, "target");
    o(this, "directions", []);
    o(this, "width");
    o(this, "height");
    this.props = e, this.previousX = e.previousX, this.previousY = e.previousY, this.x = e.x, this.y = e.y, this.width = e.width, this.height = e.height, this.view = e.view, this.isDragging = e.isDragging, this.target = e.target, this.directions = e.directions;
  }
}
class Pt extends q {
  constructor() {
    super(...arguments);
    o(this, "_pointerX", 0);
    o(this, "_pointerY", 0);
    o(this, "_initialPointer", new l(0, 0));
    o(this, "_initialPointerPerView", /* @__PURE__ */ new Map());
    o(this, "_pointerDownPerView", /* @__PURE__ */ new Map());
    o(this, "_targetPerView", /* @__PURE__ */ new Map());
    o(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
  }
  setup() {
    document.addEventListener("selectstart", this.onSelect.bind(this));
  }
  onSelect(t) {
    this._isDragging && t.preventDefault();
  }
  get _isDragging() {
    return Array.from(this._pointerDownPerView.values()).some(
      (t) => !!t
    );
  }
  subscribeToEvents(t) {
    t.subscribeToEvent(B, ({ x: i, y: s, target: n }) => {
      this._initialPointer = new l(i, s), this.getViews().forEach((r) => {
        this._pointerDownPerView.set(r.id, r.intersects(i, s)), this._targetPerView.set(r.id, n);
        const u = new l(
          i - r.position.x,
          s - r.position.y
        );
        this._pointerX = i, this._pointerY = s, this._initialPointerPerView.set(r.id, u);
      });
    }), t.subscribeToEvent(S, () => {
      this.getViews().forEach((i) => {
        this._pointerDownPerView.get(i.id) && this._initialPointerPerView.get(i.id) && (this._pointerDownPerView.set(i.id, !1), this._emitEvent(i, []));
      });
    }), t.subscribeToEvent(L, ({ x: i, y: s }) => {
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
  _emitEvent(t, i) {
    const s = this._viewPointerPositionLog.get(t.id), n = s && s.length >= 2 ? s[s.length - 2] : null, r = this._pointerX - this._initialPointerPerView.get(t.id).x, u = this._pointerY - this._initialPointerPerView.get(t.id).y, h = n ? n.x - this._initialPointerPerView.get(t.id).x : r, c = n ? n.y - this._initialPointerPerView.get(t.id).y : u, g = this._pointerY - this._initialPointer.y, _ = this._pointerX - this._initialPointer.x, d = this._targetPerView.get(t.id);
    if (!d || !t.hasElement(d))
      return;
    const f = this._pointerDownPerView.get(t.id) === !0;
    f || this._viewPointerPositionLog.clear();
    const v = {
      view: t,
      target: d,
      previousX: h,
      previousY: c,
      x: r,
      y: u,
      width: _,
      height: g,
      isDragging: f,
      directions: i
    };
    this.emit(Vt, v);
  }
  _calculateDirections(t, i) {
    const s = {
      up: l.sub(new l(t.x, t.y - 1), t),
      down: l.sub(new l(t.x, t.y + 1), t),
      left: l.sub(new l(t.x - 1, t.y), t),
      right: l.sub(new l(t.x + 1, t.y), t)
    }, n = l.sub(i, t).unitVector;
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
o(Pt, "pluginName", "DragEventPlugin");
class bt {
  constructor(e) {
    o(this, "view");
    o(this, "direction");
    this.props = e, this.view = e.view, this.direction = e.direction;
  }
}
class Rt extends q {
  constructor() {
    super(...arguments);
    o(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map());
    o(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    o(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(t) {
    t.subscribeToEvent(B, ({ x: i, y: s, target: n }) => {
      this.getViews().forEach((r) => {
        this._targetPerView.set(r.id, n), r.intersects(i, s) && this._viewIsPointerDownMap.set(r.id, !0);
      });
    }), t.subscribeToEvent(L, ({ x: i, y: s }) => {
      this.getViews().forEach((n) => {
        if (!this._viewIsPointerDownMap.get(n.id))
          return;
        this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []), this._viewPointerPositionLog.get(n.id).push(new l(i, s));
      });
    }), t.subscribeToEvent(S, ({ x: i, y: s }) => {
      this.getViews().forEach((r) => {
        if (!this._viewIsPointerDownMap.get(r.id) || !this._viewPointerPositionLog.has(r.id))
          return;
        const u = new l(i, s), h = this._viewPointerPositionLog.get(r.id), c = h[h.length - 2] || u.clone(), g = this._targetPerView.get(r.id), _ = n(c, u);
        g && r.hasElement(g) && _.hasSwiped && this.emit(bt, {
          view: r,
          direction: _.direction
        }), this._viewPointerPositionLog.set(r.id, []), this._viewIsPointerDownMap.set(r.id, !1);
      });
      function n(r, u) {
        const h = {
          up: l.sub(new l(r.x, r.y - 1), r),
          down: l.sub(new l(r.x, r.y + 1), r),
          left: l.sub(new l(r.x - 1, r.y), r),
          right: l.sub(new l(r.x + 1, r.y), r)
        }, c = l.sub(u, r).unitVector, g = [
          "up",
          "down",
          "left",
          "right"
        ], _ = [
          c.dot(h.up),
          c.dot(h.down),
          c.dot(h.left),
          c.dot(h.right)
        ], d = Math.max(..._), f = _.indexOf(d), v = g[f], y = l.sub(u, r).magnitude;
        return {
          hasSwiped: c.dot(h[v]) * y > 30,
          direction: v
        };
      }
    });
  }
}
o(Rt, "pluginName", "SwipeEventPlugin");
class xt {
  constructor(e) {
    o(this, "view");
    this.props = e, this.view = e.view;
  }
}
class Et extends q {
  subscribeToEvents(e) {
    e.subscribeToEvent(U, ({ x: t, y: i, target: s }) => {
      this.getViews().forEach((n) => {
        const r = s, u = n.element === r || n.element.contains(r);
        n.intersects(t, i) && u && this.emit(xt, {
          view: n
        });
      });
    });
  }
}
o(Et, "pluginName", "ClickEventPlugin");
function At(a, e) {
  const t = a.map(e), i = Math.min(...t), s = t.indexOf(i);
  return a[s];
}
const Lt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clamp: we,
  minBy: At,
  pointToViewProgress: We,
  remap: ze,
  valueAtPercentage: ke
}, Symbol.toStringTag, { value: "Module" })), Bt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: U,
  PointerDownEvent: B,
  PointerMoveEvent: L,
  PointerUpEvent: S
}, Symbol.toStringTag, { value: "Module" }));
export {
  xt as ClickEvent,
  Et as ClickEventPlugin,
  fe as DataChangedEvent,
  Vt as DragEvent,
  Pt as DragEventPlugin,
  k as EventBus,
  q as EventPlugin,
  Bt as Events,
  $e as Plugin,
  De as PluginContext,
  bt as SwipeEvent,
  Rt as SwipeEventPlugin,
  Lt as Utils,
  Ct as createApp
};
