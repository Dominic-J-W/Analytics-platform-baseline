import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  category: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, trend, trendUp, category, icon }: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
        <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{category}</div>
      </div>
      
      <div className="text-3xl text-foreground mb-2">{value}</div>
      
      {trend && (
        <div className="flex items-center gap-1">
          {trendUp ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}