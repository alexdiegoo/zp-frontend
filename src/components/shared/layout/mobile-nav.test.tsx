import { fireEvent, renderWithProviders, screen } from "@/test/utils";

import { MobileNav } from "./mobile-nav";

// The drawer reads the current path (to highlight the active link and to close
// on route change). Pin it for a stable render.
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("MobileNav", () => {
  it("renders a labeled trigger and keeps the drawer closed initially", () => {
    renderWithProviders(<MobileNav />);
    expect(
      screen.getByRole("button", { name: "Abrir menu de navegação" }),
    ).toBeInTheDocument();
    // Nav destinations are not in the DOM until the drawer opens.
    expect(screen.queryByRole("link", { name: "Chat" })).not.toBeInTheDocument();
  });

  it("opens the drawer with all nav destinations when the trigger is clicked", () => {
    renderWithProviders(<MobileNav />);
    fireEvent.click(
      screen.getByRole("button", { name: "Abrir menu de navegação" }),
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Campanhas" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Configurações" }),
    ).toBeInTheDocument();
  });

  it("closes the drawer when a navigation link is clicked", async () => {
    renderWithProviders(<MobileNav />);
    fireEvent.click(
      screen.getByRole("button", { name: "Abrir menu de navegação" }),
    );

    const chatLink = screen.getByRole("link", { name: "Chat" });
    fireEvent.click(chatLink);

    // onNavigate → setOpen(false): the drawer content unmounts.
    expect(
      await screen.findByRole("button", { name: "Abrir menu de navegação" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Chat" })).not.toBeInTheDocument();
  });
});
