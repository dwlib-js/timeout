'use strict';

const RequireIntrinsic = require('#intrinsic/RequireIntrinsic');
const UncurryThisIntrinsic = require('#intrinsic/UncurryThisIntrinsic');
const IsCallable = require('#type/IsCallable');
const IsObject = require('#type/IsObject');
const ToIntegerOrInfinity = require('#type/ToIntegerOrInfinity');
const GetInternalSlot = require('#internal-slot/GetInternalSlot');
const HasInternalSlot = require('#internal-slot/HasInternalSlot');
const RequireInternalSlot = require('#internal-slot/RequireInternalSlot');
const SetInternalSlot = require('#internal-slot/SetInternalSlot');

const Error = RequireIntrinsic('Error');
const FunctionSymbolHasInstance = UncurryThisIntrinsic(
  'Function.prototype[@@hasInstance]'
);
const GlobalThis = RequireIntrinsic('globalThis');
const ObjectCreate = RequireIntrinsic('Object.create');
const Promise = RequireIntrinsic('Promise');
const ReflectDefineProperty = RequireIntrinsic('Reflect.defineProperty');
const ReflectGetPrototypeOf = RequireIntrinsic('Reflect.getPrototypeOf');
const Symbol = RequireIntrinsic('Symbol');
const SymbolHasInstance = RequireIntrinsic('@@hasInstance');
const SymbolToStringTag = RequireIntrinsic('@@toStringTag');
const TypeError = RequireIntrinsic('TypeError');
const UncurryThis = RequireIntrinsic('uncurryThis');

const ClearInterval = GlobalThis.clearInterval;
const ClearTimeout = GlobalThis.clearTimeout;
const SetInterval = GlobalThis.setInterval;
const SetTimeout = GlobalThis.setTimeout;

const NodeTimerPrototype = (() => {
  const timer = SetTimeout(() => {}, 0);
  return ReflectGetPrototypeOf(timer);
})();
const NodeTimerPrototypeRefresh = NodeTimerPrototype.refresh;

const NodeTimerRefresh = UncurryThis(NodeTimerPrototypeRefresh);

const $Active = Symbol('[[Active]]');
const $NodeTimer = Symbol('[[NodeTimer]]');
const $Recurrent = Symbol('[[Recurrent]]');

const RequireCallbackCallable = argument => {
  if (!IsCallable(argument)) {
    throw new TypeError('callback is not callable');
  }
}

const IsTimeout = argument => (
  IsObject(argument) && HasInternalSlot(argument, $NodeTimer)
);

const IsTimeoutError = argument => FunctionSymbolHasInstance(
  TimeoutError, argument
);

const TimeoutActive = timeout => RequireInternalSlot(timeout, $Active);

const TimeoutCancel = timeout => {
  const timer = RequireInternalSlot(timeout, $NodeTimer);
  if (!timer) {
    return false;
  }
  const recurrent = GetInternalSlot(timeout, $Recurrent);
  const clearTimer = recurrent ? ClearInterval : ClearTimeout;
  clearTimer(timer);
  SetInternalSlot(timeout, $NodeTimer, null);
  SetInternalSlot(timeout, $Active, false);
  return true;
}

const TimeoutCanceled = timeout => (
  RequireInternalSlot(timeout, $NodeTimer) === null
);

const TimeoutRecurrent = timeout => RequireInternalSlot(timeout, $Recurrent);

const TimeoutRefresh = timeout => {
  const timer = RequireInternalSlot(timeout, $NodeTimer);
  if (!timer) {
    return false;
  }
  NodeTimerRefresh(timer);
  SetInternalSlot(timeout, $Active, true);
  return true;
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
  }
}
ReflectDefineProperty(TimeoutError, SymbolHasInstance, {
  value: IsTimeoutError
});

const TimeoutErrorPrototype = TimeoutError.prototype;
ReflectDefineProperty(TimeoutErrorPrototype, 'name', {
  value: 'TimeoutError'
});
ReflectDefineProperty(TimeoutErrorPrototype, SymbolToStringTag, {
  value: 'TimeoutError'
});

class Timeout {
  static abort(delay) {
    delay = ToIntegerOrInfinity(delay);
    return new Promise((resolve, reject) => {
      SetTimeout(() => {
        const timeoutError = new TimeoutError();
        reject(timeoutError);
      }, delay);
    });
  }

  static interval(callback, delay) {
    RequireCallbackCallable(callback);
    delay = ToIntegerOrInfinity(delay);
    const timeout = ObjectCreate(TimeoutPrototype);
    const timer = SetInterval(callback, delay);
    SetInternalSlot(timeout, $NodeTimer, timer);
    SetInternalSlot(timeout, $Recurrent, true);
    SetInternalSlot(timeout, $Active, true);
    return timeout;
  }

  static wait(delay) {
    delay = ToIntegerOrInfinity(delay);
    return new Promise(resolve => {
      SetTimeout(resolve, delay);
    });
  }

  constructor(callback, delay) {
    RequireCallbackCallable(callback);
    delay = ToIntegerOrInfinity(delay);
    const timer = SetTimeout(() => {
      SetInternalSlot(this, $Active, false);
      callback();
    }, delay);
    SetInternalSlot(this, $NodeTimer, timer);
    SetInternalSlot(this, $Recurrent, false);
    SetInternalSlot(this, $Active, true);
  }

  get active() {
    return TimeoutActive(this);
  }

  get canceled() {
    return TimeoutCanceled(this);
  }

  get recurrent() {
    return TimeoutRecurrent(this);
  }

  cancel() {
    return TimeoutCancel(this);
  }

  refresh() {
    return TimeoutRefresh(this);
  }
}
ReflectDefineProperty(Timeout, 'Error', {
  value: TimeoutError
});
ReflectDefineProperty(Timeout, SymbolHasInstance, {
  value: IsTimeout
});

const TimeoutAbort = Timeout.abort;
const TimeoutInterval = Timeout.interval;
const TimeoutWait = Timeout.wait;
const TimeoutPrototype = Timeout.prototype;
ReflectDefineProperty(TimeoutPrototype, SymbolToStringTag, {
  value: 'Timeout'
});

module.exports = {
  IsTimeout,
  IsTimeoutError,
  Timeout,
  TimeoutAbort,
  TimeoutActive,
  TimeoutCancel,
  TimeoutCanceled,
  TimeoutError,
  TimeoutInterval,
  TimeoutRecurrent,
  TimeoutRefresh,
  TimeoutWait
};
