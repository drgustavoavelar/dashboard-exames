import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  percentage?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ title, value, trend = "neutral", percentage, icon, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon ? (
            <div className="text-muted-foreground/50 p-2 bg-secondary rounded-lg">{icon}</div>
          ) : (
            <Activity className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <h2 className="text-3xl font-bold font-display tracking-tight text-foreground">{value}</h2>
          {percentage && (
            <span className={cn(
              "flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" ? "text-emerald-500 bg-emerald-500/10" : 
              trend === "down" ? "text-rose-500 bg-rose-500/10" : 
              "text-muted-foreground bg-secondary"
            )}>
              {trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : 
               trend === "down" ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
              {percentage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
