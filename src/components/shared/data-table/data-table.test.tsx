import type { ColumnDef } from "@tanstack/react-table";
import userEvent from "@testing-library/user-event";

import { renderWithProviders, screen } from "@/test/utils";

import { DataTable } from "./data-table";

type Row = { name: string };

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Nome" },
];

describe("DataTable", () => {
  it("shows a skeleton (and no data rows) while loading", () => {
    const { container } = renderWithProviders(
      <DataTable columns={columns} data={[{ name: "Ana" }]} isLoading />,
    );
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  it("shows the empty message when there are no rows", () => {
    renderWithProviders(
      <DataTable columns={columns} data={[]} emptyMessage="Nenhum resultado." />,
    );
    // Present in both the (hidden) table and the mobile card layout.
    expect(screen.getAllByText("Nenhum resultado.").length).toBeGreaterThan(0);
  });

  it("renders each item in both the table and the mobile card layout", () => {
    renderWithProviders(
      <DataTable columns={columns} data={[{ name: "Ana" }, { name: "Bruno" }]} />,
    );
    // One occurrence in the desktop table + one in the mobile card layout.
    expect(screen.getAllByText("Ana")).toHaveLength(2);
    expect(screen.getAllByText("Bruno")).toHaveLength(2);
  });

  it("labels each value with its column header in the card layout", () => {
    renderWithProviders(<DataTable columns={columns} data={[{ name: "Ana" }]} />);
    // "Nome" appears as the table header AND as the card field label.
    expect(screen.getAllByText("Nome")).toHaveLength(2);
  });

  it("invokes onRowClick with the clicked row's data", async () => {
    const onRowClick = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DataTable columns={columns} data={[{ name: "Ana" }]} onRowClick={onRowClick} />,
    );
    await user.click(screen.getAllByText("Ana")[0]);
    expect(onRowClick).toHaveBeenCalledWith({ name: "Ana" });
  });

  it("renders only the scrollable table (no cards) when mobileLayout is 'scroll'", () => {
    renderWithProviders(
      <DataTable columns={columns} data={[{ name: "Ana" }]} mobileLayout="scroll" />,
    );
    // No duplicate card render: value and header each appear exactly once.
    expect(screen.getAllByText("Ana")).toHaveLength(1);
    expect(screen.getAllByText("Nome")).toHaveLength(1);
  });
});
