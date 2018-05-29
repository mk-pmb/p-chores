
<!--#echo json="package.json" key="name" underline="=" -->
p-chores
========
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
String together your potentially promise-returning functions into a chain of
responsibility. (The fallback pattern trying all strategies one after the
other until one of them solves the task.)
<!--/#echo -->

I rolled my own because I was too impatient waiting for
[promisefallback](https://github.com/softonic/promisefallback/)
to merge my pull requests.


Usage
-----

see [test/usage.mjs](test/usage.mjs)


API
---

This module exports one function:

### promiseChainOfResponsibility([strategies[, opt]])

Returns a function. Let's call that one `cor`.

`opt` is an optional options object which supports these keys:
  * `accept`: A function that synchronously decides whether its first
    argument is a valid solution. Its return values is considered boolean.
    Defaults to the internal `nonEmpty` function which accepts anything
    except `null`  and `undefined`.
  * `unsolved`: Which value to use as the (non-)solution when none of the
    strategies gave an `accept`able solution.
    The value for `unsolved` won't be checked for its `accept`ability.

When you run `cor`, it returns a promise for the solution.
The solution is determined by `strategies`, which should be array-like.
Each strategy can be a function, a Promise, or any other value.
Strategies are probed one after the other until one succeeds,
i.e. yields an acceptable result,
determined by these steps (conceptually):

1. Let `pot` (potential solution) be the strategy itself.
    * If there is no strategy left, solve with `opt.unsolved`.
1. If your now current `pot` is a function,
    invoke it with the same context and arguments as `cor` was invoked,
    and use its result as your new `pot`.
1. If your now current `pot` is a then-able,
    defer until it's resolved,
    then use the resolution value as your new `pot`.
1. Call `opt.accept` with your current `pot` as the first argument.
    * In case of a `true`-y result, solve with `pot`.
    * Otherwise, try the next strategy.







<!--#toc stop="scan" -->



Known issues
------------

* Needs more/better tests and docs.




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
