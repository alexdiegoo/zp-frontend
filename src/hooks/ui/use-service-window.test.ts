import { act, renderHook } from "@testing-library/react";

import type { WindowStatus } from "@/types/chat";

import { useServiceWindow } from "./use-service-window";

const BASE = new Date("2025-06-20T12:00:00.000Z");
const at = (msFromBase: number) =>
  new Date(BASE.getTime() + msFromBase).toISOString();

const status = (over: Partial<WindowStatus> = {}): WindowStatus => ({
  expiresAt: at(2 * 60 * 60 * 1000), // +2h
  isOpen: true,
  ...over,
});

describe("useServiceWindow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(BASE);
  });
  afterEach(() => jest.useRealTimers());

  it("reports the window open with a remaining label when inside it", () => {
    const { result } = renderHook(() => useServiceWindow(status()));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.remainingLabel).toBe("2h 0min");
    expect(result.current.expiresAt).toBeInstanceOf(Date);
  });

  it("is closed exactly at the expiry instant (boundary)", () => {
    const { result } = renderHook(() =>
      useServiceWindow(status({ expiresAt: at(0) })),
    );
    expect(result.current.isOpen).toBe(false);
    expect(result.current.remainingLabel).toBeNull();
  });

  it("is closed when the window is already in the past", () => {
    const { result } = renderHook(() =>
      useServiceWindow(status({ expiresAt: at(-60_000) })),
    );
    expect(result.current.isOpen).toBe(false);
  });

  it("returns a null/closed state when there is no window status", () => {
    const { result } = renderHook(() => useServiceWindow(undefined));
    expect(result.current).toEqual({
      expiresAt: null,
      isOpen: false,
      remainingLabel: null,
    });
  });

  it("formats sub-hour and sub-minute remaining labels", () => {
    const min45 = renderHook(() =>
      useServiceWindow(status({ expiresAt: at(45 * 60_000) })),
    );
    expect(min45.result.current.remainingLabel).toBe("45min");

    const secs30 = renderHook(() =>
      useServiceWindow(status({ expiresAt: at(30_000) })),
    );
    expect(secs30.result.current.remainingLabel).toBe("menos de 1min");
  });

  it("flips isOpen to false as time crosses expiry (ticking, no loop)", () => {
    const { result } = renderHook(() =>
      useServiceWindow(status({ expiresAt: at(90_000) })), // +90s
    );
    expect(result.current.isOpen).toBe(true);

    // Minute-boundary tick, then the exact-expiry tick.
    act(() => jest.advanceTimersByTime(60_000));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.remainingLabel).toBe("menos de 1min");

    act(() => jest.advanceTimersByTime(30_000));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.remainingLabel).toBeNull();
  });
});
