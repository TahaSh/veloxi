var Be = Object.defineProperty;
var Oe = (o, e, t) => e in o ? Be(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var a = (o, e, t) => (Oe(o, typeof e != "symbol" ? e + "" : e, t), t);
class F {
  constructor(e) {
    a(this, "x");
    a(this, "y");
    a(this, "target");
    this.x = e.x, this.y = e.y, this.target = e.target;
  }
}
class H extends F {
}
class M extends F {
}
class $ extends F {
}
class k extends F {
}
class be {
  constructor(e) {
    a(this, "pluginId");
    a(this, "pluginName");
    a(this, "viewName");
    a(this, "dataName");
    a(this, "dataValue");
    this.event = e, this.pluginId = e.pluginId, this.pluginName = e.pluginName, this.viewName = e.viewName, this.dataName = e.dataName, this.dataValue = e.dataValue;
  }
}
function Fe(o) {
  return o.replace(/(?:^\w|[A-Z]|\b\w)/g, function(e, t) {
    return t === 0 ? e.toLowerCase() : e.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function ge(o) {
  return o.split("").map((e, t) => e.toUpperCase() === e ? `${t !== 0 ? "-" : ""}${e.toLowerCase()}` : e).join("");
}
class S {
  constructor(e) {
    a(this, "node");
    this.node = e.node;
  }
}
class z {
  constructor(e) {
    a(this, "node");
    this.node = e.node;
  }
}
class Me {
  constructor(e) {
    a(this, "_eventBus");
    a(this, "_observer");
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
        this._eventBus.emitEvent(S, { node: r });
        const l = r.querySelectorAll("[data-vel-plugin]");
        l.length && l.forEach((u) => {
          this._eventBus.emitEvent(S, { node: u });
        });
      }), t.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement) || typeof n.dataset.velProcessing < "u")
          return;
        const r = n.querySelectorAll("[data-vel-plugin]");
        r.length && r.forEach((l) => {
          this._eventBus.emitEvent(z, { node: l });
        }), this._eventBus.emitEvent(z, { node: n });
      });
      const i = t.attributeName;
      if (i === "data-vel-view" && this._eventBus.emitEvent(S, {
        node: t.target
      }), i && /data-vel-data-.+/gi.test(i)) {
        const n = t.target, r = n.dataset.velPluginId || "", l = n.dataset.velPlugin || "", u = n.dataset.velView || "", c = n.getAttribute(i);
        if (c && c !== t.oldValue) {
          const d = Fe(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(be, {
            pluginId: r,
            pluginName: l,
            viewName: u,
            dataName: d,
            dataValue: c
          });
        }
      }
    });
  }
}
class $e {
  execute(e) {
    this.call(e);
  }
}
class pe extends $e {
  constructor(t) {
    super();
    a(this, "_handler");
    this._handler = t;
  }
  getHandler() {
    return this._handler;
  }
  call(t) {
    this._handler(t);
  }
}
class U {
  constructor() {
    a(this, "_listeners", /* @__PURE__ */ new Map());
    a(this, "_keyedListeners", /* @__PURE__ */ new Map());
  }
  subscribeToEvent(e, t, i) {
    if (i) {
      this._subscribeToKeyedEvent(e, t, i);
      return;
    }
    let s = this._listeners.get(e);
    s || (s = [], this._listeners.set(e, s)), s.push(new pe(t));
  }
  removeEventListener(e, t, i) {
    if (i) {
      this._removeKeyedEventListener(e, t, i);
      return;
    }
    let s = this._listeners.get(e);
    s && (s = s.filter(
      (n) => n.getHandler() !== t
    ), this._listeners.set(e, s));
  }
  _subscribeToKeyedEvent(e, t, i) {
    let s = this._keyedListeners.get(e);
    s || (s = /* @__PURE__ */ new Map(), this._keyedListeners.set(e, s));
    let n = s.get(i);
    n || (n = [], s.set(i, n)), n.push(new pe(t));
  }
  _removeKeyedEventListener(e, t, i) {
    let s = this._keyedListeners.get(e);
    if (!s)
      return;
    let n = s.get(i);
    n && (n = n.filter(
      (r) => r.getHandler() !== t
    ), s.set(i, n));
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
        Re,
        this._convertListener(e),
        t
      );
      return;
    }
    this.subscribeToEvent(
      Pe,
      this._convertListener(e),
      t
    );
  }
  emitPluginReadyEvent(e, t, i = !1) {
    if (i) {
      this.emitEvent(
        Re,
        t,
        e
      );
      return;
    }
    this.emitEvent(
      Pe,
      t,
      e
    );
  }
  reset() {
    this._listeners.clear();
  }
}
let ke = 0;
function Ee() {
  return ke++ + "";
}
class xe {
  constructor(e, t, i, s, n, r, l) {
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
    this._id = Ee(), this._pluginFactory = e, this._pluginName = t, this._registry = i, this._eventBus = s, this._appEventBus = n, this._internalEventBus = new U(), this._config = r, this._layoutIdViewMapWaitingToEnter = /* @__PURE__ */ new Map(), this._pluginKey = l, this._apiData = {}, this._appEventBus.subscribeToPluginReadyEvent(
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
  removeListener(e, t) {
    this._internalEventBus.removeEventListener(e, t);
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
    const l = this._registry.createView(r, e.name);
    return l.setAsTemporaryView(), l.styles.position = "absolute", l.styles.left = `${t.left + s}px`, l.styles.top = `${t.top - n}px`, l.rotation.setDegrees(e.rotation.degrees, !1), l.scale.set({ x: e.scale.x, y: e.scale.y }, !1), l.size.set(
      { width: e._localWidth, height: e._localHeight },
      !1
    ), e._copyAnimatorsToAnotherView(l), e.onRemoveCallback && l.onRemove(e.onRemoveCallback), l;
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
class De extends xe {
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
class j extends xe {
  isRenderable() {
    return !1;
  }
}
class We {
  constructor(e) {
    a(this, "_plugin");
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
function W(o, e, t, i, s, n) {
  if (ze(o))
    return new o(
      o,
      o.pluginName,
      e,
      t,
      i,
      s,
      n
    );
  const r = new De(
    o,
    o.pluginName,
    e,
    t,
    i,
    s,
    n
  ), l = new We(r);
  return o(l), r;
}
function ze(o) {
  var e;
  return ((e = o.prototype) == null ? void 0 : e.constructor.toString().indexOf("class ")) === 0;
}
class h {
  constructor(e, t) {
    a(this, "x");
    a(this, "y");
    this.x = e, this.y = t;
  }
  get magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  get unitVector() {
    const e = new h(0, 0), t = this.magnitude;
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
    return new h(this.x, this.y);
  }
  static scale(e, t) {
    return new h(e.x * t, e.y * t);
  }
  static sub(e, t) {
    return new h(e.x - t.x, e.y - t.y);
  }
  static add(e, t) {
    return new h(e.x + t.x, e.y + t.y);
  }
}
class Ue {
  constructor(e) {
    a(this, "_element");
    a(this, "_callback");
    this._element = e, this._observe();
  }
  setElement(e) {
    this._element = e, this._observe();
  }
  _observe() {
    var n;
    const e = new MutationObserver(() => {
      var r;
      (r = this._callback) == null || r.call(this, !1);
    }), t = {
      attributes: !0,
      childList: !0,
      attributeOldValue: !0
    };
    e.observe(this._element, t), new ResizeObserver(() => {
      var r;
      (r = this._callback) == null || r.call(this, !0);
    }).observe(this._element);
    function s(r, l) {
      let u, c = !0;
      return function() {
        c && (r(), c = !1), clearTimeout(u), u = setTimeout(() => {
          r(), c = !0;
        }, l);
      };
    }
    (n = this._element.parentElement) == null || n.addEventListener(
      "scroll",
      s(() => {
        var r;
        (r = this._callback) == null || r.call(this, !0);
      }, 30)
    ), window.addEventListener(
      "scroll",
      s(() => {
        var r;
        (r = this._callback) == null || r.call(this, !0);
      }, 30)
    ), window.addEventListener(
      "resize",
      s(() => {
        var r;
        (r = this._callback) == null || r.call(this, !0);
      }, 30)
    );
  }
  onChange(e) {
    this._callback = e;
  }
}
function qe(o) {
  return new Ue(o);
}
function q(o, e, t) {
  return Math.min(Math.max(o, e), t);
}
function Ye(o, e) {
  return Math.floor(Math.random() * (e - o + 1) + o);
}
function Te(o, e) {
  const t = e.x - o.x, i = e.y - o.y;
  return Math.sqrt(t * t + i * i);
}
function Xe(o, e, t) {
  return o + (e - o) * t;
}
function p(o, e) {
  const i = o - e;
  return Math.abs(i) <= 0.01;
}
function He(o, e, t, i, s) {
  return (o - e) / (t - e) * (s - i) + i;
}
function je(o, e, t, i) {
  const s = e.getScroll(), n = e.position.x - s.x, r = e.position.y - s.y, l = o.x || n, u = o.y || r, c = Math.abs(n - l), d = Math.abs(r - u), g = Math.sqrt(c * c + d * d);
  let _ = q(0, g / t, 1);
  return typeof i > "u" ? 1 - _ : g <= i ? 1 : (_ = q((g - i) / t, 0, 1), 1 - _);
}
function m(o) {
  let e = o.match(/^([\d.]+)([a-zA-Z%]*)$/);
  e || (e = "0px".match(/^([\d.]+)([a-zA-Z%]*)$/));
  const t = parseFloat(e[1]), i = e[2];
  return { value: t, unit: i, valueWithUnit: o };
}
function Ke(o, e, t = !1) {
  if (o === e)
    return !0;
  if (o.length !== e.length)
    return !1;
  for (let i = 0; i < o.length; i++) {
    if (t && !p(o[i].value, e[i].value))
      return !1;
    if (o[i].value !== e[i].value)
      return !1;
  }
  return !0;
}
function fe(o, e) {
  return Ke(o, e, !0);
}
class R {
  constructor(e, t, i, s) {
    a(this, "_topLeft");
    a(this, "_topRight");
    a(this, "_bottomLeft");
    a(this, "_bottomRight");
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
function Y(o) {
  const e = o.split(" ").map((i) => m(i)), t = {
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
function Ge(o, e) {
  const t = r(o.topLeft, e), i = r(o.topRight, e), s = r(o.bottomLeft, e), n = r(o.bottomRight, e);
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
  function r(l, u) {
    if (l.unit === "%")
      return {
        h: m(`${l.value}%`),
        v: m(`${l.value}%`)
      };
    const c = l.value / u.width * 100, d = l.value / u.height * 100;
    return { h: m(`${c}%`), v: m(`${d}%`) };
  }
}
function me(o, e) {
  return p(o.topLeft.value, e.topLeft.value) && p(o.topRight.value, e.topRight.value) && p(o.bottomRight.value, e.bottomRight.value) && p(o.bottomLeft.value, e.bottomLeft.value);
}
class Ze {
  constructor(e) {
    a(this, "_value");
    this._value = e;
  }
  get value() {
    return this._value;
  }
  equals(e) {
    return p(this.value, e.value);
  }
}
function Je(o) {
  return new Ze(parseFloat(o));
}
class Qe {
  constructor(e, t) {
    a(this, "_x");
    a(this, "_y");
    this._x = e, this._y = t;
  }
  get value() {
    return new h(this._x, this._y);
  }
}
function et(o, e) {
  const [t, i] = o.split(" "), s = m(t), n = m(i);
  return new Qe(
    s.value / e.width,
    n.value / e.height
  );
}
function ve(o, e) {
  const t = tt(o), i = o.offsetWidth, s = o.offsetHeight;
  return {
    viewportOffset: {
      left: Math.round(t.left),
      top: Math.round(t.top),
      right: Math.round(t.right),
      bottom: Math.round(t.bottom)
    },
    pageOffset: e.read({
      width: i,
      height: s
    }),
    size: {
      width: i,
      height: s
    }
  };
}
function tt(o) {
  const e = o.getBoundingClientRect();
  return {
    left: e.left,
    top: e.top,
    right: e.right,
    bottom: e.bottom,
    width: e.width,
    height: e.height
  };
}
function we(o) {
  let e = o, t = 0, i = 0;
  for (; e; )
    t += e.offsetTop, i += e.offsetLeft, e = e.offsetParent;
  return { top: t, left: i };
}
class it {
  constructor(e) {
    a(this, "_currentPageRect");
    a(this, "_view");
    a(this, "_element");
    a(this, "_offsetLeft");
    a(this, "_offsetTop");
    a(this, "_width");
    a(this, "_height");
    a(this, "_parentWidth");
    a(this, "_parentHeight");
    a(this, "_parentEl");
    a(this, "_isSvg");
    a(this, "_invalid");
    this._invalid = !0, this._view = e, this._element = e.element, this._isSvg = !!this._element.closest("svg"), this._offsetLeft = 0, this._offsetTop = 0, this._width = 0, this._height = 0, this._parentWidth = 0, this._parentHeight = 0, this._offsetLeft = 0, this._parentEl = this._element.parentElement, window.addEventListener("resize", () => {
      this.invalidate();
    });
  }
  invalidate() {
    this._invalid = !0;
  }
  read(e) {
    if (this._isSvg)
      return this._currentPageRect || (this._currentPageRect = we(this._element)), this._currentPageRect;
    const t = this._element.parentElement, i = this._element.offsetLeft, s = this._element.offsetTop, n = e.width, r = e.height, l = (t == null ? void 0 : t.offsetWidth) || 0, u = (t == null ? void 0 : t.offsetHeight) || 0;
    return (this._offsetLeft !== i || this._offsetTop !== s || !p(this._width, n) || !p(this._height, r)) && this._view._children.forEach(
      (c) => c.elementReader.invalidatePageRect()
    ), !this._invalid && this._currentPageRect && this._offsetLeft === i && this._offsetTop === s && p(this._width, n) && p(this._height, r) && p(this._parentWidth, l) && p(this._parentHeight, u) && this._parentEl === t ? this._currentPageRect : (this._offsetLeft = i, this._offsetTop = s, this._width = n, this._height = r, this._parentWidth = l, this._parentHeight = u, this._parentEl = t, this._currentPageRect = we(this._element), this._invalid = !1, this._currentPageRect);
  }
}
function st(o) {
  return new it(o);
}
class nt {
  constructor(e) {
    a(this, "_element");
    a(this, "_rect");
    a(this, "_computedStyle");
    a(this, "_pageRectReader");
    a(this, "_scroll");
    this._element = e.element, this._pageRectReader = st(e), this._rect = ve(this._element, this._pageRectReader), this._computedStyle = getComputedStyle(this._element), this._scroll = this._calculateScroll();
  }
  invalidatePageRect() {
    this._pageRectReader.invalidate();
  }
  update(e = !1) {
    this._rect = ve(this._element, this._pageRectReader), this._computedStyle = getComputedStyle(this._element), e && (this._scroll = this._calculateScroll());
  }
  get rect() {
    return this._rect;
  }
  get opacity() {
    return Je(this._computedStyle.opacity);
  }
  get borderRadius() {
    return Y(this._computedStyle.borderRadius);
  }
  get origin() {
    return et(
      this._computedStyle.transformOrigin,
      this._rect.size
    );
  }
  _calculateScroll() {
    let e = this._element, t = 0, i = 0;
    for (; e; )
      t += e.scrollTop, i += e.scrollLeft, e = e.offsetParent;
    return i += window.scrollX, t += window.scrollY, { y: t, x: i };
  }
  get scroll() {
    return this._scroll;
  }
}
function ye(o) {
  return new nt(o);
}
function X(o, e) {
  const t = {
    set: (i, s, n) => (typeof i[s] == "object" && i[s] !== null ? i[s] = X(n, e) : (e(), i[s] = n), !0),
    get: (i, s) => typeof i[s] == "object" && i[s] !== null ? X(i[s], e) : i[s]
  };
  return new Proxy(o, t);
}
const B = 0.01, K = {
  speed: 15
};
class G {
  constructor(e) {
    a(this, "name", "dynamic");
    a(this, "_config");
    this._config = e;
  }
  get config() {
    return this._config;
  }
}
class rt extends G {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    const n = h.sub(i, t), r = h.scale(n, this._config.speed);
    let l = h.add(t, h.scale(r, s));
    return this._shouldFinish(i, t, r) && (l = i, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), e.callUpdateCallback(), l;
  }
  _shouldFinish(e, t, i) {
    return h.sub(e, t).magnitude < B && i.magnitude < B;
  }
}
class at extends G {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    const r = (i - t) * this._config.speed;
    let l = t + r * s;
    return p(l, i) && (l = i, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), e.callUpdateCallback(), l;
  }
}
class ot extends G {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    return i.map((n, r) => {
      const l = t[r], u = n.value === 0 ? l.unit : n.unit, d = (n.value - l.value) * this._config.speed, g = l.value + d * s;
      let _ = m(`${g}${u}`);
      return this._shouldFinish(n.value, l.value, d) && (_ = n, requestAnimationFrame(() => {
        e.callCompleteCallback();
      })), e.callUpdateCallback(), _;
    });
  }
  _shouldFinish(e, t, i) {
    return Math.abs(e - t) < B && Math.abs(i) < B;
  }
}
class Z {
  constructor() {
    a(this, "name", "instant");
    a(this, "_config", {});
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
const J = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, O = 0.01;
class Q {
  constructor(e) {
    a(this, "name", "spring");
    a(this, "_config");
    this._config = e;
  }
  get config() {
    return this._config;
  }
}
class lt extends Q {
  constructor() {
    super(...arguments);
    a(this, "_velocity", new h(0, 0));
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
    const r = h.scale(
      h.scale(h.sub(i, s), -1),
      this._config.stiffness
    );
    this._velocity = h.add(this._velocity, r), this._velocity = h.scale(this._velocity, this._config.damping);
    let l = h.add(
      i,
      h.scale(this._velocity, n * this._config.speed)
    );
    return this._shouldFinish(s, i) && (l = s, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), l;
  }
  _shouldFinish(t, i) {
    return h.sub(t, i).magnitude < O && this._velocity.magnitude < O;
  }
}
class ut extends Q {
  constructor() {
    super(...arguments);
    a(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
    const r = -(i - s) * this._config.stiffness;
    this._velocity += r, this._velocity *= this._config.damping;
    let l = i + this._velocity * n * this._config.speed;
    return p(l, s) && (l = s, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), l;
  }
}
class ht extends Q {
  constructor() {
    super(...arguments);
    a(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
    return s.map((r, l) => {
      const u = i[l], c = r.value === 0 ? u.unit : r.unit, d = -(u.value - r.value) * this._config.stiffness;
      this._velocity += d, this._velocity *= this._config.damping;
      const g = u.value + this._velocity * n * this._config.speed;
      let _ = m(`${g}${c}`);
      return this._shouldFinish(r.value, u.value) && (_ = r, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), _;
    });
  }
  _shouldFinish(t, i) {
    return Math.abs(t - i) < O && Math.abs(this._velocity) < O;
  }
}
function ct(o) {
  return o;
}
const ee = {
  duration: 350,
  ease: ct
};
class te {
  constructor(e) {
    a(this, "name", "tween");
    a(this, "_config");
    a(this, "_startTime");
    this._config = e;
  }
  get config() {
    return this._config;
  }
  reset() {
    this._startTime = void 0;
  }
}
class dt extends te {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : h.add(
      t,
      h.scale(h.sub(i, t), this._config.ease(n))
    );
  }
}
class _t extends te {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : t.map((r, l) => {
      const u = i[l], c = u.value === 0 ? r.unit : u.unit, d = r.value + this._config.ease(n) * (i[l].value - r.value);
      return m(`${d}${c}`);
    });
  }
}
class gt extends te {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : t + (i - t) * this._config.ease(n);
  }
}
class ie {
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
class C extends ie {
  createInstantAnimator() {
    return new Z();
  }
  createTweenAnimator(e) {
    return new dt({ ...ee, ...e });
  }
  createDynamicAnimator(e) {
    return new rt({ ...K, ...e });
  }
  createSpringAnimator(e) {
    return new lt({ ...J, ...e });
  }
}
class pt extends ie {
  createInstantAnimator() {
    return new Z();
  }
  createTweenAnimator(e) {
    return new _t({ ...ee, ...e });
  }
  createDynamicAnimator(e) {
    return new ot({
      ...K,
      ...e
    });
  }
  createSpringAnimator(e) {
    return new ht({ ...J, ...e });
  }
}
class Ve extends ie {
  createInstantAnimator() {
    return new Z();
  }
  createDynamicAnimator(e) {
    return new at({ ...K, ...e });
  }
  createTweenAnimator(e) {
    return new gt({ ...ee, ...e });
  }
  createSpringAnimator(e) {
    return new ut({ ...J, ...e });
  }
}
function b(o) {
  return structuredClone(o);
}
class ft {
  constructor(e) {
    a(this, "_viewProp");
    a(this, "_completeCallback");
    a(this, "_updateCallback");
    a(this, "_isAnimating");
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
class P {
  constructor(e, t, i) {
    a(this, "_animatorProp");
    a(this, "_animator");
    a(this, "_initialValue");
    a(this, "_previousValue");
    a(this, "_targetValue");
    a(this, "_currentValue");
    a(this, "_hasChanged");
    a(this, "_view");
    a(this, "_animatorFactory");
    a(this, "_previousRenderValue");
    this._animatorProp = new ft(this), this._animatorFactory = e, this._initialValue = b(t), this._previousValue = b(t), this._targetValue = b(t), this._currentValue = b(t), this._hasChanged = !1, this._previousRenderValue = void 0, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
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
    this._previousValue = b(this._currentValue), this._targetValue = e, t ? ((s = (i = this._animator).reset) == null || s.call(i), this.animator.markAsAnimating()) : this._currentValue = e, this._hasChanged = !0;
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
class mt extends P {
  constructor() {
    super(...arguments);
    a(this, "_invertedBorderRadius");
    a(this, "_forceStyleUpdateThisFrame", !1);
    a(this, "_updateWithScale", !1);
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
      const c = Y(t.trim());
      s = {
        topLeft: c.value.topLeft.valueWithUnit,
        topRight: c.value.topRight.valueWithUnit,
        bottomRight: c.value.bottomRight.valueWithUnit,
        bottomLeft: c.value.bottomLeft.valueWithUnit
      };
    } else
      s = t;
    const n = s.topLeft ? m(s.topLeft) : this._currentValue[0], r = s.topRight ? m(s.topRight) : this._currentValue[1], l = s.bottomRight ? m(s.bottomRight) : this._currentValue[2], u = s.bottomLeft ? m(s.bottomLeft) : this._currentValue[3];
    this._setTarget([n, r, l, u], i);
  }
  reset(t = !0) {
    this._setTarget(this._initialValue, t);
  }
  update(t, i) {
    if (this._forceStyleUpdateThisFrame)
      this._hasChanged = !0, this._forceStyleUpdateThisFrame = !1;
    else if (this._view.scale.isAnimating && this._updateWithScale)
      this._hasChanged = !0;
    else if (fe(this._targetValue, this._currentValue)) {
      this._hasChanged = !fe(
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
    this._invertedBorderRadius = Ge(
      Y(
        `${this._currentValue[0].valueWithUnit} ${this._currentValue[1].valueWithUnit} ${this._currentValue[2].valueWithUnit} ${this._currentValue[3].valueWithUnit}`
      ).value,
      {
        width: t,
        height: i
      }
    );
  }
  get shouldRender() {
    return this._hasChanged ? this._previousRenderValue ? !(me(
      this.renderValue.v,
      this._previousRenderValue.v
    ) && me(this.renderValue.h, this._previousRenderValue.h)) : !0 : !1;
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
class vt extends P {
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
class wt extends P {
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
    this._setTarget(new h(i.x, i.y), !1);
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
    return new h(this.x * 100, this.y * 100);
  }
  projectStyles() {
    const e = this.renderValue, t = `transform-origin: ${e.x}% ${e.y}%;`;
    return this._previousRenderValue = e, t;
  }
  isTransform() {
    return !1;
  }
}
class yt extends P {
  constructor() {
    super(...arguments);
    a(this, "_animateLayoutUpdateNextFrame", !1);
    a(this, "_parentScaleInverse", new h(1, 1));
  }
  get _parentDiff() {
    let t = this._view._parent, i = 0, s = 0;
    if (t) {
      const n = t.rect.pageOffset, r = t.getScroll(), l = {
        left: t.previousRect.viewportOffset.left + r.x,
        top: t.previousRect.viewportOffset.top + r.y
      };
      i = l.left - n.left, s = l.top - n.top;
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
    const i = typeof t.x > "u" ? this.initialX : t.x, s = typeof t.y > "u" ? this.initialY : t.y, n = new h(i, s), r = new h(this.initialX, this.initialY), l = new h(this.x, this.y), u = h.sub(l, r), c = h.sub(n, r);
    return 1 - h.sub(c, u).magnitude / c.magnitude;
  }
  set(t, i = !0) {
    const n = { ...{ x: this.x, y: this.y }, ...t };
    this._setTarget(
      new h(
        n.x - this._rect.pageOffset.left,
        n.y - this._rect.pageOffset.top
      ),
      i
    );
  }
  reset(t = !0) {
    this._setTarget(new h(0, 0), t);
  }
  update(t, i) {
    if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
      const c = this._view._parent, d = c ? c.scale.x : 1, g = c ? c.scale.y : 1;
      this._parentScaleInverse = new h(1 / d, 1 / g), this._parentScaleInverse.equals(new h(1, 1)) || (this._hasChanged = !0);
    }
    if (this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y)
      return;
    const s = this._view._parent, n = s ? s.scale.x : 1, r = s ? s.scale.y : 1, l = s ? s.scale._previousValue.x : 1, u = s ? s.scale._previousValue.y : 1;
    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: new h(
        this._currentValue.x * n,
        this._currentValue.y * r
      ),
      target: this._targetValue,
      initial: new h(
        this._previousValue.x * l,
        this._previousValue.y * u
      ),
      ts: t,
      dt: i
    }), this._currentValue = new h(
      this._currentValue.x / n,
      this._currentValue.y / r
    );
  }
  _runLayoutTransition() {
    const t = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), i = !(this._view.scale._targetValue.x === this._view.scale._currentValue.x && this._view.scale._targetValue.y === this._view.scale._currentValue.y), s = t || i, n = this._rect.pageOffset.left - this._previousRect.pageOffset.left, r = this._rect.pageOffset.top - this._previousRect.pageOffset.top, l = this._previousRect.size.width / this._rect.size.width, u = this._previousRect.size.height / this._rect.size.height;
    let c = !1;
    if (n !== 0 || r !== 0 || !Number.isNaN(l) && l !== 1 || !Number.isNaN(u) && u !== 1 ? c = !0 : c = (() => {
      const d = this._view._parents;
      for (let g = 0; g < d.length; g++) {
        const _ = d[g], w = _.previousRect.size.width / _.rect.size.width, f = _.previousRect.size.height / _.rect.size.height;
        if (w !== 1 || f !== 1)
          return !0;
      }
      return !1;
    })(), c) {
      if (this._currentValue.x !== 0 || this._currentValue.y !== 0 || this._view.scale._currentValue.x !== 1 || this._view.scale._currentValue.y !== 1) {
        if (!s) {
          const I = this._rect.pageOffset.left - this._previousRect.pageOffset.left, N = this._rect.pageOffset.top - this._previousRect.pageOffset.top;
          this._setTarget(
            new h(this._currentValue.x - I, this._currentValue.y - N),
            !1
          );
          return;
        }
        const V = this._view._parent, ae = this._rect.pageOffset, oe = this._view.getScroll(), A = {
          left: this._previousRect.viewportOffset.left + oe.x,
          top: this._previousRect.viewportOffset.top + oe.y
        }, Ne = A.left - ae.left, Le = A.top - ae.top;
        let le = 0, ue = 0, he = 0, ce = 0;
        if (V) {
          const I = V.rect.pageOffset, N = V.getScroll(), L = {
            left: V.previousRect.viewportOffset.left + N.x,
            top: V.previousRect.viewportOffset.top + N.y
          };
          le = L.left - I.left, ue = L.top - I.top;
          const de = A.top - L.top, _e = A.left - L.left, Ce = V.scale.y * de;
          he = (de - Ce) / V.scale.y;
          const Se = V.scale.x * _e;
          ce = (_e - Se) / V.scale.x;
        }
        this._setTarget(
          new h(Ne - le + ce, Le - ue + he),
          !1
        ), s && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      this._animateLayoutUpdateNextFrame = !0;
      const d = this._previousRect, g = this._rect, _ = this._view._parent;
      let w = 0, f = 0;
      _ && (w = _.previousRect.viewportOffset.left - _.rect.viewportOffset.left), _ && (f = _.previousRect.viewportOffset.top - _.rect.viewportOffset.top);
      let y = 1, v = 1;
      _ && (y = _.previousRect.size.width / _.rect.size.width, v = _.previousRect.size.height / _.rect.size.height);
      const E = _ ? _.previousRect.viewportOffset.left : 0, D = _ ? _.previousRect.viewportOffset.top : 0, ne = d.viewportOffset.left - E, re = d.viewportOffset.top - D, Ae = ne / y - ne, Ie = re / v - re;
      let x = d.viewportOffset.left - g.viewportOffset.left - w + Ae, T = d.viewportOffset.top - g.viewportOffset.top - f + Ie;
      x = Number.isFinite(x) ? x : 0, T = Number.isFinite(T) ? T : 0, this._setTarget(new h(x, T), !1);
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
    return (this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && (t = (this._rect.size.width * this._parentScaleInverse.x * this._view.scale.x - this._rect.size.width) * this._view.origin.x, i = (this._rect.size.height * this._parentScaleInverse.y * this._view.scale.y - this._rect.size.height) * this._view.origin.y), new h(
      this._currentValue.x + t,
      this._currentValue.y + i
    );
  }
  projectStyles() {
    const t = this.renderValue, i = `translate3d(${t.x}px, ${t.y}px, 0px)`;
    return this._previousRenderValue = t, i;
  }
  isTransform() {
    return !0;
  }
}
class Vt extends P {
  constructor() {
    super(...arguments);
    a(this, "_unit", "deg");
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
class Pt extends P {
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
  set(t, i = !0) {
    const r = { ...{ x: this._currentValue.x, y: this._currentValue.y }, ...typeof t == "number" ? { x: t, y: t } : t };
    this._setTarget(new h(r.x, r.y), i);
  }
  setWithSize(t, i = !0) {
    let s = this._currentValue.x, n = this._currentValue.y;
    t.width && (s = t.width / this._rect.size.width), t.height && (n = t.height / this._rect.size.height), !t.width && t.height && (s = n), !t.height && t.width && (n = s);
    const r = { x: s, y: n };
    this._setTarget(new h(r.x, r.y), i);
  }
  reset(t = !0) {
    this._setTarget(new h(1, 1), t);
  }
  update(t, i) {
    if (this._view.layoutOption !== "position") {
      if ((this._view.isInverseEffectEnabled || this._view.isLayoutTransitionEnabled) && !this._view.isTemporaryView && this._runLayoutTransition(), this._view.isInverseEffectEnabled) {
        const s = this._view._parent, n = s ? s.scale.x : 1, r = s ? s.scale.y : 1;
        this._hasChanged = n !== 1 || r !== 1;
      }
      this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y || (this._currentValue = this._animator.update({
        animatorProp: this._animatorProp,
        current: this._currentValue,
        target: this._targetValue,
        initial: new h(this._previousValue.x, this._previousValue.y),
        ts: t,
        dt: i
      }));
    }
  }
  _runLayoutTransition() {
    const t = !(this._targetValue.x === this._currentValue.x && this._targetValue.y === this._currentValue.y), i = this._previousRect.size.width / this._rect.size.width, s = this._previousRect.size.height / this._rect.size.height;
    let n = !1;
    if ((!Number.isNaN(i) && i !== 1 || !Number.isNaN(s) && s !== 1) && (n = !0), n) {
      if (this._currentValue.x !== 1 || this._currentValue.y !== 1) {
        const d = this._view.previousRect.size.width / this._view.rect.size.width, g = this._view.previousRect.size.height / this._view.rect.size.height;
        this._setTarget(
          new h(this._currentValue.x * d, this._currentValue.y * g),
          !1
        ), t && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      const r = this._previousRect.size.width / this._rect.size.width, l = this._previousRect.size.height / this._rect.size.height, u = r, c = l;
      this._view.viewProps.borderRadius.applyScaleInverse(), this._setTarget(new h(u, c), !1), this._animateLayoutUpdateNextFrame = !0;
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
    return new h(s, n);
  }
  projectStyles() {
    const t = this.renderValue, i = `scale3d(${t.x}, ${t.y}, 1)`;
    return this._previousRenderValue = t, i;
  }
  isTransform() {
    return !0;
  }
}
class Rt extends P {
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
    this._setTarget(new h(s.width, s.height), t);
  }
  setWidth(e, t = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, width: e };
    this._setTarget(new h(s.width, s.height), t);
  }
  setHeight(e, t = !0) {
    const s = { ...{
      width: this._currentValue.x,
      height: this._currentValue.y
    }, height: e };
    this._setTarget(new h(s.width, s.height), t);
  }
  reset(e = !0) {
    this._setTarget(
      new h(this.initialWidth, this.initialHeight),
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
    return new h(this._currentValue.x, this._currentValue.y);
  }
  projectStyles() {
    const e = this.renderValue, t = `width: ${e.x}px; height: ${e.y}px;`;
    return this._previousRenderValue = e, t;
  }
  isTransform() {
    return !1;
  }
}
class bt {
  constructor(e) {
    a(this, "_props", /* @__PURE__ */ new Map());
    this._props.set(
      "position",
      new yt(new C(), new h(0, 0), e)
    ), this._props.set(
      "scale",
      new Pt(new C(), new h(1, 1), e)
    ), this._props.set(
      "rotation",
      new Vt(new Ve(), 0, e)
    ), this._props.set(
      "size",
      new Rt(
        new C(),
        new h(e.rect.size.width, e.rect.size.height),
        e
      )
    ), this._props.set(
      "opacity",
      new vt(
        new Ve(),
        e.elementReader.opacity.value,
        e
      )
    ), this._props.set(
      "borderRadius",
      new mt(
        new pt(),
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
      new wt(
        new C(),
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
class Et {
  constructor(e, t, i, s) {
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
    a(this, "_viewParents");
    a(this, "_temporaryView");
    a(this, "_inverseEffect");
    a(this, "_renderNextTick");
    a(this, "_layoutOption");
    a(this, "_elementObserver");
    a(this, "_hasReadElement");
    a(this, "_shouldReadRect");
    a(this, "_readWithScroll");
    a(this, "_externalUserStyles");
    this._registry = i, this.id = Ee(), this.name = t, this.element = e, this.element.dataset.velViewId = this.id, this._elementReader = ye(this), this._viewParents = this._getParents(), this._previousRect = this._elementReader.rect, this._viewProps = new bt(this), this._skipFirstRenderFrame = !0, this._layoutId = s, this._layoutTransition = !1, this._temporaryView = !1, this.styles = X(this.styles, () => {
      this._renderNextTick = !0;
    }), this._externalUserStyles = this._getExternalUserStyles(), this._renderNextTick = !1, this._layoutOption = this._getLayoutOption(), this._hasReadElement = !1, this._shouldReadRect = !1, this._readWithScroll = !1, this._elementObserver = qe(e), this._elementObserver.onChange((n) => {
      if (this._hasReadElement) {
        this._shouldReadRect = !1;
        return;
      }
      this._externalUserStyles = this._getExternalUserStyles(), this._shouldReadRect = !0, this._readWithScroll = n;
    });
  }
  destroy() {
    this._viewProps.allProps().forEach((e) => e.destroy()), this.element.removeAttribute("data-vel-view-id"), this.element.removeAttribute("data-vel-plugin-id"), this._renderNextTick = !0;
  }
  get elementReader() {
    return this._elementReader;
  }
  get layoutOption() {
    return this._layoutOption;
  }
  _getLayoutOption() {
    return this.element.closest("[data-vel-layout-position]") ? "position" : this.element.closest("[data-vel-layout-size]") ? "size" : "all";
  }
  setElement(e) {
    this.element = e, this._elementReader = ye(this), this.element.dataset.velViewId = this.id, this._elementObserver.setElement(e);
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
    const e = this.element.querySelectorAll("*");
    return Array.from(e).map((i) => i.dataset.velViewId).filter((i) => i && typeof i == "string").map((i) => this._registry.getViewById(i)).filter((i) => !!i);
  }
  get _parent() {
    return this._parents[0];
  }
  get _parents() {
    return this._viewParents;
  }
  _getParents() {
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
    let e = !1;
    for (let t = 0; t < this._parents.length; t++) {
      const i = this._parents[t];
      if (typeof i._inverseEffect < "u") {
        e = i._inverseEffect;
        break;
      }
    }
    return e;
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
    return this._elementReader.scroll;
  }
  intersects(e, t) {
    const i = this.element.getBoundingClientRect(), s = {
      x: i.left,
      y: i.top
    };
    return e >= s.x && e <= s.x + i.width && t >= s.y && t <= s.y + i.height;
  }
  // Using AABB collision detection
  overlapsWith(e) {
    const t = e._localWidth * e.scale.x, i = e._localHeight * e.scale.y, s = this._localWidth * this.scale.x, n = this._localHeight * this.scale.y;
    return this.position.x < e.position.x + t && this.position.x + s > e.position.x && this.position.y < e.position.y + i && this.position.y + n > e.position.y;
  }
  distanceTo(e) {
    const t = new h(this.position.x, this.position.y), i = new h(e.position.x, e.position.y);
    return h.sub(i, t).magnitude;
  }
  read() {
    this._shouldReadRect && (this._elementReader.update(this._readWithScroll), this._children.forEach((e) => {
      e.setHasReadElement(!0), e.elementReader.update(this._readWithScroll);
    }), this._shouldReadRect = !1, this._readWithScroll = !1), this.setHasReadElement(!1);
  }
  setHasReadElement(e) {
    this._hasReadElement = e;
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
  _cleanCssText(e) {
    const t = /* @__PURE__ */ new Map(), i = /([-\w]+)\s*:\s*([^;]+)\s*;?/g;
    let s;
    for (; (s = i.exec(e)) !== null; ) {
      const [n, r, l] = s;
      if (!l.trim())
        continue;
      const u = r.replace(/^-\w+-/, "");
      (!t.has(u) || !r.startsWith("-")) && t.set(
        u,
        `${u}: ${l.trim()}`
      );
    }
    return Array.from(t.values()).join("; ");
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
      const n = i.reduce((r, l, u) => (r += l.projectStyles(), u < i.length - 1 && (r += " "), u === i.length - 1 && (r += ";"), r), "transform: ");
      e += n;
    }
    s.forEach((n) => {
      n.hasChanged() && (e += n.projectStyles());
    }), e += this._getUserStyles(), this._cleanCssText(this.element.style.cssText) !== this._cleanCssText(e) && (this.element.style.cssText = e), this._renderNextTick = !1;
  }
  _getExternalUserStyles() {
    const e = this.element.style.cssText, t = this.styles;
    if (e.length === 0)
      return "";
    const i = [
      "transform",
      "transform-origin",
      "opacity",
      "width",
      "height",
      "border-radius"
    ], s = {};
    for (const u in t)
      t.hasOwnProperty(u) && (s[ge(u)] = t[u]);
    return e.split(";").map((u) => u.trim()).filter(Boolean).filter((u) => {
      const c = u.indexOf(":");
      if (c === -1)
        return !1;
      const d = u.slice(0, c).trim();
      return !s.hasOwnProperty(d) && !i.includes(d);
    }).join("; ");
  }
  _getUserStyles() {
    return Object.keys(this.styles).reduce((e, t) => {
      if (!t)
        return e;
      const i = ge(t).replace("webkit", "-webkit").replace("moz", "-moz");
      return e + `${i}: ${this.styles[t]}; `;
    }, this._externalUserStyles);
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
  getChildren(e) {
    const t = this.element.querySelectorAll("*"), i = Array.from(t).filter((s) => {
      const n = s;
      return typeof n.dataset.velViewId < "u" && n.dataset.velView === e;
    }).map((s) => s.dataset.velViewId);
    return this._registry.getViewsById(i);
  }
  getChild(e) {
    return this.getChildren(e)[0];
  }
  getParent(e) {
    const t = this.element.closest(
      `[data-vel-view="${e}"]`
    );
    if (!t)
      return;
    const i = t.dataset.velViewId;
    if (i)
      return this._registry.getViewById(i);
  }
}
class xt {
  constructor(e, t) {
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
    a(this, "_pluginNameToPluginFactoryMap", /* @__PURE__ */ new Map());
    a(this, "_pluginNameToPluginConfigMap", /* @__PURE__ */ new Map());
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
  _removeElementsWithParent(e) {
    const t = new Set(e);
    return e.filter((i) => {
      let s = i.parentElement;
      for (; s; ) {
        if (t.has(s))
          return !1;
        s = s.parentElement;
      }
      return !0;
    });
  }
  _handleAddedViews() {
    this._viewsCreatedInPreviousFrame.forEach((n) => {
      n.markAsAdded();
    }), this._viewsCreatedInPreviousFrame = [];
    const e = this._removeElementsWithParent(
      this._viewsToBeCreated
    ), t = e.filter(
      (n) => this._isScopedElement(n) && !this._isElementIgnored(n)
    ), i = e.filter(
      (n) => !this._isScopedElement(n) && !this._isElementIgnored(n)
    );
    this._viewsToBeCreated = [], t.forEach((n) => {
      const r = this._getPluginNameForElement(n), l = this._pluginNameToPluginFactoryMap.get(r), u = this._pluginNameToPluginConfigMap.get(r), c = n.dataset.velPluginKey, d = W(
        l,
        this,
        this._eventBus,
        this._appEventBus,
        u,
        c
      );
      this._plugins.push(d);
      const g = n.dataset.velView, _ = this._createNewView(n, g, d);
      _.isInverseEffectEnabled && _.setAnimatorsFromParent(), d.notifyAboutViewAdded(_);
    });
    const s = i.filter((n) => !!this._getPluginIdForElement(n));
    s.length !== 0 && s.forEach((n) => {
      const r = this._getPluginIdForElement(n), l = n.dataset.velView;
      if (!l || !r)
        return;
      const u = this._getPluginById(r);
      if (!u)
        return;
      const c = this._getLayoutIdForElement(n, u);
      let d;
      c && this._layoutIdToViewMap.has(c) ? (d = this._layoutIdToViewMap.get(c), d.setElement(n), d.setPluginId(u.id), this._createChildrenForView(d, u)) : d = this._createNewView(n, l, u), d.isInverseEffectEnabled && d.setAnimatorsFromParent(), u.notifyAboutViewAdded(d);
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
      Array.from(i).filter((s) => !this._isElementIgnored(s)).forEach((s) => {
        const n = s, r = n.dataset.velView ? n.dataset.velView : `${e.name}-child`, l = this._getLayoutIdForElement(n, t), u = this.createView(n, r, l);
        l && !this._layoutIdToViewMap.has(l) && this._layoutIdToViewMap.set(l, u), t.addView(u), t.notifyAboutViewAdded(u);
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
  getViewsById(e) {
    return this._views.filter((t) => e.includes(t.id));
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
        const r = (this._eventPluginsPerPlugin.get(s.id) || []).map((l) => this._getPluginById(l)).filter((l) => typeof l < "u");
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
        const r = (this._eventPluginsPerPlugin.get(s.id) || []).map((l) => this._getPluginById(l)).filter((l) => typeof l < "u");
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
    r.forEach((l) => {
      l.layoutId && this._layoutIdToViewMap.delete(l.layoutId), l.destroy();
    }), this._views = this._views.filter(
      (l) => !r.find((u) => u.id === l.id)
    ), this._viewsPerPlugin.delete(e.id), this._plugins = this._plugins.filter((l) => l.id !== e.id), n || requestAnimationFrame(() => {
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
  createPlugin(e, t, i = {}, s = !1) {
    if (!e.pluginName)
      throw Error(
        `Plugin ${e.name} must contain a pluginName field`
      );
    let n = [];
    if (e.scope) {
      const u = s ? `[data-vel-plugin=${e.pluginName}][data-vel-view=${e.scope}]:not([data-vel-plugin-id])` : `[data-vel-plugin=${e.pluginName}][data-vel-view=${e.scope}]`, c = document.querySelectorAll(u);
      this._pluginNameToPluginFactoryMap.has(e.pluginName) || this._pluginNameToPluginFactoryMap.set(
        e.pluginName,
        e
      ), this._pluginNameToPluginConfigMap.has(e.pluginName) || this._pluginNameToPluginConfigMap.set(e.pluginName, i), c ? n = Array.from(c) : n = [document.documentElement];
    } else
      n = [document.documentElement];
    const r = n.map((u) => {
      const c = u.dataset.velPluginKey, d = W(
        e,
        this,
        t,
        this._appEventBus,
        i,
        c
      );
      this._plugins.push(d);
      let g = [];
      u !== document.documentElement && g.push(u);
      const _ = u.querySelectorAll(
        `[data-vel-plugin=${d.pluginName}]`
      );
      g = [...g, ..._];
      const w = g.filter((f) => {
        if (this._isElementIgnored(f))
          return !1;
        if (!f.parentElement)
          return !0;
        const v = this._getPluginNameForElement(f.parentElement);
        return !(v && v.length > 0);
      });
      return w.length && w.forEach((f) => {
        const y = f.dataset.velView;
        if (!y)
          return;
        const v = this._createNewView(f, y, d);
        d.notifyAboutViewAdded(v);
      }), d;
    });
    if (r && r.length > 0)
      return r[0];
    const l = W(
      e,
      this,
      t,
      this._appEventBus,
      i
    );
    return e.scope || console.log(
      `%c WARNING: The plugin "${l.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), l;
  }
  updatePlugin(e, t, i = {}) {
    return this.createPlugin(e, t, i, !0);
  }
  getViews() {
    return this._views;
  }
  createView(e, t, i) {
    const s = new Et(e, t, this, i);
    return this._views.push(s), this._viewsCreatedInPreviousFrame.push(s), s;
  }
  _isElementIgnored(e) {
    return e.closest("[data-vel-ignore]");
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
class Pe {
  constructor(e) {
    a(this, "pluginApi");
    this.pluginApi = e.pluginApi;
  }
}
class Re {
  constructor(e) {
    a(this, "pluginApi");
    this.pluginApi = e.pluginApi;
  }
}
class se {
  constructor() {
    a(this, "previousTime", 0);
    a(this, "registry");
    a(this, "eventBus");
    a(this, "appEventBus");
    this.eventBus = new U(), this.appEventBus = new U(), this.registry = new xt(this.appEventBus, this.eventBus), new Me(this.eventBus);
  }
  static create() {
    return new se();
  }
  addPlugin(e, t = {}) {
    this.registry.hasPlugin(e) || this.registry.createPlugin(e, this.eventBus, t);
  }
  updatePlugin(e, t = {}) {
    this.registry.hasPlugin(e) && this.registry.updatePlugin(e, this.eventBus, t);
  }
  reset(e, t) {
    this.registry.reset(e, t);
  }
  destroy(e, t) {
    this.registry.destroy(e, t);
  }
  getPlugin(e, t) {
    let i = typeof e == "string" ? e : e.pluginName;
    const s = this.registry.getPluginByName(i, t);
    if (!s)
      throw new Error(
        `You can't call getPlugin for ${i} with key: ${t} because it does not exist in your app`
      );
    return s.api;
  }
  getPlugins(e, t) {
    let i = typeof e == "string" ? e : e.pluginName;
    const s = this.registry.getPluginsByName(i, t);
    if (s.length === 0)
      throw new Error(
        `You can't call getPlugins for ${i} with key: ${t} because they don't exist in your app`
      );
    return s.map((n) => n.api);
  }
  onPluginEvent(e, t, i, s) {
    const n = this.registry.getPluginByName(
      e.pluginName,
      s
    );
    n && n.on(t, i);
  }
  removePluginEventListener(e, t, i) {
    const s = this.registry.getPluginByName(e.pluginName);
    s && s.removeListener(t, i);
  }
  run() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", this.start.bind(this)) : this.start();
  }
  start() {
    this.setup(), requestAnimationFrame(this.tick.bind(this));
  }
  setup() {
    this.listenToNativeEvents(), this.subscribeToEvents();
  }
  listenToNativeEvents() {
    document.addEventListener("click", (e) => {
      this.eventBus.emitEvent(H, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointermove", (e) => {
      this.eventBus.emitEvent(M, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointerdown", (e) => {
      this.eventBus.emitEvent($, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointerup", (e) => {
      this.eventBus.emitEvent(k, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    });
  }
  tick(e) {
    let t = (e - this.previousTime) / 1e3;
    t > 0.016 && (t = 1 / 60), this.previousTime = e, this.eventBus.reset(), this.subscribeToEvents(), this.read(), this.update(e, t), this.render(), requestAnimationFrame(this.tick.bind(this));
  }
  subscribeToEvents() {
    this.eventBus.subscribeToEvent(S, this.onNodeAdded.bind(this)), this.eventBus.subscribeToEvent(
      z,
      this.onNodeRemoved.bind(this)
    ), this.eventBus.subscribeToEvent(
      be,
      this.onDataChanged.bind(this)
    ), this.registry.getPlugins().forEach((e) => {
      e.subscribeToEvents(this.eventBus);
    });
  }
  onNodeAdded({ node: e }) {
    this.registry.queueNodeToBeCreated(e);
  }
  onNodeRemoved({ node: e }) {
    this.registry.queueNodeToBeRemoved(e);
  }
  onDataChanged(e) {
    this.registry.notifyPluginAboutDataChange(e);
  }
  read() {
    this.registry.getViews().forEach((e) => {
      e.read();
    });
  }
  update(e, t) {
    this.registry.update(), this.registry.getPlugins().slice().reverse().forEach((i) => {
      i.init();
    }), this.registry.getRenderablePlugins().forEach((i) => {
      i.update(e, t);
    }), this.registry.getViews().forEach((i) => {
      i.update(e, t);
    }), this.registry.getViews().forEach((i) => {
      i._updatePreviousRect();
    });
  }
  render() {
    this.registry.getRenderablePlugins().forEach((e) => {
      e.render();
    }), this.registry.getViews().forEach((e) => {
      e.render();
    });
  }
}
function Mt() {
  return se.create();
}
class Tt {
  constructor(e) {
    a(this, "view");
    a(this, "previousX");
    a(this, "previousY");
    a(this, "x");
    a(this, "y");
    a(this, "pointerX");
    a(this, "pointerY");
    a(this, "isDragging");
    a(this, "target");
    a(this, "directions", []);
    a(this, "width");
    a(this, "height");
    a(this, "distance");
    a(this, "stopped");
    this.props = e, this.previousX = e.previousX, this.previousY = e.previousY, this.x = e.x, this.y = e.y, this.pointerX = e.pointerX, this.pointerY = e.pointerY, this.width = e.width, this.height = e.height, this.distance = e.distance, this.view = e.view, this.isDragging = e.isDragging, this.stopped = e.stopped, this.target = e.target, this.directions = e.directions;
  }
}
class At extends j {
  constructor() {
    super(...arguments);
    a(this, "_pointerX", 0);
    a(this, "_pointerY", 0);
    a(this, "_initialPointer", new h(0, 0));
    a(this, "_initialPointerPerView", /* @__PURE__ */ new Map());
    a(this, "_pointerDownPerView", /* @__PURE__ */ new Map());
    a(this, "_targetPerView", /* @__PURE__ */ new Map());
    a(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    a(this, "_stopTimer", 0);
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
    t.subscribeToEvent($, ({ x: i, y: s, target: n }) => {
      this._initialPointer = new h(i, s), this.getViews().forEach((r) => {
        this._pointerDownPerView.set(r.id, r.intersects(i, s)), this._targetPerView.set(r.id, n);
        const l = new h(
          i - r.position.initialX,
          s - r.position.initialY
        );
        this._pointerX = i, this._pointerY = s, this._initialPointerPerView.set(r.id, l);
      });
    }), t.subscribeToEvent(k, () => {
      this.getViews().forEach((i) => {
        this._pointerDownPerView.get(i.id) && this._initialPointerPerView.get(i.id) && (this._pointerDownPerView.set(i.id, !1), this._emitEvent(i, []));
      });
    }), t.subscribeToEvent(M, ({ x: i, y: s }) => {
      this._pointerX = i, this._pointerY = s, this.getViews().forEach((n) => {
        if (this._pointerDownPerView.get(n.id) && this._initialPointerPerView.get(n.id)) {
          this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []);
          const r = new h(i, s), l = this._viewPointerPositionLog.get(n.id);
          l && l.push(new h(i, s));
          const u = l && l.length >= 2 ? l[l.length - 2] : r.clone(), c = this._calculateDirections(
            u,
            r
          );
          this._emitEvent(n, c), clearTimeout(this._stopTimer), this._stopTimer = setTimeout(() => {
            this._emitEvent(n, c, !0);
          }, 120);
        }
      });
    });
  }
  _emitEvent(t, i, s = !1) {
    const n = this._viewPointerPositionLog.get(t.id), r = n && n.length >= 2 ? n[n.length - 2] : null, l = this._pointerX - this._initialPointerPerView.get(t.id).x, u = this._pointerY - this._initialPointerPerView.get(t.id).y, c = this._pointerX, d = this._pointerY, g = r ? r.x - this._initialPointerPerView.get(t.id).x : l, _ = r ? r.y - this._initialPointerPerView.get(t.id).y : u, w = this._pointerY - this._initialPointer.y, f = this._pointerX - this._initialPointer.x, y = Te(this._initialPointer, {
      x: this._pointerX,
      y: this._pointerY
    }), v = this._targetPerView.get(t.id);
    if (!v || !t.hasElement(v))
      return;
    const E = this._pointerDownPerView.get(t.id) === !0;
    E || this._viewPointerPositionLog.clear();
    const D = {
      view: t,
      target: v,
      previousX: g,
      previousY: _,
      x: l,
      y: u,
      pointerX: c,
      pointerY: d,
      distance: y,
      width: f,
      height: w,
      isDragging: E,
      directions: i,
      stopped: s
    };
    this.emit(Tt, D);
  }
  _calculateDirections(t, i) {
    const s = {
      up: h.sub(new h(t.x, t.y - 1), t),
      down: h.sub(new h(t.x, t.y + 1), t),
      left: h.sub(new h(t.x - 1, t.y), t),
      right: h.sub(new h(t.x + 1, t.y), t)
    }, n = h.sub(i, t).unitVector;
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
      (u) => u.projection > 0
    ).map(
      (u) => u.direction
    );
  }
}
a(At, "pluginName", "DragEventPlugin");
class It {
  constructor(e) {
    a(this, "view");
    a(this, "direction");
    this.props = e, this.view = e.view, this.direction = e.direction;
  }
}
class Nt extends j {
  constructor() {
    super(...arguments);
    a(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map());
    a(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    a(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(t) {
    t.subscribeToEvent($, ({ x: i, y: s, target: n }) => {
      this.getViews().forEach((r) => {
        this._targetPerView.set(r.id, n), r.intersects(i, s) && this._viewIsPointerDownMap.set(r.id, !0);
      });
    }), t.subscribeToEvent(M, ({ x: i, y: s }) => {
      this.getViews().forEach((n) => {
        if (!this._viewIsPointerDownMap.get(n.id))
          return;
        this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []), this._viewPointerPositionLog.get(n.id).push(new h(i, s));
      });
    }), t.subscribeToEvent(k, ({ x: i, y: s }) => {
      this.getViews().forEach((r) => {
        if (!this._viewIsPointerDownMap.get(r.id) || !this._viewPointerPositionLog.has(r.id))
          return;
        const l = new h(i, s), u = this._viewPointerPositionLog.get(r.id), c = u[u.length - 2] || l.clone(), d = this._targetPerView.get(r.id), g = n(c, l);
        d && r.hasElement(d) && g.hasSwiped && this.emit(It, {
          view: r,
          direction: g.direction
        }), this._viewPointerPositionLog.set(r.id, []), this._viewIsPointerDownMap.set(r.id, !1);
      });
      function n(r, l) {
        const u = {
          up: h.sub(new h(r.x, r.y - 1), r),
          down: h.sub(new h(r.x, r.y + 1), r),
          left: h.sub(new h(r.x - 1, r.y), r),
          right: h.sub(new h(r.x + 1, r.y), r)
        }, c = h.sub(l, r).unitVector, d = [
          "up",
          "down",
          "left",
          "right"
        ], g = [
          c.dot(u.up),
          c.dot(u.down),
          c.dot(u.left),
          c.dot(u.right)
        ], _ = Math.max(...g), w = g.indexOf(_), f = d[w], y = h.sub(l, r).magnitude;
        return {
          hasSwiped: c.dot(u[f]) * y > 30,
          direction: f
        };
      }
    });
  }
}
a(Nt, "pluginName", "SwipeEventPlugin");
class Lt {
  constructor(e) {
    a(this, "view");
    this.props = e, this.view = e.view;
  }
}
class Ct extends j {
  subscribeToEvents(e) {
    e.subscribeToEvent(H, ({ x: t, y: i, target: s }) => {
      this.getViews().forEach((n) => {
        const r = s, l = n.element === r || n.element.contains(r);
        n.intersects(t, i) && l && this.emit(Lt, {
          view: n
        });
      });
    });
  }
}
a(Ct, "pluginName", "ClickEventPlugin");
function St(o, e) {
  const t = o.map(e), i = Math.min(...t), s = t.indexOf(i);
  return o[s];
}
const $t = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clamp: q,
  distanceBetweenTwoPoints: Te,
  minBy: St,
  pointToViewProgress: je,
  randomNumber: Ye,
  remap: He,
  valueAtPercentage: Xe
}, Symbol.toStringTag, { value: "Module" })), kt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: H,
  PointerDownEvent: $,
  PointerMoveEvent: M,
  PointerUpEvent: k
}, Symbol.toStringTag, { value: "Module" }));
export {
  Lt as ClickEvent,
  Ct as ClickEventPlugin,
  be as DataChangedEvent,
  Tt as DragEvent,
  At as DragEventPlugin,
  U as EventBus,
  j as EventPlugin,
  kt as Events,
  De as Plugin,
  We as PluginContext,
  It as SwipeEvent,
  Nt as SwipeEventPlugin,
  $t as Utils,
  Mt as createApp
};
