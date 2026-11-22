/**
 * Computes which rows of a fixed-height virtualized list should be rendered.
 * Includes every row that is even partly visible, plus `overscan` extra rows above and below.
 * scrollTop is clamped to [0, totalHeight - viewportHeight] to handle iOS overscroll.
 *
 * @param {Object} params
 * @param {number} params.scrollTop - Current scroll position of the container, in px.
 * @param {number} params.viewportHeight - Visible height of the container, in px.
 * @param {number} params.rowHeight - Height of every row, in px.
 * @param {number} params.itemCount - Total number of rows in the list.
 * @param {number} [params.overscan=3] - Extra rows to render above and below the visible area.
 * @returns {{ start: number, end: number, offsetY: number, totalHeight: number }}
 *   start: first row to render; end: last row to render (exclusive);
 *   offsetY: top position of row `start` in px; totalHeight: height of the whole list in px.
 */
export function getVisibleRange({
  scrollTop,
  viewportHeight,
  rowHeight,
  itemCount,
  overscan = 3,
}) {
  const result = { start: 0, end: 0, offsetY: 0, totalHeight: 0 };
  result.totalHeight = itemCount * rowHeight;
  const maxScroll = Math.max(0, result.totalHeight - viewportHeight);
  scrollTop = Math.min(Math.max(scrollTop, 0), maxScroll);

  // calculate the height
  const start = Math.floor(scrollTop / rowHeight) - overscan;
  result.start = start <= 0 ? 0 : start;

  const end = Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan;
  result.end = end >= itemCount ? itemCount : end;

  const offset = result.start;
  result.offsetY = offset <= 0 ? 0 : offset * rowHeight;

  return result;
}

// returns { start, end, offsetY, totalHeight }
// - rows [start, end) are the ones to render (end is EXCLUSIVE)
// - every row that is even partly visible is included, plus `overscan` extra rows above and below
// - start >= 0, end <= itemCount
// - offsetY = top position (px) of row `start`; totalHeight = height of the whole list in px
// - scrollTop is clamped to [0, totalHeight - viewportHeight] (iOS overscroll gives negatives)
