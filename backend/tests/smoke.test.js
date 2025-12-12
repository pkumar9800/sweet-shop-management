import { describe, it, expect } from "@jest/globals";

describe("Jest ES6 smoke test", () => {
  it("should add numbers correctly", () => {
    expect(1 + 1).toBe(2);
  });
});