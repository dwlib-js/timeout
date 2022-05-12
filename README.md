# Timeout API

## Abstract
The module for implementing synchronous and asynchronous timeout based on
built-in timers and promises.

## Install
`npm i --save @dwlib/timeout`

## Usage
```javascript
// CJS
const Timeout = require('@dwlib/timeout');
const IsTimeout = require('@dwlib/timeout/IsTimeout');
const IsTimeoutError = require('@dwlib/timeout/IsTimeoutError');
const TimeoutAbort = require('@dwlib/timeout/TimeoutAbort');
const TimeoutActive = require('@dwlib/timeout/TimeoutActive');
const TimeoutCancel = require('@dwlib/timeout/TimeoutCancel');
const TimeoutCanceled = require('@dwlib/timeout/TimeoutCanceled');
const TimeoutError = require('@dwlib/timeout/TimeoutError');
const TimeoutInterval = require('@dwlib/timeout/TimeoutInterval');
const TimeoutRecurrent = require('@dwlib/timeout/TimeoutRecurrent');
const TimeoutRefresh = require('@dwlib/timeout/TimeoutRefresh');
const TimeoutWait = require('@dwlib/timeout/TimeoutWait');
// ESM
import Timeout, {
  IsTimeout,
  IsTimeoutError,
  TimeoutAbort,
  TimeoutActive,
  TimeoutCancel,
  TimeoutCanceled,
  TimeoutError,
  TimeoutInterval,
  TimeoutRecurrent,
  TimeoutRefresh,
  TimeoutWait
} from '@dwlib/timeout';
import IsTimeout from '@dwlib/timeout/IsTimeout';
import IsTimeoutError from '@dwlib/timeout/IsTimeoutError';
import TimeoutAbort from '@dwlib/timeout/TimeoutAbort';
import TimeoutActive from '@dwlib/timeout/TimeoutActive';
import TimeoutCancel from '@dwlib/timeout/TimeoutCancel';
import TimeoutCanceled from '@dwlib/timeout/TimeoutCanceled';
import TimeoutError from '@dwlib/timeout/TimeoutError';
import TimeoutInterval from '@dwlib/timeout/TimeoutInterval';
import TimeoutRecurrent from '@dwlib/timeout/TimeoutRecurrent';
import TimeoutRefresh from '@dwlib/timeout/TimeoutRefresh';
import TimeoutWait from '@dwlib/timeout/TimeoutWait';
```

## API
- *class* Timeout
  - *static* Error
  - *static* abort(delay)
  - *static* interval(callback, delay)
  - *static* wait(delay)
  - constructor(callback, delay)
  - *get* active
  - *get* canceled
  - *get* recurrent
  - cancel()
  - refresh()
- *class* TimeoutError
  - constructor([message])

### Builtins
- IsTimeout(argument)
- IsTimeoutError(argument)
- TimeoutAbort(delay)
- TimeoutActive(timeout)
- TimeoutCancel(timeout)
- TimeoutCanceled(timeout)
- new TimeoutError([message])
- TimeoutInterval(callback, delay)
- TimeoutRecurrent(timeout)
- TimeoutRefresh(timeout)
- TimeoutWait(delay)
