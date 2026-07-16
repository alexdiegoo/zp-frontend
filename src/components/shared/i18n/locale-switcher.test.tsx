import userEvent from "@testing-library/user-event";

import { renderWithProviders, screen } from "@/test/utils";

import { LocaleSwitcher } from "./locale-switcher";

// Capture what the switcher does without hitting the network.
const mutate = jest.fn();
let isPending = false;

jest.mock("@/hooks/queries/use-locale", () => ({
  useSetLocale: () => ({ mutate, isPending }),
}));

// Radix Select relies on pointer-capture / scrollIntoView APIs jsdom lacks.
beforeAll(() => {
  Element.prototype.hasPointerCapture = jest.fn();
  Element.prototype.releasePointerCapture = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  mutate.mockClear();
  isPending = false;
});

describe("LocaleSwitcher", () => {
  it("shows the active locale label", () => {
    renderWithProviders(<LocaleSwitcher />, { locale: "pt-BR" });
    expect(screen.getByRole("combobox")).toHaveTextContent("Português (Brasil)");
  });

  it("fires useSetLocale with the chosen locale", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LocaleSwitcher />, { locale: "pt-BR" });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "English" }));

    expect(mutate).toHaveBeenCalledWith("en");
  });

  it("does not re-fire when the active locale is reselected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LocaleSwitcher />, { locale: "pt-BR" });

    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Português (Brasil)" }),
    );

    expect(mutate).not.toHaveBeenCalled();
  });

  it("disables the control while a change is pending", () => {
    isPending = true;
    renderWithProviders(<LocaleSwitcher />, { locale: "pt-BR" });
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
