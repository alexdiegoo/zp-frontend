import { render, screen } from "@/test/utils";

import { LandingFooter } from "./landing-footer";

describe("LandingFooter", () => {
  it("links 'Política de privacidade' to the /privacidade route", () => {
    render(<LandingFooter />);
    const link = screen.getByRole("link", { name: "Política de privacidade" });
    expect(link).toHaveAttribute("href", "/privacidade");
  });
});
