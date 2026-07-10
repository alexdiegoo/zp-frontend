import { render, screen } from "@/test/utils";

import { PageHeader, Section } from "./page-header";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Campanhas" />);
    expect(
      screen.getByRole("heading", { name: "Campanhas" }),
    ).toBeInTheDocument();
  });

  it("renders the optional description when provided", () => {
    render(<PageHeader title="Campanhas" description="Gerencie seus disparos" />);
    expect(screen.getByText("Gerencie seus disparos")).toBeInTheDocument();
  });

  it("omits the description node when not provided", () => {
    render(<PageHeader title="Campanhas" />);
    expect(screen.queryByText("Gerencie seus disparos")).not.toBeInTheDocument();
  });

  it("renders trailing action children", () => {
    render(
      <PageHeader title="Campanhas">
        <button>Nova campanha</button>
      </PageHeader>,
    );
    expect(
      screen.getByRole("button", { name: "Nova campanha" }),
    ).toBeInTheDocument();
  });
});

describe("Section", () => {
  it("applies mobile-first fluid padding (tight on mobile, roomier from sm up)", () => {
    render(<Section data-testid="section">content</Section>);
    const section = screen.getByTestId("section");
    // mobile base
    expect(section).toHaveClass("px-4", "py-4");
    // sm+ enhancement
    expect(section).toHaveClass("sm:px-6", "sm:py-6");
  });

  it("merges caller className with the base padding", () => {
    render(
      <Section data-testid="section" className="gap-2">
        content
      </Section>,
    );
    const section = screen.getByTestId("section");
    expect(section).toHaveClass("gap-2");
    expect(section).toHaveClass("px-4");
  });
});
