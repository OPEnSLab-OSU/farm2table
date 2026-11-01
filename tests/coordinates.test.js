const test = require("node:test");
const assert = require("node:assert/strict");

const { isValidCoordinate } = require("../src/coordinates");

test("accepts valid coordinates", () => {
  assert.equal(isValidCoordinate(44.56, -123.28), true);
});

test("rejects invalid latitude", () => {
  assert.equal(isValidCoordinate(100, -123.28), false);
});

test("rejects invalid longitude", () => {
  assert.equal(isValidCoordinate(44.56, -200), false);
});

test("rejects invalid coordinate types", () => {
  assert.equal(isValidCoordinate("44.56", -123.28), false);
});
