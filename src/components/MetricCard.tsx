
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type TrendDirection = 'up' | 'down' | 'neutral';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: TrendDirection;
  className?: string;
}

const MetricCard = ({ title, value, icon, trend = 'neutral', className }: MetricCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-5 h-5 text-dashboard-safe" />;
      case 'down':
        return <ArrowDownIcon className="w-5 h-5 text-dashboard-danger" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={cn(
      "bg-dashboard-card rounded-lg p-4 shadow-md flex flex-col justify-between", 
      className
    )}>
      <div className="text-sm text-gray-400 mb-2">{title}</div>
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center">
          {icon && <div className="mr-3">{icon}</div>}
          {getTrendIcon()}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
