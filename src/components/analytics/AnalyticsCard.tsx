import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
}

export function AnalyticsCard({ title, value, change, icon }: AnalyticsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          <div className="p-2 bg-primary-50 rounded-lg">
            {icon}
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center">
            {change.type === 'increase' ? (
              <ArrowUpRight className="h-4 w-4 text-success-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-error-500" />
            )}
            <span className={`text-sm ml-1 ${
              change.type === 'increase' ? 'text-success-600' : 'text-error-600'
            }`}>
              {change.value}%
            </span>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AnalyticsCard;