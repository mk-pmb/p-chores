import test from 'p-tape';
import Promise from 'bluebird';

import pChores from '../cor'; // !#aka


test('No strategies = unsolved', async (t) => {
  t.plan(1);
  const unsolved = '???';
  const noStrats = [
    [],
    null,
    false,
    true,
    function hi() { return 'Hello.'; },
  ];
  const expectation = [];

  function tryAnyways(how) {
    expectation.push(unsolved);
    return pChores(how, { unsolved })();
  }
  const results = await Promise.all(noStrats.map(tryAnyways));

  t.deepEqual(results, expectation);
});


test('Catch accidential async decider', async (t) => {
  t.plan(1);
  function selfTest(x) { return x.check(); }
  const strategies = [
    { check() { return false; } },
    { async check() { return true; } },
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
