import {
  RequireIntrinsic,
  UncurryThisIntrinsic
} from '#intrinsic';
import {
  IsCallable,
  IsObject,
  ToIntegerOrInfinity
} from '#type';
import {
  GetInternalSlot,
  HasInternalSlot,
  RequireInternalSlot,
  SetInternalSlot
} from '#internal-slot';

const Error = RequireIntrinsic('Error');
const FunctionSymbolHasInstance = UncurryThisIntrinsic(
  'Function.prototype[@@hasInstance]'
);
const GlobalThis = RequireIntrinsic('globalThis');
const ObjectCreate = RequireIntrinsic('Object.create');
const Promise = RequireIntrinsic('Promise');
const ReflectDefineProperty = RequireIntrinsic('Reflect.defineProperty');
const Symbol = RequireIntrinsic('Symbol');
const SymbolHasInstance = RequireIntrinsic('@@hasInstance');
const SymbolToStringTag = RequireIntrinsic('@@toStringTag');
const TypeError = RequireIntrinsic('TypeError');

const ClearInterval = GlobalThis.clearInterval;
const ClearTimeout = GlobalThis.clearTimeout;
const SetInterval = GlobalThis.setInterval;
const SetTimeout = GlobalThis.setTimeout;

const $Active = Symbol('[[Active]]');
const $Callback = Symbol('[[Callback]]');
const $Delay = Symbol('[[Delay]]');
const $Recurrent = Symbol('[[Recurrent]]');
const $TimerID = Symbol('[[TimerID]]');

const RequireCallbackCallable = argument => {
  if (!IsCallable(argument)) {
    throw new TypeError('callback is not callable');
  }
}

const IsTimeout = argument => (
  IsObject(argument) && HasInternalSlot(argument, $TimerID)
);

const IsTimeoutError = argument => FunctionSymbolHasInstance(
  TimeoutError, argument
);

const TimeoutActive = timeout => RequireInternalSlot(timeout, $Active);

const TimeoutCancel = timeout => {
  const timerId = RequireInternalSlot(timeout, $TimerID);
  if (timerId === null) {
    return false;
  }
  const active = GetInternalSlot(timeout, $Active);
  if (active) {
    const recurrent = GetInternalSlot(timeout, $Recurrent);
    const clearTimer = recurrent ? ClearInterval : ClearTimeout;
    clearTimer(timerId);
    SetInternalSlot(timeout, $Active, false);
  }
  SetInternalSlot(timeout, $TimerID, null);
  return true;
}

const TimeoutCanceled = timeout => (
  RequireInternalSlot(timeout, $TimerID) === null
);

const TimeoutRecurrent = timeout => RequireInternalSlot(timeout, $Recurrent);

const TimeoutRefresh = timeout => {
  let timerId = RequireInternalSlot(timeout, $TimerID);
  if (timerId === null) {
    return false;
  }
  const recurrent = GetInternalSlot(timeout, $Recurrent);
  const active = GetInternalSlot(timeout, $Active);
  if (active) {
    const clearTimer = recurrent ? ClearInterval : ClearTimeout;
    clearTimer(timerId);
  }
  const setTimer = recurrent ? SetInterval : SetTimeout;
  const callback = GetInternalSlot(timeout, $Callback);
  const delay = GetInternalSlot(timeout, $Delay);
  timerId = setTimer(callback, delay);
  SetInternalSlot(timeout, $TimerID, timerId);
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
    const timerId = SetInterval(callback, delay);
    SetInternalSlot(timeout, $TimerID, timerId);
    SetInternalSlot(timeout, $Recurrent, true);
    SetInternalSlot(timeout, $Active, true);
    SetInternalSlot(timeout, $Callback, callback);
    SetInternalSlot(timeout, $Delay, delay);
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
    const timerCallback = () => {
      SetInternalSlot(this, $Active, false);
      callback();
    }
    const timerId = SetTimeout(timerCallback, delay);
    SetInternalSlot(this, $TimerID, timerId);
    SetInternalSlot(this, $Recurrent, false);
    SetInternalSlot(this, $Active, true);
    SetInternalSlot(this, $Callback, timerCallback);
    SetInternalSlot(this, $Delay, delay);
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

export {
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
