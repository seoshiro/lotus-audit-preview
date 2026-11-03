import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp, smooth, petalAngle } from "../src/lotus-scene.ts";

test("Scene progress remains bounded through overscroll and exact endpoints", () => {
  for (const value of [-100, -1, 0, 0.2, 0.5, 1, 2, 100]) {
    const bounded = clamp(value);
    assert.ok(bounded >= 0 && bounded <= 1);
    assert.equal(clamp(bounded), bounded);
    assert.ok(smooth(value) >= 0 && smooth(value) <= 1);
  }
  assert.equal(smooth(-1), smooth(0));
  assert.equal(smooth(2), smooth(1));
  assert.equal(smooth(0), 0);
  assert.equal(smooth(1), 1);
});

test("All five rigid petals open monotonically without discontinuities or overshoot", () => {
  for (let petal = 0; petal < 5; petal++) {
    const closed = petalAngle(0, petal);
    const open = petalAngle(1, petal);
    assert.equal(closed, 0);
    assert.ok(open > closed && open < Math.PI / 2);
    let previous = closed;
    for (let step = 1; step <= 1000; step++) {
      const angle = petalAngle(step / 1000, petal);
      assert.ok(angle >= previous, "Forward scroll must not close a petal.");
      assert.ok(angle <= open, "A petal must not overshoot its open pose.");
      assert.ok(angle - previous < 0.02, "Small scroll steps must stay continuous.");
      previous = angle;
    }
    assert.equal(petalAngle(-1, petal), closed);
    assert.equal(petalAngle(2, petal), open);
  }
});

test("Staggered opening preserves one reversible pose for every scroll position", () => {
  const checkpoints = Array.from({ length: 101 }, (_, i) => i / 100);
  const forward = checkpoints.map((p) => Array.from({ length: 5 }, (_, i) => petalAngle(p, i)));
  const reverse = [...checkpoints].reverse()
    .map((p) => Array.from({ length: 5 }, (_, i) => petalAngle(p, i)))
    .reverse();
  assert.deepEqual(reverse, forward);
  assert.ok(forward.some((angles) => new Set(angles).size > 1), "The opening must be staggered.");
  for (const angles of forward) {
    for (let i = 1; i < angles.length; i++) {
      assert.ok(angles[i - 1] >= angles[i], "Later petals must not lead the opening.");
    }
  }
  assert.equal(new Set(forward.at(-1)).size, 1, "All petals reach a common open pose.");
});
