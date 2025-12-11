import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from 'recharts';
import { MessageSquare } from 'lucide-react';
import { CityData, CityName } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface AirChartsProps {
  selectedCity: CityName;
  data: Record<CityName, CityData>;
  className?: string;
  onExplainTrend?: () => void;
  onExplainComparison?: () => void;
}

const AirCharts: React.FC<AirChartsProps> = ({ selectedCity, data, className, onExplainTrend, onExplainComparison }) => {
  const cityData = data[selectedCity].data;
  const [isLoadingTrend, setIsLoadingTrend] = React.useState(false);
  const [isLoadingComparison, setIsLoadingComparison] = React.useState(false);

  const handleExplainTrend = async () => {
    setIsLoadingTrend(true);
    try {
      if (onExplainTrend) {
        onExplainTrend();
      }
    } finally {
      setIsLoadingTrend(false);
    }
  };

  const handleExplainComparison = async () => {
    setIsLoadingComparison(true);
    try {
      if (onExplainComparison) {
        onExplainComparison();
      }
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const comparisonData = Object.keys(data).map((key) => {
    const city = key as CityName;
    const novData = data[city].data.find((d) => d.month === 'November');
    return {
      name: city,
      pm25: novData ? novData.pm25 : 0,
      isCurrent: city === selectedCity,
    };
  });

  return (
    <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <Card className="border-emerald-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>3-Month PM₂.₅ Trend</CardTitle>
              <CardDescription>Tracking seasonal shifts in {selectedCity}</CardDescription>
            </div>
            {onExplainTrend && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExplainTrend}
                disabled={isLoadingTrend}
                className="text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <MessageSquare size={14} />
                {isLoadingTrend ? 'Loading...' : 'Explain'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cityData} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(34,197,94,0.18)',
                    boxShadow: '0 20px 40px -24px rgba(16,185,129,0.65)',
                  }}
                  cursor={{ stroke: '#047857', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <ReferenceLine
                  y={60}
                  label={{ position: 'top', value: 'NAAQS Limit', fill: '#ef4444', fontSize: 10 }}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="pm25"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#047857', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>City Comparison (November)</CardTitle>
              <CardDescription>
                <span className="flex items-center gap-1.5">
                  Where {selectedCity} stands among peer metros
                  <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-emerald-100/60 text-[10px] font-medium text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Highlighted
                  </span>
                </span>
              </CardDescription>
            </div>
            {onExplainComparison && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExplainComparison}
                disabled={isLoadingComparison}
                className="text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <MessageSquare size={14} />
                {isLoadingComparison ? 'Loading...' : 'Explain'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <Tooltip
                  cursor={{ fill: 'rgba(16,185,129,0.06)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(16,185,129,0.15)',
                    boxShadow: '0 20px 40px -24px rgba(16,185,129,0.55)',
                  }}
                />
                <Bar dataKey="pm25" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pm25 > 60 ? (entry.pm25 > 100 ? '#ef4444' : '#f97316') : '#22c55e'}
                      opacity={entry.isCurrent ? 1 : 0.45}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AirCharts;
