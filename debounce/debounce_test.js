// Tests for Wed 7 Oct JS utility: debounce
// Spec: module.exports = function debounce(fn, wait, { leading = false, trailing = true } = {})
//   returns a debounced function with .cancel() and .flush()
//   - forwards `this` and the LATEST args to fn
//   - debounced call returns the last result of fn (undefined before first call)
//   - .flush() runs a pending trailing call immediately and returns its result
//   - .cancel() drops any pending call
// Run: node --test 2026-10-07-debounce.test.js   (with SOLUTION=/path/to/your/debounce.js)
const { test, mock } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");

const debounce = require(path.resolve(process.env.SOLUTION || "./debounce.js"));

function setup() {
  mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const calls = [];
  const fn = function (...args) {
    calls.push({ ctx: this, args });
    return args[0];
  };
  return { calls, fn };
}
function teardown() {
  mock.timers.reset();
}

test("trailing: fires once after wait", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 100);
  d(1);
  d(2);
  d(3);
  assert.strictEqual(calls.length, 0);
  mock.timers.tick(99);
  assert.strictEqual(calls.length, 0);
  mock.timers.tick(1);
  assert.strictEqual(calls.length, 1);
  teardown();
});

test("timer resets on each call", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 100);
  d(1);
  mock.timers.tick(60);
  d(2);
  mock.timers.tick(60);
  assert.strictEqual(calls.length, 0);
  mock.timers.tick(40);
  assert.strictEqual(calls.length, 1);
  teardown();
});

test("uses latest args and this", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 50);
  const obj = { d };
  obj.d("a", 1);
  obj.d("b", 2);
  mock.timers.tick(50);
  assert.deepStrictEqual(calls[0].args, ["b", 2]);
  assert.strictEqual(calls[0].ctx, obj);
  teardown();
});

test("separate bursts fire separately", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 50);
  d(1);
  mock.timers.tick(50);
  d(2);
  mock.timers.tick(50);
  assert.deepStrictEqual(
    calls.map((c) => c.args[0]),
    [1, 2],
  );
  teardown();
});

test("leading: true fires immediately, then trailing only if called again", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 100, { leading: true });
  d(1);
  assert.strictEqual(calls.length, 1);
  mock.timers.tick(100);
  assert.strictEqual(
    calls.length,
    1,
    "single call should not also fire trailing",
  );
  d(2);
  d(3);
  assert.strictEqual(calls.length, 2);
  mock.timers.tick(100);
  assert.deepStrictEqual(
    calls.map((c) => c.args[0]),
    [1, 2, 3],
  );
  teardown();
});

test("leading: true, trailing: false", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 100, { leading: true, trailing: false });
  d(1);
  d(2);
  d(3);
  mock.timers.tick(100);
  assert.deepStrictEqual(
    calls.map((c) => c.args[0]),
    [1],
  );
  d(4);
  assert.deepStrictEqual(
    calls.map((c) => c.args[0]),
    [1, 4],
  );
  teardown();
});

test("cancel drops pending call", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 100);
  d(1);
  d.cancel();
  mock.timers.tick(200);
  assert.strictEqual(calls.length, 0);
  d(2);
  mock.timers.tick(100);
  assert.deepStrictEqual(
    calls.map((c) => c.args[0]),
    [2],
  );
  teardown();
});

test("flush runs pending call now and returns result", () => {
  const { calls, fn } = setup();
  const d = debounce(fn, 100);
  d(7);
  assert.strictEqual(d.flush(), 7);
  assert.strictEqual(calls.length, 1);
  mock.timers.tick(200);
  assert.strictEqual(calls.length, 1, "flush must clear the timer");
  teardown();
});

test("debounced call returns last result", () => {
  const { fn } = setup();
  const d = debounce(fn, 100);
  assert.strictEqual(d(1), undefined);
  mock.timers.tick(100);
  assert.strictEqual(d(2), 1);
  teardown();
});
