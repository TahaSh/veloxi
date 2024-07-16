var Ce = Object.defineProperty;
var Le = (a, e, t) => e in a ? Ce(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var o = (a, e, t) => (Le(a, typeof e != "symbol" ? e + "" : e, t), t);
class L {
  constructor(e) {
    o(this, "x");
    o(this, "y");
    o(this, "target");
    this.x = e.x, this.y = e.y, this.target = e.target;
  }
}
class Y extends L {
}
class B extends L {
}
class S extends L {
}
class F extends L {
}
class ve {
  constructor(e) {
    o(this, "pluginId");
    o(this, "pluginName");
    o(this, "viewName");
    o(this, "dataName");
    o(this, "dataValue");
    this.event = e, this.pluginId = e.pluginId, this.pluginName = e.pluginName, this.viewName = e.viewName, this.dataName = e.dataName, this.dataValue = e.dataValue;
  }
}
function Be(a) {
  return a.replace(/(?:^\w|[A-Z]|\b\w)/g, function(e, t) {
    return t === 0 ? e.toLowerCase() : e.toUpperCase();
  }).replace(/\s+/g, "").replace(/-+/g, "");
}
function Se(a) {
  return a.split("").map((e, t) => e.toUpperCase() === e ? `${t !== 0 ? "-" : ""}${e.toLowerCase()}` : e).join("");
}
class O {
  constructor(e) {
    o(this, "node");
    this.node = e.node;
  }
}
class k {
  constructor(e) {
    o(this, "node");
    this.node = e.node;
  }
}
class Fe {
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
        this._eventBus.emitEvent(O, { node: r });
        const u = r.querySelectorAll("[data-vel-plugin]");
        u.length && u.forEach((h) => {
          this._eventBus.emitEvent(O, { node: h });
        });
      }), t.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement) || typeof n.dataset.velProcessing < "u")
          return;
        const r = n.querySelectorAll("[data-vel-plugin]");
        r.length && r.forEach((u) => {
          this._eventBus.emitEvent(k, { node: u });
        }), this._eventBus.emitEvent(k, { node: n });
      });
      const i = t.attributeName;
      if (i && /data-vel-data-.+/gi.test(i)) {
        const n = t.target, r = n.dataset.velPluginId || "", u = n.dataset.velPlugin || "", h = n.dataset.velView || "", c = n.getAttribute(i);
        if (c && c !== t.oldValue) {
          const d = Be(
            i.replace("data-vel-data-", "")
          );
          this._eventBus.emitEvent(ve, {
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
class Me {
  execute(e) {
    this.call(e);
  }
}
class de extends Me {
  constructor(t) {
    super();
    o(this, "_handler");
    this._handler = t;
  }
  getHandler() {
    return this._handler;
  }
  call(t) {
    this._handler(t);
  }
}
class z {
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
    s || (s = [], this._listeners.set(e, s)), s.push(new de(t));
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
    n || (n = [], s.set(i, n)), n.push(new de(t));
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
        me,
        this._convertListener(e),
        t
      );
      return;
    }
    this.subscribeToEvent(
      fe,
      this._convertListener(e),
      t
    );
  }
  emitPluginReadyEvent(e, t, i = !1) {
    if (i) {
      this.emitEvent(
        me,
        t,
        e
      );
      return;
    }
    this.emitEvent(
      fe,
      t,
      e
    );
  }
  reset() {
    this._listeners.clear();
  }
}
let $e = 0;
function we() {
  return $e++ + "";
}
class ye {
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
    this._id = we(), this._pluginFactory = e, this._pluginName = t, this._registry = i, this._eventBus = s, this._appEventBus = n, this._internalEventBus = new z(), this._config = r, this._layoutIdViewMapWaitingToEnter = /* @__PURE__ */ new Map(), this._pluginKey = u, this._apiData = {}, this._appEventBus.subscribeToPluginReadyEvent(
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
class De extends ye {
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
class X extends ye {
  isRenderable() {
    return !1;
  }
}
class Oe {
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
function $(a, e, t, i, s, n) {
  if (ke(a))
    return new a(
      a,
      a.pluginName,
      e,
      t,
      i,
      s,
      n
    );
  const r = new De(
    a,
    a.pluginName,
    e,
    t,
    i,
    s,
    n
  ), u = new Oe(r);
  return a(u), r;
}
function ke(a) {
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
function W(a, e, t) {
  return Math.min(Math.max(a, e), t);
}
function ze(a, e) {
  return Math.floor(Math.random() * (e - a + 1) + a);
}
function Ve(a, e) {
  const t = e.x - a.x, i = e.y - a.y;
  return Math.sqrt(t * t + i * i);
}
function We(a, e, t) {
  return a + (e - a) * t;
}
function p(a, e) {
  const i = a - e;
  return Math.abs(i) <= 0.01;
}
function Ue(a, e, t, i, s) {
  return (a - e) / (t - e) * (s - i) + i;
}
function qe(a, e, t, i) {
  const s = e.getScroll(), n = e.position.x - s.x, r = e.position.y - s.y, u = a.x || n, h = a.y || r, c = Math.abs(n - u), d = Math.abs(r - h), g = Math.sqrt(c * c + d * d);
  let _ = W(0, g / t, 1);
  return typeof i > "u" ? 1 - _ : g <= i ? 1 : (_ = W((g - i) / t, 0, 1), 1 - _);
}
function m(a) {
  let e = a.match(/^([\d.]+)([a-zA-Z%]*)$/);
  e || (e = "0px".match(/^([\d.]+)([a-zA-Z%]*)$/));
  const t = parseFloat(e[1]), i = e[2];
  return { value: t, unit: i, valueWithUnit: a };
}
function Ye(a, e, t = !1) {
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
function ge(a, e) {
  return Ye(a, e, !0);
}
class b {
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
function U(a) {
  const e = a.split(" ").map((i) => m(i)), t = {
    value: 0,
    unit: "",
    valueWithUnit: "0"
  };
  switch (e.length) {
    case 1:
      return new b(e[0], e[0], e[0], e[0]);
    case 2:
      return new b(e[0], e[1], e[0], e[1]);
    case 3:
      return new b(e[0], e[1], e[2], e[1]);
    case 4:
      return new b(e[0], e[1], e[3], e[2]);
    default:
      return new b(
        t,
        t,
        t,
        t
      );
  }
}
function Xe(a, e) {
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
    const c = u.value / h.width * 100, d = u.value / h.height * 100;
    return { h: m(`${c}%`), v: m(`${d}%`) };
  }
}
function _e(a, e) {
  return p(a.topLeft.value, e.topLeft.value) && p(a.topRight.value, e.topRight.value) && p(a.bottomRight.value, e.bottomRight.value) && p(a.bottomLeft.value, e.bottomLeft.value);
}
class je {
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
function He(a) {
  return new je(parseFloat(a));
}
class Ke {
  constructor(e, t) {
    o(this, "_x");
    o(this, "_y");
    this._x = e, this._y = t;
  }
  get value() {
    return new l(this._x, this._y);
  }
}
function Ge(a, e) {
  const [t, i] = a.split(" "), s = m(t), n = m(i);
  return new Ke(
    s.value / e.width,
    n.value / e.height
  );
}
function Ze(a) {
  const e = Je(a), t = Qe(a);
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
function Je(a) {
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
function Qe(a) {
  let e = a, t = 0, i = 0;
  for (; e; )
    t += e.offsetTop, i += e.offsetLeft, e = e.offsetParent;
  return { top: t, left: i };
}
class et {
  constructor(e) {
    o(this, "_element");
    o(this, "_rect");
    o(this, "_computedStyle");
    this._rect = Ze(e), this._computedStyle = getComputedStyle(e), this._element = e;
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
    return He(this._computedStyle.opacity);
  }
  get borderRadius() {
    return U(this._computedStyle.borderRadius);
  }
  get origin() {
    return Ge(
      this._computedStyle.transformOrigin,
      this._rect.size
    );
  }
  get scroll() {
    let e = this._element, t = 0, i = 0;
    for (; e; )
      t += e.scrollTop, i += e.scrollLeft, e = e.offsetParent;
    return i += window.scrollX, t += window.scrollY, { y: t, x: i };
  }
}
function D(a) {
  return new et(a);
}
function q(a, e) {
  const t = {
    set: (i, s, n) => (typeof i[s] == "object" && i[s] !== null ? i[s] = q(n, e) : (e(), i[s] = n), !0),
    get: (i, s) => typeof i[s] == "object" && i[s] !== null ? q(i[s], e) : i[s]
  };
  return new Proxy(a, t);
}
const I = 0.01, j = {
  speed: 15
};
class H {
  constructor(e) {
    o(this, "name", "dynamic");
    o(this, "_config");
    this._config = e;
  }
  get config() {
    return this._config;
  }
}
class tt extends H {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    const n = l.sub(i, t), r = l.scale(n, this._config.speed);
    let u = l.add(t, l.scale(r, s));
    return this._shouldFinish(i, t, r) && (u = i, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), e.callUpdateCallback(), u;
  }
  _shouldFinish(e, t, i) {
    return l.sub(e, t).magnitude < I && i.magnitude < I;
  }
}
class it extends H {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    const r = (i - t) * this._config.speed;
    let u = t + r * s;
    return p(u, i) && (u = i, requestAnimationFrame(() => {
      e.callCompleteCallback();
    })), e.callUpdateCallback(), u;
  }
}
class st extends H {
  update({ animatorProp: e, current: t, target: i, dt: s }) {
    return i.map((n, r) => {
      const u = t[r], h = n.value === 0 ? u.unit : n.unit, d = (n.value - u.value) * this._config.speed, g = u.value + d * s;
      let _ = m(`${g}${h}`);
      return this._shouldFinish(n.value, u.value, d) && (_ = n, requestAnimationFrame(() => {
        e.callCompleteCallback();
      })), e.callUpdateCallback(), _;
    });
  }
  _shouldFinish(e, t, i) {
    return Math.abs(e - t) < I && Math.abs(i) < I;
  }
}
class K {
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
const G = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}, C = 0.01;
class Z {
  constructor(e) {
    o(this, "name", "spring");
    o(this, "_config");
    this._config = e;
  }
  get config() {
    return this._config;
  }
}
class nt extends Z {
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
    return l.sub(t, i).magnitude < C && this._velocity.magnitude < C;
  }
}
class rt extends Z {
  constructor() {
    super(...arguments);
    o(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
    const r = -(i - s) * this._config.stiffness;
    this._velocity += r, this._velocity *= this._config.damping;
    let u = i + this._velocity * n * this._config.speed;
    return p(u, s) && (u = s, requestAnimationFrame(() => {
      t.callCompleteCallback();
    })), u;
  }
}
class at extends Z {
  constructor() {
    super(...arguments);
    o(this, "_velocity", 0);
  }
  update({ animatorProp: t, current: i, target: s, dt: n }) {
    return s.map((r, u) => {
      const h = i[u], c = r.value === 0 ? h.unit : r.unit, d = -(h.value - r.value) * this._config.stiffness;
      this._velocity += d, this._velocity *= this._config.damping;
      const g = h.value + this._velocity * n * this._config.speed;
      let _ = m(`${g}${c}`);
      return this._shouldFinish(r.value, h.value) && (_ = r, requestAnimationFrame(() => {
        t.callCompleteCallback();
      })), _;
    });
  }
  _shouldFinish(t, i) {
    return Math.abs(t - i) < C && Math.abs(this._velocity) < C;
  }
}
function ot(a) {
  return a;
}
const J = {
  duration: 350,
  ease: ot
};
class Q {
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
class ut extends Q {
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
class lt extends Q {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : t.map((r, u) => {
      const h = i[u], c = h.value === 0 ? r.unit : h.unit, d = r.value + this._config.ease(n) * (i[u].value - r.value);
      return m(`${d}${c}`);
    });
  }
}
class ht extends Q {
  update({ animatorProp: e, initial: t, target: i, ts: s }) {
    this._startTime || (this._startTime = s);
    const n = Math.min(1, (s - this._startTime) / this._config.duration);
    return p(n, 1) ? (requestAnimationFrame(() => {
      e.callCompleteCallback();
    }), i) : t + (i - t) * this._config.ease(n);
  }
}
class ee {
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
class N extends ee {
  createInstantAnimator() {
    return new K();
  }
  createTweenAnimator(e) {
    return new ut({ ...J, ...e });
  }
  createDynamicAnimator(e) {
    return new tt({ ...j, ...e });
  }
  createSpringAnimator(e) {
    return new nt({ ...G, ...e });
  }
}
class ct extends ee {
  createInstantAnimator() {
    return new K();
  }
  createTweenAnimator(e) {
    return new lt({ ...J, ...e });
  }
  createDynamicAnimator(e) {
    return new st({
      ...j,
      ...e
    });
  }
  createSpringAnimator(e) {
    return new at({ ...G, ...e });
  }
}
class pe extends ee {
  createInstantAnimator() {
    return new K();
  }
  createDynamicAnimator(e) {
    return new it({ ...j, ...e });
  }
  createTweenAnimator(e) {
    return new ht({ ...J, ...e });
  }
  createSpringAnimator(e) {
    return new rt({ ...G, ...e });
  }
}
function R(a) {
  return structuredClone(a);
}
class dt {
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
class P {
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
    this._animatorProp = new dt(this), this._animatorFactory = e, this._initialValue = R(t), this._previousValue = R(t), this._targetValue = R(t), this._currentValue = R(t), this._hasChanged = !1, this._previousRenderValue = void 0, this._view = i, this._animator = this._animatorFactory.createInstantAnimator();
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
    this._previousValue = R(this._currentValue), this._targetValue = e, t ? ((s = (i = this._animator).reset) == null || s.call(i), this.animator.markAsAnimating()) : this._currentValue = e, this._hasChanged = !0;
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
class gt extends P {
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
      const c = U(t.trim());
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
    else if (ge(this._targetValue, this._currentValue)) {
      this._hasChanged = !ge(
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
    this._invertedBorderRadius = Xe(
      U(
        `${this._currentValue[0].valueWithUnit} ${this._currentValue[1].valueWithUnit} ${this._currentValue[2].valueWithUnit} ${this._currentValue[3].valueWithUnit}`
      ).value,
      {
        width: t,
        height: i
      }
    );
  }
  get shouldRender() {
    return this._hasChanged ? this._previousRenderValue ? !(_e(
      this.renderValue.v,
      this._previousRenderValue.v
    ) && _e(this.renderValue.h, this._previousRenderValue.h)) : !0 : !1;
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
class _t extends P {
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
class pt extends P {
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
class ft extends P {
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
          const E = this._rect.pageOffset.left - this._previousRect.pageOffset.left, T = this._rect.pageOffset.top - this._previousRect.pageOffset.top;
          this._setTarget(
            new l(this._currentValue.x - E, this._currentValue.y - T),
            !1
          );
          return;
        }
        const V = this._view._parent, ne = this._rect.pageOffset, re = this._view.getScroll(), x = {
          left: this._previousRect.viewportOffset.left + re.x,
          top: this._previousRect.viewportOffset.top + re.y
        }, Te = x.left - ne.left, Ae = x.top - ne.top;
        let ae = 0, oe = 0, ue = 0, le = 0;
        if (V) {
          const E = V.rect.pageOffset, T = V.getScroll(), A = {
            left: V.previousRect.viewportOffset.left + T.x,
            top: V.previousRect.viewportOffset.top + T.y
          };
          ae = A.left - E.left, oe = A.top - E.top;
          const he = x.top - A.top, ce = x.left - A.left, Ne = V.scale.y * he;
          ue = (he - Ne) / V.scale.y;
          const Ie = V.scale.x * ce;
          le = (ce - Ie) / V.scale.x;
        }
        this._setTarget(
          new l(Te - ae + le, Ae - oe + ue),
          !1
        ), s && (this._animateLayoutUpdateNextFrame = !0);
        return;
      }
      this._animateLayoutUpdateNextFrame = !0;
      const d = this._previousRect, g = this._rect, _ = this._view._parent;
      let w = 0, f = 0;
      _ && (w = _.previousRect.viewportOffset.left - _.rect.viewportOffset.left), _ && (f = _.previousRect.viewportOffset.top - _.rect.viewportOffset.top);
      let v = 1, y = 1;
      _ && (v = _.previousRect.size.width / _.rect.size.width, y = _.previousRect.size.height / _.rect.size.height);
      const M = _ ? _.previousRect.viewportOffset.left : 0, Pe = _ ? _.previousRect.viewportOffset.top : 0, ie = d.viewportOffset.left - M, se = d.viewportOffset.top - Pe, be = ie / v - ie, Re = se / y - se;
      let xe = d.viewportOffset.left - g.viewportOffset.left - w + be;
      const Ee = d.viewportOffset.top - g.viewportOffset.top - f + Re;
      this._setTarget(new l(xe, Ee), !1);
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
class mt extends P {
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
class vt extends P {
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
        const d = this._view.previousRect.size.width / this._view.rect.size.width, g = this._view.previousRect.size.height / this._view.rect.size.height;
        this._setTarget(
          new l(this._currentValue.x * d, this._currentValue.y * g),
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
class wt extends P {
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
class yt {
  constructor(e) {
    o(this, "_props", /* @__PURE__ */ new Map());
    this._props.set(
      "position",
      new ft(new N(), new l(0, 0), e)
    ), this._props.set(
      "scale",
      new vt(new N(), new l(1, 1), e)
    ), this._props.set(
      "rotation",
      new mt(new pe(), 0, e)
    ), this._props.set(
      "size",
      new wt(
        new N(),
        new l(e.rect.size.width, e.rect.size.height),
        e
      )
    ), this._props.set(
      "opacity",
      new _t(
        new pe(),
        e.elementReader.opacity.value,
        e
      )
    ), this._props.set(
      "borderRadius",
      new gt(
        new ct(),
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
      new pt(
        new N(),
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
class Vt {
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
    this.id = we(), this.name = t, this.element = e, this._elementReader = D(e), this._previousRect = this._elementReader.rect, this._viewProps = new yt(this), this._skipFirstRenderFrame = !0, this._layoutId = s, this._layoutTransition = !1, this._registry = i, this.element.dataset.velViewId = this.id, this._temporaryView = !1, this._inverseEffect = !1, this.styles = q(this.styles, () => {
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
    this.element = e, this._elementReader = D(this.element), this.element.dataset.velViewId = this.id;
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
    return this._elementReader.scroll;
  }
  intersects(e, t) {
    const i = {
      x: this.rect.viewportOffset.left,
      y: this.rect.viewportOffset.top
    };
    return e >= i.x && e <= i.x + this.size.width && t >= i.y && t <= i.y + this.size.height;
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
    this._elementReader = D(this.element);
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
    return Object.keys(this.styles).reduce((e, t) => t ? e + `${Se(t)}: ${this.styles[t]};` : e, "");
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
    const t = Array.from(this.element.children).filter((i) => {
      const s = i;
      return typeof s.dataset.velViewId < "u" && s.dataset.velView === e;
    }).map((i) => i.dataset.velViewId);
    return this._registry.getViewsById(t);
  }
  getChild(e) {
    return this.getChildren(e)[0];
  }
  getParent(e) {
    const t = this.element.parentElement;
    if (!t)
      return;
    const i = t.dataset.velViewId;
    if (i && t.dataset.velView === e)
      return this._registry.getViewById(i);
  }
}
class Pt {
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
      const n = this._getPluginNameForElement(s), r = this._pluginNameToPluginFactoryMap.get(n), u = this._pluginNameToPluginConfigMap.get(n), h = s.dataset.velPluginKey, c = $(
        r,
        this,
        this._eventBus,
        this._appEventBus,
        u,
        h
      );
      this._plugins.push(c);
      const d = s.dataset.velView, g = this._createNewView(s, d, c);
      g.isInverseEffectEnabled && g.setAnimatorsFromParent(), c.notifyAboutViewAdded(g);
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
  createPlugin(e, t, i = {}, s = !1) {
    if (!e.pluginName)
      throw Error(
        `Plugin ${e.name} must contain a pluginName field`
      );
    let n = [];
    if (e.scope) {
      const h = s ? `[data-vel-plugin=${e.pluginName}][data-vel-view=${e.scope}]:not([data-vel-plugin-id])` : `[data-vel-plugin=${e.pluginName}][data-vel-view=${e.scope}]`, c = document.querySelectorAll(h);
      this._pluginNameToPluginFactoryMap.has(e.pluginName) || this._pluginNameToPluginFactoryMap.set(
        e.pluginName,
        e
      ), this._pluginNameToPluginConfigMap.has(e.pluginName) || this._pluginNameToPluginConfigMap.set(e.pluginName, i), c ? n = Array.from(c) : n = [document.documentElement];
    } else
      n = [document.documentElement];
    const r = n.map((h) => {
      const c = h.dataset.velPluginKey, d = $(
        e,
        this,
        t,
        this._appEventBus,
        i,
        c
      );
      this._plugins.push(d);
      let g = [];
      h !== document.documentElement && g.push(h);
      const _ = h.querySelectorAll(
        `[data-vel-plugin=${d.pluginName}]`
      );
      g = [...g, ..._];
      const w = g.filter((f) => {
        if (!f.parentElement)
          return !0;
        const y = this._getPluginNameForElement(f.parentElement);
        return !(y && y.length > 0);
      });
      return w.length && w.forEach((f) => {
        const v = f.dataset.velView;
        if (!v)
          return;
        const y = this._createNewView(f, v, d);
        d.notifyAboutViewAdded(y);
      }), d;
    });
    if (r && r.length > 0)
      return r[0];
    const u = $(
      e,
      this,
      t,
      this._appEventBus,
      i
    );
    return e.scope || console.log(
      `%c WARNING: The plugin "${u.pluginName}" is created but there are no elements using it on the page`,
      "background: #885500"
    ), u;
  }
  updatePlugin(e, t, i = {}) {
    return this.createPlugin(e, t, i, !0);
  }
  getViews() {
    return this._views;
  }
  createView(e, t, i) {
    const s = new Vt(e, t, this, i);
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
class fe {
  constructor(e) {
    o(this, "pluginApi");
    this.pluginApi = e.pluginApi;
  }
}
class me {
  constructor(e) {
    o(this, "pluginApi");
    this.pluginApi = e.pluginApi;
  }
}
class te {
  constructor() {
    o(this, "previousTime", 0);
    o(this, "registry");
    o(this, "eventBus");
    o(this, "appEventBus");
    this.eventBus = new z(), this.appEventBus = new z(), this.registry = new Pt(this.appEventBus, this.eventBus), new Fe(this.eventBus);
  }
  static create() {
    return new te();
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
      this.eventBus.emitEvent(Y, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointermove", (e) => {
      this.eventBus.emitEvent(B, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointerdown", (e) => {
      this.eventBus.emitEvent(S, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      });
    }), document.addEventListener("pointerup", (e) => {
      this.eventBus.emitEvent(F, {
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
    this.eventBus.subscribeToEvent(O, this.onNodeAdded.bind(this)), this.eventBus.subscribeToEvent(
      k,
      this.onNodeRemoved.bind(this)
    ), this.eventBus.subscribeToEvent(
      ve,
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
function Bt() {
  return te.create();
}
class bt {
  constructor(e) {
    o(this, "view");
    o(this, "previousX");
    o(this, "previousY");
    o(this, "x");
    o(this, "y");
    o(this, "pointerX");
    o(this, "pointerY");
    o(this, "isDragging");
    o(this, "target");
    o(this, "directions", []);
    o(this, "width");
    o(this, "height");
    o(this, "distance");
    this.props = e, this.previousX = e.previousX, this.previousY = e.previousY, this.x = e.x, this.y = e.y, this.pointerX = e.pointerX, this.pointerY = e.pointerY, this.width = e.width, this.height = e.height, this.distance = e.distance, this.view = e.view, this.isDragging = e.isDragging, this.target = e.target, this.directions = e.directions;
  }
}
class Rt extends X {
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
    t.subscribeToEvent(S, ({ x: i, y: s, target: n }) => {
      this._initialPointer = new l(i, s), this.getViews().forEach((r) => {
        this._pointerDownPerView.set(r.id, r.intersects(i, s)), this._targetPerView.set(r.id, n);
        const u = new l(
          i - r.position.x,
          s - r.position.y
        );
        this._pointerX = i, this._pointerY = s, this._initialPointerPerView.set(r.id, u);
      });
    }), t.subscribeToEvent(F, () => {
      this.getViews().forEach((i) => {
        this._pointerDownPerView.get(i.id) && this._initialPointerPerView.get(i.id) && (this._pointerDownPerView.set(i.id, !1), this._emitEvent(i, []));
      });
    }), t.subscribeToEvent(B, ({ x: i, y: s }) => {
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
    const s = this._viewPointerPositionLog.get(t.id), n = s && s.length >= 2 ? s[s.length - 2] : null, r = this._pointerX - this._initialPointerPerView.get(t.id).x, u = this._pointerY - this._initialPointerPerView.get(t.id).y, h = this._pointerX, c = this._pointerY, d = n ? n.x - this._initialPointerPerView.get(t.id).x : r, g = n ? n.y - this._initialPointerPerView.get(t.id).y : u, _ = this._pointerY - this._initialPointer.y, w = this._pointerX - this._initialPointer.x, f = Ve(this._initialPointer, {
      x: this._pointerX,
      y: this._pointerY
    }), v = this._targetPerView.get(t.id);
    if (!v || !t.hasElement(v))
      return;
    const y = this._pointerDownPerView.get(t.id) === !0;
    y || this._viewPointerPositionLog.clear();
    const M = {
      view: t,
      target: v,
      previousX: d,
      previousY: g,
      x: r,
      y: u,
      pointerX: h,
      pointerY: c,
      distance: f,
      width: w,
      height: _,
      isDragging: y,
      directions: i
    };
    this.emit(bt, M);
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
o(Rt, "pluginName", "DragEventPlugin");
class xt {
  constructor(e) {
    o(this, "view");
    o(this, "direction");
    this.props = e, this.view = e.view, this.direction = e.direction;
  }
}
class Et extends X {
  constructor() {
    super(...arguments);
    o(this, "_viewIsPointerDownMap", /* @__PURE__ */ new Map());
    o(this, "_viewPointerPositionLog", /* @__PURE__ */ new Map());
    o(this, "_targetPerView", /* @__PURE__ */ new Map());
  }
  subscribeToEvents(t) {
    t.subscribeToEvent(S, ({ x: i, y: s, target: n }) => {
      this.getViews().forEach((r) => {
        this._targetPerView.set(r.id, n), r.intersects(i, s) && this._viewIsPointerDownMap.set(r.id, !0);
      });
    }), t.subscribeToEvent(B, ({ x: i, y: s }) => {
      this.getViews().forEach((n) => {
        if (!this._viewIsPointerDownMap.get(n.id))
          return;
        this._viewPointerPositionLog.has(n.id) || this._viewPointerPositionLog.set(n.id, []), this._viewPointerPositionLog.get(n.id).push(new l(i, s));
      });
    }), t.subscribeToEvent(F, ({ x: i, y: s }) => {
      this.getViews().forEach((r) => {
        if (!this._viewIsPointerDownMap.get(r.id) || !this._viewPointerPositionLog.has(r.id))
          return;
        const u = new l(i, s), h = this._viewPointerPositionLog.get(r.id), c = h[h.length - 2] || u.clone(), d = this._targetPerView.get(r.id), g = n(c, u);
        d && r.hasElement(d) && g.hasSwiped && this.emit(xt, {
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
        ], _ = Math.max(...g), w = g.indexOf(_), f = d[w], v = l.sub(u, r).magnitude;
        return {
          hasSwiped: c.dot(h[f]) * v > 30,
          direction: f
        };
      }
    });
  }
}
o(Et, "pluginName", "SwipeEventPlugin");
class Tt {
  constructor(e) {
    o(this, "view");
    this.props = e, this.view = e.view;
  }
}
class At extends X {
  subscribeToEvents(e) {
    e.subscribeToEvent(Y, ({ x: t, y: i, target: s }) => {
      this.getViews().forEach((n) => {
        const r = s, u = n.element === r || n.element.contains(r);
        n.intersects(t, i) && u && this.emit(Tt, {
          view: n
        });
      });
    });
  }
}
o(At, "pluginName", "ClickEventPlugin");
function Nt(a, e) {
  const t = a.map(e), i = Math.min(...t), s = t.indexOf(i);
  return a[s];
}
const St = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clamp: W,
  distanceBetweenTwoPoints: Ve,
  minBy: Nt,
  pointToViewProgress: qe,
  randomNumber: ze,
  remap: Ue,
  valueAtPercentage: We
}, Symbol.toStringTag, { value: "Module" })), Ft = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PointerClickEvent: Y,
  PointerDownEvent: S,
  PointerMoveEvent: B,
  PointerUpEvent: F
}, Symbol.toStringTag, { value: "Module" }));
export {
  Tt as ClickEvent,
  At as ClickEventPlugin,
  ve as DataChangedEvent,
  bt as DragEvent,
  Rt as DragEventPlugin,
  z as EventBus,
  X as EventPlugin,
  Ft as Events,
  De as Plugin,
  Oe as PluginContext,
  xt as SwipeEvent,
  Et as SwipeEventPlugin,
  St as Utils,
  Bt as createApp
};
