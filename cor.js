/*jslint indent: 2, maxlen: 80, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';
/*global Promise: true */

module.exports = (function () {
  var arSlc = Array.prototype.slice, okPr = Promise.resolve();
  function ifFun(x, d) { return ((typeof x) === 'function' ? x : d); }
  function notEmpty(x) { return ((x !== undefined) && (x !== null)); }
  function numOr0(x) { return ((+x === x) ? x : 0); }
  function fail(msg, props) { throw Object.assign(new Error(msg), props); }

  function tryNx(opt, strats, stIdx, ctx, args) {
    if (stIdx >= numOr0(strats.length)) { return opt.unsolved; }
    function maybeSolve() {
      var nxSt = strats[stIdx];
      return (ifFun(nxSt) ? nxSt.apply(ctx, args) : nxSt);
      // In case nxSt is a Promise, we can just return it like any value.
      // The okPr.then that invoked maybeSolve will deal with it.
    }
    function verify(result) {
      var accepted = (opt.accept || notEmpty)(result);
      if (!accepted) { return tryNx(opt, strats, stIdx + 1, ctx, args); }
      if (accepted.then) {
        fail('Decider result must not be then-able',
          { name: 'p-chores:accepted.then' });
      }
      return result;
    }
    return okPr.then(maybeSolve).then(verify);
  }

  return function promiseChainOfResponsibility(strategies, opt) {
    if (!strategies) {
      opt = Promise.resolve(opt.unsolved);
      return function () { return opt; };
    }
    opt = (opt || false);
    return function () {
      return tryNx(opt, strategies, 0, this, arSlc.call(arguments));
    };
  };
}());
