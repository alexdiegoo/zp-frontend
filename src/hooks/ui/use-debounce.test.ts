import { act, renderHook } from "@testing-library/react";

import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("a", 350));
    expect(result.current).toBe("a");
  });

  it("updates only after the full delay elapses", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 350), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    expect(result.current).toBe("a"); // not yet

    act(() => jest.advanceTimersByTime(349));
    expect(result.current).toBe("a"); // one tick short

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe("b"); // exactly at the delay
  });

  it("resets the timer on rapid successive changes (only the latest lands)", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 350), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    act(() => jest.advanceTimersByTime(200));
    rerender({ v: "c" }); // resets the 350ms window
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe("a"); // 400ms total, but window restarted at 200

    act(() => jest.advanceTimersByTime(150));
    expect(result.current).toBe("c"); // only the final value settles
  });
});
