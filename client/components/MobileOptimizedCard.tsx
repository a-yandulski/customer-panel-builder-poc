import { ReactNode, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileOptimizedCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerActions?: ReactNode;
}

export default function MobileOptimizedCard({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
  headerActions,
}: MobileOptimizedCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader 
        className={cn(
          "pb-3",
          collapsible && "cursor-pointer select-none"
        )}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="body-sm text-gray-600 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {headerActions}
            {collapsible && (
              <Button variant="ghost" size="sm" className="p-2 min-h-[44px] min-w-[44px]">
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {(!collapsible || !isCollapsed) && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
