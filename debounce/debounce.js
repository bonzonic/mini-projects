// debounce.js
module.exports = function debounce(
  fn,
  wait,
  { leading = false, trailing = true } = {},
) {
  let timer = null; // id of the pending setTimeout
  let lastArgs = null; // args from the most recent call
  let lastThis = null; // `this` from the most recent call
  let result; // last value fn returned

  function invoke() {
    // TODO: call fn with lastThis + lastArgs (hint: fn.apply)
    //       store its return value in `result`
    //       set lastArgs and lastThis back to null
    //       return result
    result = fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
    return result;
  }

  function onTimer() {
    // TODO: the wait is over, so set timer = null
    //       if trailing AND lastArgs isn't null, call invoke()
    timer = null;
    if (trailing && lastArgs !== null) { 
      invoke();
    }
  }

  function debounced(...args) {
    // TODO 1: save args and `this` into lastArgs / lastThis
    lastArgs = args;
    lastThis = this;

    // TODO 2: const isFirstCall = (timer === null)
    const isFirstCall = (timer === null)
    
    // TODO 3: restart the timer: clearTimeout(timer); timer = setTimeout(onTimer, wait)
    clearTimeout(timer);
    timer = setTimeout(onTimer, wait);
    
    // TODO 4: if leading && isFirstCall, call invoke() now
    if (leading && isFirstCall) invoke();

    return result;
  }

  debounced.cancel = function () {
    // TODO: clear the timer, set timer = null, drop lastArgs and lastThis
    timer = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    // TODO: if a timer is pending: clear it, set timer = null,
    //       and call invoke() if lastArgs isn't null
    //       always return result
    if (timer !== null) { 
      timer = null;
    }

    if (lastArgs !== null) { 
      invoke();
    }

    return result;
  };

  return debounced;
};
