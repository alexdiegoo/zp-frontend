import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false && "b", "c", undefined, null)).toBe("a c");
  });

  it("de-conflicts Tailwind classes so the later class wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("merges conditional object syntax", () => {
    expect(cn("text-sm", { "font-bold": true, italic: false })).toBe(
      "text-sm font-bold",
    );
  });
});
