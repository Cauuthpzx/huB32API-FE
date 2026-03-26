import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    onRowClick?: (row: T) => void;
    rowKey: (row: T) => string;
}

export function DataTable<T>({
    columns,
    data,
    isLoading,
    onRowClick,
    rowKey,
}: DataTableProps<T>) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    const filtered = search
        ? data.filter((row) =>
              columns.some((col) => {
                  const val = (row as Record<string, unknown>)[col.key];
                  return String(val ?? "").toLowerCase().includes(search.toLowerCase());
              }),
          )
        : data;

    const sorted = sortKey
        ? [...filtered].sort((a, b) => {
              const av = (a as Record<string, unknown>)[sortKey];
              const bv = (b as Record<string, unknown>)[sortKey];
              const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
              return sortAsc ? cmp : -cmp;
          })
        : filtered;

    function handleSort(key: string) {
        if (sortKey === key) setSortAsc((v) => !v);
        else { setSortKey(key); setSortAsc(true); }
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative w-full max-w-xs">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("app.search")}
                    className="h-8 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-[var(--border-default)]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className={col.sortable ? "cursor-pointer select-none hover:text-[var(--text-primary)]" : ""}
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                >
                                    {col.header}
                                    {sortKey === col.key && (
                                        <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            <div className="h-4 w-24 animate-pulse rounded bg-[var(--bg-tertiary)]" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : sorted.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center text-sm text-[var(--text-disabled)] py-8">
                                    {t("app.noData")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            sorted.map((row) => (
                                <TableRow
                                    key={rowKey(row)}
                                    className={onRowClick ? "cursor-pointer hover:bg-[var(--bg-hover)]" : ""}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            {col.render
                                                ? col.render(row)
                                                : String((row as Record<string, unknown>)[col.key] ?? "")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Row count */}
            {!isLoading && (
                <p className="text-xs text-[var(--text-disabled)]">
                    {sorted.length} / {data.length}
                </p>
            )}
        </div>
    );
}
