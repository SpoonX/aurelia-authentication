let slice = [].slice;

function setHashKey(obj, h) {
  if (h) {
    obj.$$hashKey = h;
  } else {
    delete obj.$$hashKey;
  }
}

function baseExtend(dst, objs, deep) {
  let h = dst.$$hashKey;

  for (let i = 0, ii = objs.length; i < ii; ++i) {
    let obj = objs[i];
    if (!authUtils.isObject(obj) && !authUtils.isFunction(obj)) {
      continue;
    }
    let keys = Object.keys(obj);
    for (let j = 0, jj = keys.length; j < jj; j++) {
      let key = keys[j];
      let src = obj[key];

      if (deep && authUtils.isObject(src)) {
        if (!authUtils.isObject(dst[key])) {
          dst[key] = authUtils.isArray(src) ? [] : {};
        }
        baseExtend(dst[key], [src], true);
      } else {
        dst[key] = src;
      }
    }
  }

  setHashKey(dst, h);
  return dst;
}

let authUtils = {
  isDefined: function (value) {
    return typeof value !== 'undefined';
  },

  camelCase: function (name) {
    return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    });
  },

  parseQueryString: function (keyValue) {
    let obj = {};
    let key;
    let value;

    authUtils.forEach((keyValue || '').split('&'), function (keyValuePair) {
      if (keyValuePair) {
        value = keyValuePair.split('=');
        key = decodeURIComponent(value[0]);
        obj[key] = authUtils.isDefined(value[1]) ? decodeURIComponent(value[1]) : true;
      }
    });
    return obj;
  },

  isString: function (value) {
    return typeof value === 'string';
  },

  isObject: function (value) {
    return value !== null && typeof value === 'object';
  },
  isArray: Array.isArray,

  isFunction: function (value) {
    return typeof value === 'function';
  },

  joinUrl: function (baseUrl, url) {
    if (/^(?:[a-z]+:)?\/\//i.test(url)) {
      return url;
    }

    let joined = [baseUrl, url].join('/');

    let normalize = function (str) {
      return str.replace(/[\/]+/g, '/').replace(/\/\?/g, '?').replace(/\/\#/g, '#').replace(/\:\//g, '://');
    };

    return normalize(joined);
  },
  isBlankObject: function (value) {
    return value !== null && typeof value === 'object' && !Object.getPrototypeOf(value);
  },
  isArrayLike: function (obj) {
    if (obj === null || authUtils.isWindow(obj)) {
      return false;
    }
  },
  isWindow: function (obj) {
    return obj && obj.window === obj;
  },
  extend: function (dst) {
    return baseExtend(dst, slice.call(arguments, 1), false);
  },
  merge: function merge(dst) {
    return baseExtend(dst, slice.call(arguments, 1), true);
  },
  forEach: function (obj, iterator, context) {
    let key;
    let length;

    if (!obj) {
      return obj;
    }

    if (authUtils.isFunction(obj)) {
      for (key in obj) {
        if (key !== 'prototype' && key !== 'length' && key !== 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (authUtils.isArray(obj) || authUtils.isArrayLike(obj)) {
      let isPrimitive = typeof obj !== 'object';
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context, obj);
    } else if (authUtils.isBlankObject(obj)) {
      for (key in obj) {
        iterator.call(context, obj[key], key, obj);
      }
    } else if (typeof obj.hasOwnProperty === 'function') {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else {
      for (key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }

};

export { authUtils };