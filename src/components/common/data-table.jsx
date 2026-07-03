import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  SquarePlus,
} from "lucide-react";
import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  searchPlaceholder = "Search...",
  addButton,
  extraButton,
  expandableRow,
  serverPagination,
  loading = false,
  hideSearch = false,
  hideColumn = false,
}) => {
  const isServer = !!serverPagination;
  const [sorting, setSorting] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: isServer
        ? {
            pageIndex: serverPagination.pageIndex,
            pageSize,
          }
        : pagination,
    },
    manualPagination: isServer,
    pageCount: isServer ? serverPagination.pageCount : undefined,
    onPaginationChange: isServer
      ? (updater) => {
          const next =
            typeof updater === "function"
              ? updater({
                  pageIndex: serverPagination.pageIndex,
                  pageSize,
                })
              : updater;

          serverPagination.onPageChange(next.pageIndex);
        }
      : setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: isServer ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
  });

  const toggleRow = (rowId) => {
    setExpandedRows((prev) => (prev[rowId] ? {} : { [rowId]: true }));
  };
  const handlePageSizeChange = (size) => {
    if (isServer) {
      serverPagination.onPageSizeChange?.(size);
      serverPagination.onPageChange(0);
    } else {
      setPagination({
        pageIndex: 0,
        pageSize: size,
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-1">
        {!hideSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);

                if (isServer) {
                  serverPagination.onSearch?.(value);
                  serverPagination.onPageChange(0);
                } else {
                  setGlobalFilter(value);
                }
              }}
              placeholder={searchPlaceholder}
              className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 w-full"
            />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {!hideColumn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnDef = columns.find(
                      (col) =>
                        col.accessorKey === column.id || col.id === column.id,
                    );
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        className="text-xs capitalize"
                      >
                        {columnDef?.header || column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {addButton &&
            (addButton.to ? (
              <Link to={addButton.to}>
                <Button variant="default" size="sm" className="h-9">
                  <SquarePlus className="h-3 w-3 mr-2" />
                  {addButton.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="h-9"
                onClick={addButton.onClick}
              >
                <SquarePlus className="h-3 w-3 mr-2" />
                {addButton.label}
              </Button>
            ))}
          {extraButton}
        </div>
      </div>

      {/* Table container with horizontal scroll */}
      <div className="rounded-none border min-h-[31rem] overflow-x-auto">
        <Table className="">
          {" "}
          {/* 👈 Add this */}
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {expandableRow && <TableHead className="w-10" />}
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`
                      ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                      px-2 sm:px-4 py-2 text-xs sm:text-sm
                    `}
                  >
                    <div className="flex items-center gap-1 whitespace-normal sm:whitespace-nowrap">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (expandableRow ? 2 : 1)}
                  className="text-center py-20 font-medium text-muted-foreground"
                >
                  Loading data...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow>
                    {expandableRow && (
                      <TableCell>
                        <button onClick={() => toggleRow(row.id)}>
                          {expandedRows[row.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                    )}

                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-2 sm:px-4 py-2 text-xs sm:text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {expandedRows[row.id] && expandableRow && (
                    <TableRow className="bg-gray-50">
                      <TableCell
                        colSpan={
                          row.getVisibleCells().length + (expandableRow ? 1 : 0)
                        }
                        className="px-2 sm:px-4 py-2"
                      >
                        {expandableRow(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (expandableRow ? 2 : 1)}
                  className="text-center py-20 font-medium text-muted-foreground"
                >
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Total Records:{" "}
          {isServer
            ? serverPagination.total
            : table.getFilteredRowModel().rows.length}
        </span>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                {table.getState().pagination.pageSize}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {[10, 25, 50, 100].map((size) => (
                <DropdownMenuCheckboxItem
                  key={size}
                  checked={table.getState().pagination.pageSize === size}
                  onCheckedChange={() => handlePageSizeChange(size)}
                >
                  {size} / page
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm whitespace-nowrap">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
