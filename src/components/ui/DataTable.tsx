import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface Column<T> {
  key: string;
  header: string;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Aucune donnée',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="forge-card p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="forge-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn("font-semibold text-foreground", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <motion.tr
              key={keyExtractor(item)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "forge-table-row border-b border-border/50 last:border-0",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell
                    ? column.cell(item)
                    : (item as Record<string, unknown>)[column.key] as ReactNode}
                </TableCell>
              ))}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Status badge helper
export function StatusBadge({ 
  status, 
  labels 
}: { 
  status: string; 
  labels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>;
}) {
  const config = labels[status] || { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}
