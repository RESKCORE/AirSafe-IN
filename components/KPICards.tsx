import React from 'react';
import { CityData, CityName } from '../types';
import { ArrowUpRight, ShieldAlert, Activity, Leaf, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface KPICardsProps {
  selectedCity: CityName;
  data: Record<CityName, CityData>;
}

const formatChange = (value: number) => {
  const sign = value === 0 ? '' : value > 0 ? '+' : '';
  return `${sign}${value.toFixed(0)} µg/m³`;
};

const KPICards: React.FC<KPICardsProps> = ({ selectedCity, data }) => {
  const cityData = data[selectedCity];
  const latestData = cityData.data[cityData.data.length - 1];
  const previousData = cityData.data[cityData.data.length - 2] ?? latestData;
  const monthChange = latestData.pm25 - previousData.pm25;

  const sortedCities = Object.values(data)
    .map((entry) => ({
      name: entry.name,
      pm25: entry.data[entry.data.length - 1]?.pm25 ?? 0,
      note: entry.data[entry.data.length - 1]?.note ?? '',
    }))
    .sort((a, b) => a.pm25 - b.pm25);

  const cleanestCity = sortedCities[0];
  const highestCity = sortedCities[sortedCities.length - 1];

  const aboveLimitCount = sortedCities.filter((c) => c.pm25 > 60).length;
  const belowLimitCount = sortedCities.length - aboveLimitCount;

  const seasonalAverage = Math.round(
    cityData.data.reduce((acc, entry) => acc + entry.pm25, 0) / cityData.data.length
  );

  const isLiveData = latestData.note?.includes('Live data');

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Current PM2.5 Card */}
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-500 via-emerald-500 to-emerald-600 text-white shadow-xl flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <CardDescription className="text-emerald-50/75 text-xs leading-tight font-medium">Current PM2.5</CardDescription>
            {isLiveData && (
              <Badge className="border-white/40 bg-white/30 text-white backdrop-blur text-[8px] animate-pulse h-fit whitespace-nowrap px-2 py-0.5">
                ● LIVE
              </Badge>
            )}
          </div>
          <CardTitle className="text-3xl font-bold leading-tight">{latestData.pm25}
            <span className="ml-2 text-sm font-medium text-emerald-50/90">µg/m³</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-end justify-between gap-2 pt-2 pb-4 px-4">
          <div className="flex-1">
            <p className="text-xs text-emerald-50/70 leading-tight">vs {previousData.month}</p>
            <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-100 mt-0.5">
              <ArrowUpRight size={12} />
              <span>{formatChange(monthChange)}</span>
            </div>
          </div>
          <Badge className={cn('border-white/30 bg-white/20 text-white backdrop-blur text-xs px-2 py-1 whitespace-nowrap h-fit', {
            'bg-red-500/40 text-white': latestData.pm25 > 90,
            'bg-amber-500/40 text-white': latestData.pm25 > 60 && latestData.pm25 <= 90,
            'bg-emerald-500/30 text-white': latestData.pm25 <= 60,
          })}>
            {latestData.pm25 > 90 ? 'Severe' : latestData.pm25 > 60 ? 'Poor' : 'Controlled'}
          </Badge>
        </CardContent>
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15" />
      </Card>

      {/* Cities Above Limit Card */}
      <Card className="border-emerald-100 bg-white flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-bold text-emerald-700 leading-tight">Cities Above Limit</CardTitle>
          <CardDescription className="text-xs mt-1 text-emerald-600/70">{sortedCities.length} metros monitored</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-between gap-3 pb-4 px-4">
          <div>
            <p className="text-3xl font-bold text-emerald-700 leading-tight">{aboveLimitCount}</p>
            <p className="text-xs text-emerald-600/70 mt-1">Exceeding NAAQS</p>
          </div>
          <div className="flex flex-col gap-1 items-end text-xs">
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 h-fit">{belowLimitCount} under</Badge>
            {highestCity && (
              <p className="text-[10px] text-emerald-600 text-right">
                <span className="font-medium text-emerald-700">{highestCity.name}</span><br/>
                <span className="text-emerald-500">{highestCity.pm25} µg/m³</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Average Card */}
      <Card className="border-emerald-100 bg-white flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-bold text-emerald-700 leading-tight">Seasonal Average</CardTitle>
          <CardDescription className="text-xs mt-1 text-emerald-600/70">3-month mean</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-between gap-3 pb-4 px-4">
          <div>
            <p className="text-3xl font-bold text-emerald-700 leading-tight">{seasonalAverage}</p>
            <p className="text-xs text-emerald-600/70 mt-1">µg/m³</p>
          </div>
          <div className="space-y-0.5 text-xs">
            {cityData.data.map((d) => (
              <div key={d.month} className="text-right">
                <span className="font-medium text-emerald-700 text-[10px]">{d.month.slice(0, 3)}</span>
                <span className="text-emerald-600/70 text-[10px] ml-1">{d.pm25}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cleanest Breather Card */}
      <Card className="border-emerald-100 bg-white flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-bold text-emerald-700 leading-tight">Cleanest Air</CardTitle>
          <CardDescription className="text-xs mt-1 text-emerald-600/70">Best performing city</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-between gap-3 pb-4 px-4">
          <div>
            <p className="text-3xl font-bold text-emerald-700 leading-tight">{cleanestCity.pm25}</p>
            <p className="text-xs text-emerald-600/70 mt-1 font-medium">{cleanestCity.name}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 flex items-center gap-1 h-fit">
              <Leaf size={12} /> Safe
            </Badge>
            <p className="text-[10px] text-emerald-500 text-right">Below 60</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
