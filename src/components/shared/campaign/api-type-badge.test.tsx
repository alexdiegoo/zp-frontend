import { renderWithProviders, screen } from "@/test/utils";

import { ApiTypeBadge } from "./api-type-badge";

describe("ApiTypeBadge", () => {
  it("labels the official channel distinctly", () => {
    renderWithProviders(<ApiTypeBadge apiType="OFFICIAL" />);
    expect(screen.getByText("API OFICIAL")).toBeInTheDocument();
    expect(screen.queryByText("API NÃO OFICIAL")).not.toBeInTheDocument();
  });

  it("labels the unofficial channel distinctly", () => {
    renderWithProviders(<ApiTypeBadge apiType="UNOFFICIAL" />);
    expect(screen.getByText("API NÃO OFICIAL")).toBeInTheDocument();
    expect(screen.queryByText("API OFICIAL")).not.toBeInTheDocument();
  });
});
