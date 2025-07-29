import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => ReactNode;
  className?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface MobileTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  mobileCardClassName?: string;
  primaryColumn?: string; // Key of the column to use as card title on mobile
  onRowClick?: (row: any) => void;
}

export default function MobileTable({
  columns,
  data,
  className,
  mobileCardClassName,
  primaryColumn,
  onRowClick,
}: MobileTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn("w-full", className)}>
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left py-3 px-4 font-semibold text-gray-700 text-sm",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="py-4 px-4">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <Card
            key={index}
            className={cn(
              "shadow-md",
              onRowClick && "cursor-pointer hover:shadow-lg transition-shadow",
              mobileCardClassName
            )}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="pt-4">
              {/* Primary column as title */}
              {primaryColumn && (
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                  {row[primaryColumn]}
                </h3>
              )}
              
              {/* Other columns as key-value pairs */}
              <div className="space-y-3">
                {columns
                  .filter(col => !col.hideOnMobile && col.key !== primaryColumn)
                  .map((column) => (
                    <div key={column.key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        {column.mobileLabel || column.header}:
                      </span>
                      <div className="text-sm text-gray-900">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Action buttons */}
              {columns.some(col => col.key === 'actions') && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  {columns
                    .find(col => col.key === 'actions')
                    ?.render?.(row.actions, row)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

// Helper components for common table cell types
export function TableBadge({ 
  children, 
  variant = "default" 
}: { 
  children: ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline" 
}) {
  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {children}
    </Badge>
  );
}

export function TableActions({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {children}
    </div>
  );
}

export function MobileActionButton({ 
  children, 
  onClick, 
  variant = "outline",
  className 
}: { 
  children: ReactNode; 
  onClick: () => void; 
  variant?: "default" | "outline" | "ghost";
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn("min-h-[44px] flex-1", className)}
    >
      {children}
    </Button>
  );
}
