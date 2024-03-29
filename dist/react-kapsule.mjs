import { h } from 'preact';
import { useRef, useState, useEffect, useMemo, useCallback, useImperativeHandle, useLayoutEffect } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import { omit } from 'jerrypick';
import fromEntries from 'fromentries';

function _iterableToArrayLimit(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s,
      _e,
      _x,
      _r,
      _arr = [],
      _n = !0,
      _d = !1;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i) return;
        _n = !1;
      } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
    } catch (err) {
      _d = !0, _e = err;
    } finally {
      try {
        if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
}
function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function index (kapsuleComponent, comboParam) {
  var _ref = _typeof(comboParam) === 'object' ? comboParam : {
      // support old schema for backwards compatibility
      wrapperElementType: comboParam,
      methodNames: (arguments.length <= 2 ? undefined : arguments[2]) || undefined,
      initPropNames: (arguments.length <= 3 ? undefined : arguments[3]) || undefined
    },
    _ref$wrapperElementTy = _ref.wrapperElementType,
    wrapperElementType = _ref$wrapperElementTy === void 0 ? 'div' : _ref$wrapperElementTy,
    _ref$nodeMapper = _ref.nodeMapper,
    nodeMapper = _ref$nodeMapper === void 0 ? function (node) {
      return node;
    } : _ref$nodeMapper,
    _ref$methodNames = _ref.methodNames,
    methodNames = _ref$methodNames === void 0 ? [] : _ref$methodNames,
    _ref$initPropNames = _ref.initPropNames,
    initPropNames = _ref$initPropNames === void 0 ? [] : _ref$initPropNames;
  return forwardRef(function (props, ref) {
    var domEl = useRef();
    var _useState = useState({}),
      _useState2 = _slicedToArray(_useState, 2),
      prevProps = _useState2[0],
      setPrevProps = _useState2[1];
    useEffect(function () {
      return setPrevProps(props);
    }); // remember previous props

    // instantiate the inner kapsule component with the defined initPropNames
    var comp = useMemo(function () {
      var configOptions = fromEntries(initPropNames.filter(function (p) {
        return props.hasOwnProperty(p);
      }).map(function (prop) {
        return [prop, props[prop]];
      }));
      return kapsuleComponent(configOptions);
    }, []);
    useEffectOnce(function () {
      comp(nodeMapper(domEl.current)); // mount kapsule synchronously on this element ref, optionally mapped into an object that the kapsule understands
    }, useLayoutEffect);
    useEffectOnce(function () {
      // invoke destructor on unmount, if it exists
      return comp._destructor instanceof Function ? comp._destructor : undefined;
    });

    // Call a component method
    var _call = useCallback(function (method) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return comp[method] instanceof Function ? comp[method].apply(comp, args) : undefined;
    } // method not found
    , [comp]);

    // propagate component props that have changed
    var dynamicProps = omit(props, [].concat(_toConsumableArray(methodNames), _toConsumableArray(initPropNames))); // initPropNames or methodNames should not be called
    Object.keys(dynamicProps).filter(function (p) {
      return prevProps[p] !== props[p];
    }).forEach(function (p) {
      return _call(p, props[p]);
    });

    // bind external methods to parent ref
    useImperativeHandle(ref, function () {
      return fromEntries(methodNames.map(function (method) {
        return [method, function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          return _call.apply(void 0, [method].concat(args));
        }];
      }));
    });
    return h(wrapperElementType, {
      ref: domEl
    });
  });
}

//

// Handle R18 strict mode double mount at init
function useEffectOnce(effect) {
  var useEffectFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : useEffect;
  var destroyFunc = useRef();
  var effectCalled = useRef(false);
  var renderAfterCalled = useRef(false);
  var _useState3 = useState(0),
    _useState4 = _slicedToArray(_useState3, 2);
    _useState4[0];
    var setVal = _useState4[1];
  if (effectCalled.current) {
    renderAfterCalled.current = true;
  }
  useEffectFn(function () {
    // only execute the effect first time around
    if (!effectCalled.current) {
      destroyFunc.current = effect();
      effectCalled.current = true;
    }

    // this forces one render after the effect is run
    setVal(function (val) {
      return val + 1;
    });
    return function () {
      // if the comp didn't render since the useEffect was called,
      // we know it's the dummy React cycle
      if (!renderAfterCalled.current) return;
      if (destroyFunc.current) destroyFunc.current();
    };
  }, []);
}

export { index as default };
