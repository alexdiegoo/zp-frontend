import { render, screen } from "@/test/utils";

import { PageHeader } from "./page-header";

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
