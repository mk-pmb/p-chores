import test from 'p-tape';
import Promise from 'bluebird';

import pChores from '../cor'; // !#aka

function noop() {}
function isOddInt(x) { return (Number.isFinite(x) && ((x % 2) === 1)); }

async function asyncMultiplyAdd(x) {
  const { mul, add, log } = (this || false);
  const y = (x * mul) + add;
  if (log) { log.push(`${x} * ${mul} + ${add} = ${y}`); }
  return y;
}


test('Run strategies in sequence', async (t) => {
  t.plan(2);
  const log = [];
  const somePromise = Promise.delay(100).then(noop);

  const strategies = [
    async function slowAndUseless(a, b, c) {
      await Promise.delay(50);
      log.push(['slowAndUseless', this, a, b, c]);
    },
    function quickButUseless(a, b, c) {
      log.push(['quickButUseless', this, a, b, c]);
      return null;
    },
    somePromise,
    null,
    'solved!',
    function shouldNotRun() {
      log.push("If this is logged, it's broken.");
    },
    { another: 'solution', but: "it's not used" },
  ];
  const cor = pChores(strategies);

  const ctx = { dummyObject: 123 };
  const arg1 = 'hello';
  const arg2 = 'world';
  const result = await cor.call(ctx, arg1, arg2);
  t.deepEqual(log, [
    ['slowAndUseless', ctx, arg1, arg2, undefined],
    ['quickButUseless', ctx, arg1, arg2, undefined],
  ]);
  t.equal(result, 'solved!');
});


test('Support custom accept function', async (t) => {
  t.plan(2);
  const log = [];

  const strategies = [
    asyncMultiplyAdd.bind({ mul: 0, add: 4, log }),
    false,
    true,
    function greet(name) { log.push(`Hello ${name}.`); },
    { not: 'acceptable' },
    asyncMultiplyAdd.bind({ mul: 1, add: 3, log }),
    asyncMultiplyAdd.bind({ mul: 2, add: 11, log }),
    asyncMultiplyAdd.bind({ mul: 3, add: -5, log }),
  ];
  const cor = pChores(strategies, { accept: isOddInt });
  const result = await cor(7);
  t.deepEqual(log, [
    '7 * 0 + 4 = 4',
    'Hello 7.',
    '7 * 1 + 3 = 10',
    '7 * 2 + 11 = 25',
  ]);
  t.equal(result, 25);
});


test('Support custom unsolved value', async (t) => {
  t.plan(1);
  const strategies = [12, 34, 56];
  const cor = pChores(strategies, {
    accept() { return false; },
    unsolved: '???',
  });
  const result = await cor(7);
  t.equal(result, '???');
});


test('Catch accidential async decider', async (t) => {
  t.plan(1);
  function selfTest(x) { return x.check(); }
  const strategies = [
    { check() { return false; } },
    { async check() { return Promise.resolve(true); } },
    { check() { return true; } },
  ];
  try {
    await pChores(strategies, { accept: selfTest })();
    t.fail('then-able not detected');
  } catch (err) {
    t.equal(err.name, 'p-chores:accepted.then');
  }
});

















/* scroll */
