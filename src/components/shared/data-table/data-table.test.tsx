import type { ColumnDef } from "@tanstack/react-table";
import userEvent from "@testing-library/user-event";

import { render, screen } from "@/test/utils";

import { DataTable } from "./data-table";

type Row = { name: string };

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Nome" },
];

describe("DataTable", () => {
  it("shows a skeleton (and no data rows) while loading", () => {
    const { container } = render(
      <DataTable columns={columns} data={[{ name: "Ana" }]} isLoading />,
    );
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  it("shows the empty message when there are no rows", () => {
    render(
      <DataTable columns={columns} data={[]} emptyMessage="Nenhum resultado." />,
    );
    expect(screen.getByText("Nenhum resultado.")).toBeInTheDocument();
  });

  it("renders one row per item with its cell content", () => {
    render(<DataTable columns={columns} data={[{ name: "Ana" }, { name: "Bruno" }]} />);
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });

  it("invokes onRowClick with the clicked row's data", async () => {
    const onRowClick = jest.fn();
    const user = userEvent.setup();

    render(
      <DataTable columns={columns} data={[{ name: "Ana" }]} onRowClick={onRowClick} />,
    );
    await user.click(screen.getByText("Ana"));
    expect(onRowClick).toHaveBeenCalledWith({ name: "Ana" });
  });
});
