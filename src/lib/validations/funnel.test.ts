import { moveCardSchema } from "./funnel";

describe("moveCardSchema", () => {
  it("accepts a valid stage without a sort order", () => {
    expect(moveCardSchema.safeParse({ stage: "FOLLOW_UP" }).success).toBe(true);
  });

  it("coerces a string sort_order to a number", () => {
    const result = moveCardSchema.safeParse({
      stage: "LEAD",
      sort_order: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort_order).toBe(2);
    }
  });

  it("rejects an unknown stage", () => {
    expect(moveCardSchema.safeParse({ stage: "WON" }).success).toBe(false);
  });

  it("rejects a negative sort_order", () => {
    expect(
      moveCardSchema.safeParse({ stage: "LEAD", sort_order: "-1" }).success,
    ).toBe(false);
  });
});
