import { getCoreRowModel, getPaginationRowModel, getSortedRowModel } from "./lib/table-core.js";
import { html, useEffect, useState, useMemo } from "./lib/preact.js";
import { IndeterminateCheckbox, useTable, useSkipper, flexRender } from "./table.js";
import { exportExcelTable } from "./utils.js";

export default function ResultsTable({ results, loading }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const numSelected = Object.values(rowSelection).filter(Boolean).length;
  const [data, setData] = useState([]);
  // useEffect(() => setData(results), [results, setData]);
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  useEffect(() => {
    setData(results)
    setRowSelection({});
    setSorting([]);
  }, [setData, setRowSelection, setSorting, results]);

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) =>
        html`<div className="px-1">
          <${IndeterminateCheckbox}
            class="form-check-input"
            aria-label="Select all rows"
            checked=${table.getIsAllRowsSelected()}
            indeterminate=${table.getIsSomeRowsSelected()}
            onChange=${table.getToggleAllRowsSelectedHandler()}
          />
        </div>`,
      cell: ({ row }) =>
        html`<div className="px-1">
          <${IndeterminateCheckbox}
            class="form-check-input"
            aria-label="Select row"
            checked=${row.getIsSelected()}
            disabled=${!row.getCanSelect()}
            indeterminate=${row.getIsSomeSelected()}
            onChange=${row.getToggleSelectedHandler()}
          />
        </div>`,
    },
    {
      header: () => html`<span class="text-nowrap">PMN #</span>`,
      accessorKey: "PMN",
      cellClass: "text-nowrap",
    },
    {
      header: () => html`<span class="text-nowrap">Scenario #</span>`,
      accessorKey: "AssessID",
      cellClass: "text-nowrap text-end",
    },
    {
      header: () => html`<span class="text-nowrap">Scenario Name</span>`,
      accessorKey: "OpName",
      editable: true,
      cellClass: "text-nowrap",
    },
    {
      header: () => html`<span class="text-nowrap">Source Type</span>`,
      accessorKey: "Media",
      cellClass: "text-nowrap",
    },
    {
      header: () => html`<span class="text-nowrap">Release #</span>`,
      accessorKey: "ActSort",
      cellClass: "text-nowrap text-end",
    },
    {
      header: () => html`<span class="text-nowrap">Kg/Day Released</span>`,
      accessorKey: "DRR",
      cellClass: "text-nowrap text-end",
    },
    {
      header: () => html`<span class="text-nowrap">Release Days/Year</span>`,
      accessorKey: "DOR",
      cellClass: "text-nowrap text-end",
    },
  ]);

  const defaultColumn = {
    cell: ({ getValue, row: { index }, column: { id, columnDef }, table }) => {
      if (!columnDef.editable) {
        return getValue();
      }

      const initialValue = getValue()
      // We need to keep and update the state of the cell normally
      const [value, setValue] = useState(initialValue)

      // When the input is blurred, we'll call our table meta's updateData function
      const onBlur = () => {
        table.options.meta?.updateData(index, id, value)
      }

      // If the initialValue is changed external, sync it up with our state
      useEffect(() => {
        setValue(initialValue)
      }, [initialValue])

      return (
        html`<input
          class="border-0 bg-transparent"
          aria-label="Edit cell"
          value=${value}
          size=${value.length || 30}
          onChange=${e => setValue(e.target.value)}
          onBlur=${onBlur}
        />`
      )
    },
  }

  const table = useTable({
    data,
    columns,
    defaultColumn,
    state: {
      rowSelection,
      sorting,
    },
    enableRowSelection: true, //enable row selection for all rows
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex,
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex()
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
    },
  });

  function exportParameters() {
    const parameters = data
      .filter((row, index) => rowSelection[index])
      .map((row) => ({
        "Scenario #": row.AssessID,
        "Scenario Name": row.OpName,
        "Source Type": row.Media,
        "Release #": row.ActSort,
        "Mass Released Per Day (kg/day)": row.DRR,
        "# of Release Days Per Year": row.DOR,
      }))
    exportExcelTable(parameters, `IIOAC-Parameters-${new Date().toISOString()}.xlsx`);
  }

  return html`<div class="table-responsive mb-3">
      <table class="table table-striped table-hover table-bordered mb-0">
        <thead class="bg-primary text-light">
          ${table.getHeaderGroups().map(
            (headerGroup) =>
              html`<tr key=${headerGroup.id}>
                ${headerGroup.headers.map(
                  (header) =>
                    html`<th class="text-nowrap" key=${header.id} colspan=${header.colSpan}>
                      ${header.isPlaceholder
                        ? null
                        : html`<div class="cursor-pointer" onClick=${header.column.getToggleSortingHandler()}>
                            ${flexRender(header.column.columnDef.header, header.getContext())}
                            ${{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted()] ?? null}
                          </div>`}
                    </th>`
                )}
              </tr>`
          )}
        </thead>
        <tbody>
          ${table.getRowModel().rows.map(
            (row) =>
              html`<tr key=${row.id}>
                ${row.getVisibleCells().map((cell) => html`<td key=${cell.id} class=${cell.column.columnDef.cellClass}>${flexRender(cell.column.columnDef.cell, cell.getContext())}</td>`)}
              </tr>`
          )}
        </tbody>
        <tfoot>
          <tr hidden=${!loading}>
            <td colspan=${columns.length} class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading</span>
                </div>
                <div class="fw-semibold">
                    Loading 
                </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="d-flex align-items-center justify-content-between flex-wrap mb-3">
      <div class="d-flex align-items-center my-1">
        <nav aria-label="paginate table">
          <ul class="pagination mb-0">
            <li class="page-item">
              <span class="page-link text-dark text-nowrap"> Page <strong>${table.getState().pagination.pageIndex + 1} ${" of "} ${Math.max(1, table.getPageCount())} </strong> </span>
            </li>
            <li class="page-item">
              <button type="button" className="page-link" onClick=${() => table.setPageIndex(0)} disabled=${!table.getCanPreviousPage()}>${"<<"}</button>
            </li>
            <li class="page-item">
              <button type="button" className="page-link" onClick=${() => table.previousPage()} disabled=${!table.getCanPreviousPage()}>${"<"}</button>
            </li>
            <li class="page-item">
              <button type="button" className="page-link" onClick=${() => table.nextPage()} disabled=${!table.getCanNextPage()}>${">"}</button>
            </li>
            <li class="page-item">
              <button type="button" className="page-link" onClick=${() => table.setPageIndex(table.getPageCount() - 1)} disabled=${!table.getCanNextPage()}>
                ${">>"}
              </button>
            </li>
          </ul>
        </nav>
        <select
          class="form-select mx-2"
          aria-label="Select page size"
          style="width: 120px"
          value=${table.getState().pagination.pageSize}
          onChange=${(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          ${[5, 10, 20, 30, 40, 50].map((pageSize) => html`<option value=${pageSize}>Show ${pageSize}</option>`)}
        </select>
      </div>

      <button class="btn btn-primary my-1" onClick=${exportParameters} disabled=${numSelected == 0}>Export ${numSelected > 0 && `(${numSelected})`}</button>
    </div> `;
}
