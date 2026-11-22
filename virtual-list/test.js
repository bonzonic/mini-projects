// Tests for Wed 28 Oct wk3 build: virtualized list (task #22)
// Spec: module.exports = { getVisibleRange, getVisibleRangeVariable? }
//
// MAIN: getVisibleRange({ scrollTop, viewportHeight, rowHeight, itemCount, overscan = 3 })
//   returns { start, end, offsetY, totalHeight }
//   - rows [start, end) are the ones to render (end is EXCLUSIVE)
//   - every row that is even partly visible is included, plus `overscan` extra rows above and below
//   - start >= 0, end <= itemCount
//   - offsetY = top position (px) of row `start`; totalHeight = height of the whole list in px
//   - scrollTop is clamped to [0, totalHeight - viewportHeight] (iOS overscroll gives negatives)
//
// STRETCH: getVisibleRangeVariable({ scrollTop, viewportHeight, rowHeights, overscan = 3 })
//   same return shape, but rows have different heights (rowHeights[i]).
//   Must not scan every row per scroll event: precompute offsets, then binary search.
//   Tests for it are skipped if you don't export it.
//
// Run: SOLUTION=/path/to/your/virtual-list.js node --test 2026-10-28-virtual-list.test.js
const { test } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");

const mod = require(path.resolve(process.env.SOLUTION || "./virtual-list.js"));
const { getVisibleRange, getVisibleRangeVariable } = mod;

const base = { viewportHeight: 400, rowHeight: 20, itemCount: 10000 };

test("top of list, no overscan: renders exactly the visible rows", () => {
  assert.deepStrictEqual(
    getVisibleRange({ ...base, scrollTop: 0, overscan: 0 }),
    { start: 0, end: 20, offsetY: 0, totalHeight: 200000 },
  );
});

test("middle of list: overscan added on both sides", () => {
  assert.deepStrictEqual(
    getVisibleRange({ ...base, scrollTop: 1000, overscan: 3 }),
    { start: 47, end: 73, offsetY: 940, totalHeight: 200000 },
  );
});

test("partly visible rows at top and bottom are included", () => {
  const r = getVisibleRange({ ...base, scrollTop: 1010, overscan: 0 });
  assert.strictEqual(r.start, 50);
  assert.strictEqual(r.end, 71);
  assert.strictEqual(r.offsetY, 1000);
});

test("overscan defaults to 3", () => {
  const r = getVisibleRange({ ...base, scrollTop: 1000 });
  assert.strictEqual(r.start, 47);
  assert.strictEqual(r.end, 73);
});

test("overscan never goes below row 0", () => {
  const r = getVisibleRange({ ...base, scrollTop: 20, overscan: 5 });
  assert.strictEqual(r.start, 0);
  assert.strictEqual(r.offsetY, 0);
});

test("bottom of list: end clamped to itemCount", () => {
  assert.deepStrictEqual(
    getVisibleRange({ ...base, scrollTop: 199600, overscan: 3 }),
    { start: 9977, end: 10000, offsetY: 199540, totalHeight: 200000 },
  );
});

test("negative scrollTop (overscroll bounce) acts like 0", () => {
  assert.deepStrictEqual(
    getVisibleRange({ ...base, scrollTop: -50, overscan: 0 }),
    getVisibleRange({ ...base, scrollTop: 0, overscan: 0 }),
  );
});

test("scrollTop past the end is clamped to the last page", () => {
  assert.deepStrictEqual(
    getVisibleRange({ ...base, scrollTop: 999999, overscan: 0 }),
    getVisibleRange({ ...base, scrollTop: 199600, overscan: 0 }),
  );
});

test("fewer rows than fit in the viewport", () => {
  assert.deepStrictEqual(
    getVisibleRange({ ...base, itemCount: 5, scrollTop: 0, overscan: 3 }),
    { start: 0, end: 5, offsetY: 0, totalHeight: 100 },
  );
});

test("empty list", () => {
  assert.deepStrictEqual(
    getVisibleRange({ ...base, itemCount: 0, scrollTop: 0, overscan: 3 }),
    { start: 0, end: 0, offsetY: 0, totalHeight: 0 },
  );
});

test("rendered row count stays small at every scroll position (the whole point)", () => {
  const overscan = 3;
  const max =
    Math.ceil(base.viewportHeight / base.rowHeight) + 1 + 2 * overscan;
  for (let s = 0; s <= 200000; s += 137) {
    const { start, end, offsetY } = getVisibleRange({
      ...base,
      scrollTop: s,
      overscan,
    });
    assert.ok(
      end - start <= max,
      `scrollTop ${s}: rendered ${end - start} rows (max ${max})`,
    );
    assert.ok(
      start >= 0 && end <= base.itemCount && start <= end,
      `scrollTop ${s}: bad range ${start}-${end}`,
    );
    assert.strictEqual(offsetY, start * base.rowHeight);
  }
});

// ---------- STRETCH: variable row heights ----------
const skip =
  typeof getVisibleRangeVariable !== "function" && "stretch not exported";
const heights = [10, 30, 20, 40, 10, 50, 20, 20]; // offsets: 0,10,40,60,100,110,160,180 ; total 200

test("variable: top of list", { skip }, () => {
  assert.deepStrictEqual(
    getVisibleRangeVariable({
      scrollTop: 0,
      viewportHeight: 50,
      rowHeights: heights,
      overscan: 0,
    }),
    { start: 0, end: 3, offsetY: 0, totalHeight: 200 },
  );
});

test("variable: scrollTop inside a tall row", { skip }, () => {
  // 120..170 covers row 5 (110-160) and row 6 (160-180)
  assert.deepStrictEqual(
    getVisibleRangeVariable({
      scrollTop: 120,
      viewportHeight: 50,
      rowHeights: heights,
      overscan: 0,
    }),
    { start: 5, end: 7, offsetY: 110, totalHeight: 200 },
  );
});

test("variable: scrollTop exactly on a row boundary", { skip }, () => {
  // 100..150 covers row 4 (100-110) and row 5 (110-160); row 3 ends at 100, not visible
  const r = getVisibleRangeVariable({
    scrollTop: 100,
    viewportHeight: 50,
    rowHeights: heights,
    overscan: 0,
  });
  assert.strictEqual(r.start, 4);
  assert.strictEqual(r.end, 6);
  assert.strictEqual(r.offsetY, 100);
});

// clamped to scrollTop 150: 150..200 covers rows 5-7; overscan 2 -> rows 3-7
test("variable: overscan + clamping at the end", { skip }, () => {
  assert.deepStrictEqual(
    getVisibleRangeVariable({
      scrollTop: 9999,
      viewportHeight: 50,
      rowHeights: heights,
      overscan: 2,
    }),
    { start: 3, end: 8, offsetY: 60, totalHeight: 200 },
  );
});

test(
  "variable: 100k rows stays fast (binary search, not a scan per call)",
  { skip },
  () => {
    const big = Array.from({ length: 100000 }, (_, i) => 20 + (i % 5) * 4);
    const t0 = process.hrtime.bigint();
    for (let s = 0; s < 2000; s++) {
      getVisibleRangeVariable({
        scrollTop: s * 1000,
        viewportHeight: 600,
        rowHeights: big,
        overscan: 3,
      });
    }
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    assert.ok(ms < 500, `2000 calls took ${ms.toFixed(0)} ms`);
  },
);
