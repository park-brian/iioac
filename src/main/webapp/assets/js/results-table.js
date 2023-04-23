import { getCoreRowModel, getPaginationRowModel, getSortedRowModel } from "https://cdn.jsdelivr.net/npm/@tanstack/table-core@8.8.4/+esm";
import { html, useEffect, useState, useMemo } from "https://cdn.jsdelivr.net/npm/htm@3.1.1/preact/standalone.mjs";
import { IndeterminateCheckbox, useTable, useSkipper, flexRender } from "./table.js";
import { exportExcelTable } from "./utils.js";

export default function ResultsTable({ results }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const numSelected = Object.values(rowSelection).filter(Boolean).length;
  const [data, setData] = useState([]);
  useEffect(() => setData(results), [results, setData]);
  // const data = useMemo(() => results, [results]);
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  useEffect(() => {
    setRowSelection({});
    setSorting([]);
  }, [data]);

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
      header: () => "PMN #",
      accessorKey: "PMN",
    },
    {
      header: () => "Scenario #",
      accessorKey: "AssessID",
    },
    {
      header: () => "Scenario Name",
      accessorKey: "OpName",
      editable: true,
    },
    {
      header: () => "Source Type",
      accessorKey: "Media",
    },
    {
      header: () => "Release #",
      accessorKey: "ActSort",
    },
    {
      header: () => "Mass Released per Day (kg/day)",
      accessorKey: "DRR",
    },
    {
      header: () => "# of release Days per Year",
      accessorKey: "DOR",
    },
  ]);

  const defaultColumn = {
    cell: ({ getValue, row: { index }, column: { id, columnDef }, table }) => {
      if (!columnDef.editable) {
        return getValue()
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
          class="border-0"  
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
      <table class="table table-bordered shadow-sm mb-0">
        <thead class="bg-grey">
          ${table.getHeaderGroups().map(
            (headerGroup) =>
              html`<tr key=${headerGroup.id}>
                ${headerGroup.headers.map(
                  (header) =>
                    html`<th key=${header.id} colspan=${header.colSpan}>
                      ${header.isPlaceholder
                        ? null
                        : html`<div onClick=${header.column.getToggleSortingHandler()}>
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
                ${row.getVisibleCells().map((cell) => html`<td key=${cell.id}>${flexRender(cell.column.columnDef.cell, cell.getContext())}</td>`)}
              </tr>`
          )}
        </tbody>
      </table>
    </div>

    <div class="d-flex align-items-center justify-content-between flex-wrap mb-3">
      <div class="d-flex align-items-center my-1">
        <nav aria-label="paginate table">
          <ul class="pagination mb-0">
            <li class="page-item">
              <span class="page-link text-dark"> Page <strong>${table.getState().pagination.pageIndex + 1} ${" of "} ${Math.max(1, table.getPageCount())} </strong> </span>
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
