import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  LayoutDashboard,
  Building2,
  Info,
  MapPin,
  Menu,
  X,
  Loader2,
  Bell,
  Search,
  ShieldAlert,
  Leaf,
} from 'lucide-react';
import { CityData, CityName } from './types';
import KPICards from './components/KPICards';
import AirCharts from './components/AirCharts';
import InlineCopilotSearch, { InlineCopilotSearchRef } from './components/InlineCopilotSearch';
import CitiesPage from './components/CitiesPage';
import AboutPage from './components/AboutPage';
import { FALLBACK_AIR_QUALITY_DATA, buildSystemInstruction } from './constants';
import { fetchAirQualityData } from './services/dataService';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { cn } from './lib/utils';

type ViewState = 'overview' | 'cities' | 'about';

const navItems: { view: ViewState; label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { view: 'overview', label: 'Dashboard', description: 'Air health', icon: LayoutDashboard },
  { view: 'cities', label: 'Cities', description: 'Compare metros', icon: Building2 },
  { view: 'about', label: 'About', description: 'Mission & data', icon: Info },
];

const Logo = () => (
  <div className="flex items-center gap-3">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2Z" fill="#10b981" fillOpacity="0.12" />
      <path d="M16 6c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6Z" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10s-5 4-5 8a5 5 0 1 0 10 0c0-4-5-8-5-8Z" fill="#0f766e" />
    </svg>
    <div>
      <p className="text-sm font-medium tracking-tight text-emerald-600">AirSafe India</p>
      <p className="text-xs text-emerald-500/80">Clean air intelligence</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const copilotRef = useRef<InlineCopilotSearchRef>(null);
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [selectedCity, setSelectedCity] = useState<CityName>('Delhi');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [airQualityData, setAirQualityData] = useState<Record<CityName, CityData> | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const cities = useMemo(() => airQualityData ? Object.keys(airQualityData) as CityName[] : [], [airQualityData]);
  const systemInstruction = useMemo(() => buildSystemInstruction(airQualityData || FALLBACK_AIR_QUALITY_DATA), [airQualityData]);

  const selectedCityData = airQualityData?.[selectedCity];
  const latestReading = selectedCityData?.data[selectedCityData.data.length - 1];
  const previousReading = selectedCityData?.data[selectedCityData.data.length - 2];

  useEffect(() => {
    let isMounted = true;
    let isAborted = false;

    const loadData = async () => {
      if (isAborted) return;
      
      try {
        console.log('🔄 Starting data fetch...');
        const dataset = await fetchAirQualityData();
        console.log('✅ Data fetched successfully:', dataset);
        console.log('📊 Delhi PM2.5:', dataset.Delhi?.data[dataset.Delhi?.data.length - 1]?.pm25);
        
        if (isMounted && !isAborted) {
          console.log('🔄 Updating state with live data...');
          setIsDataLoading(false);
          setDataError(null);
          setAirQualityData(dataset);
          console.log('✅ State updated - isDataLoading:', false, 'data set:', !!dataset);
        }
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        if (isMounted && !isAborted) {
          setIsDataLoading(false);
          setDataError('Unable to fetch live data. Showing historical values.');
          setAirQualityData(FALLBACK_AIR_QUALITY_DATA);
          console.log('⚠️ Using fallback data due to error');
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      isAborted = true;
    };
  }, []);

  useEffect(() => {
    if (airQualityData && !airQualityData[selectedCity]) {
      const [firstCity] = Object.keys(airQualityData) as CityName[];
      if (firstCity) {
        setSelectedCity(firstCity);
      }
    }
  }, [airQualityData, selectedCity]);

  const sortedCitiesByPM = useMemo(() => {
    if (!airQualityData) return [];
    return Object.values(airQualityData)
      .map((city) => {
        const last = city.data[city.data.length - 1];
        const prev = city.data[city.data.length - 2];
        return {
          name: city.name,
          pm25: last?.pm25 ?? 0,
          note: last?.note ?? '',
          change: last && prev ? last.pm25 - prev.pm25 : 0,
        };
      })
      .sort((a, b) => a.pm25 - b.pm25);
  }, [airQualityData]);

  const highestRiskCities = sortedCitiesByPM.slice(-3).reverse();
  const cleanestCities = sortedCitiesByPM.slice(0, 3);

  const monthlyOutlook = useMemo(() => {
    if (!selectedCityData) return [];
    const maxValue = Math.max(...selectedCityData.data.map((d) => d.pm25));
    return selectedCityData.data.map((entry) => ({
      month: entry.month,
      pm25: entry.pm25,
      width: maxValue ? Math.round((entry.pm25 / maxValue) * 100) : 0,
      note: entry.note,
    }));
  }, [selectedCityData]);

  const formatChange = (current?: number, previous?: number) => {
    if (current === undefined || previous === undefined || previous === 0) return '—';
    const diff = current - previous;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(0)} µg/m³ vs last month`;
  };

  const handleExplainChart = (chartType: 'trend' | 'comparison') => {
    const selectedCityData = airQualityData[selectedCity];
    let question = '';
    
    if (chartType === 'trend') {
      const trendData = selectedCityData.data.map(d => `${d.month}: ${d.pm25} µg/m³`).join(', ');
      question = `Explain the 3-month PM2.5 trend for ${selectedCity}. The values are: ${trendData}. What does this trend mean for residents?`;
    } else {
      const allCities = Object.keys(airQualityData).map(city => {
        const novData = airQualityData[city as CityName].data.find(d => d.month === 'November');
        return `${city}: ${novData?.pm25 || 0} µg/m³`;
      }).join(', ');
      question = `Compare the November PM2.5 levels across cities: ${allCities}. How does ${selectedCity} compare to others?`;
    }

    // Submit the question via the copilot ref
    if (copilotRef.current) {
      copilotRef.current.submitQuestion(question);
    }
  };

  const renderSidebar = (variant: 'desktop' | 'mobile' = 'desktop') => (
    <div
      className={cn(
        'flex h-full w-full flex-col justify-between bg-white/90 px-6 py-8 text-emerald-900 backdrop-blur',
        variant === 'mobile' ? 'max-w-[260px] rounded-r-3xl border-r-0 shadow-xl' : 'w-full border-r border-emerald-100'
      )}
    >
      <div className="space-y-8">
        <Logo />
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 shadow-sm'
                    : 'border-transparent hover:border-emerald-200 hover:bg-emerald-50/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl border',
                      active ? 'border-emerald-500/40 bg-white text-emerald-600' : 'border-emerald-100 bg-emerald-50 text-emerald-500'
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-emerald-400/80">{item.description}</p>
                  </div>
                </div>
                {active && (
                  <Badge className="border border-emerald-200 bg-white text-emerald-600">Active</Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <Card className="border-emerald-50 bg-emerald-500 text-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quarterly Brief</CardTitle>
          <CardDescription className="text-emerald-100/80">
            Download the latest policy-ready report for transport planners and health officers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50">
            Export dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderHeader = () => (
    <header className="sticky top-0 z-40 border-b border-emerald-100/60 bg-white/70 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 flex-1 max-w-3xl">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-emerald-600 hover:bg-emerald-50 lg:hidden shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>
          <div className="flex-1">
            <InlineCopilotSearch 
              ref={copilotRef}
              selectedCity={selectedCity} 
              systemInstruction={systemInstruction}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="ghost" size="icon" className="rounded-full text-emerald-500 hover:bg-emerald-50">
            <Bell size={20} />
          </Button>
          <Avatar className="h-9 w-9 bg-emerald-500 text-white">
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );

  const renderOverview = () => {
    // Show loading state while data is null
    if (!airQualityData) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto" />
            <p className="text-emerald-600 font-medium">Loading live air quality data...</p>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-emerald-900 sm:text-4xl">
              Air health intelligence for Indian metros
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-500">
              Live particulate monitoring, trend analytics, and AI advisories to safeguard commuters and city responders.
            </p>
          </div>
          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full min-w-[220px] sm:w-auto">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value as CityName)}
                className="w-full appearance-none rounded-2xl border border-emerald-200 bg-white py-3 pl-10 pr-10 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-400 focus:border-emerald-500 focus:outline-none"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300">▾</span>
            </div>
            <Button 
              onClick={() => {
                setIsDataLoading(true);
                fetchAirQualityData().then(dataset => {
                  setAirQualityData(dataset);
                  setDataError(null);
                  setIsDataLoading(false);
                }).catch(error => {
                  console.error('Refresh failed:', error);
                  setDataError('Refresh failed. Using cached data.');
                  setIsDataLoading(false);
                });
              }}
              variant="outline"
              className="h-12 rounded-2xl border-emerald-300 px-6 text-sm font-semibold hover:bg-emerald-50"
            >
              {isDataLoading ? <Loader2 size={16} className="animate-spin" /> : '🔄'} Refresh
            </Button>
          </div>
        </div>
        {isDataLoading && (
          <div className="mt-6 flex items-center gap-2 text-sm text-emerald-500">
            <Loader2 size={16} className="animate-spin" />
            <span>Connecting to live AQI monitoring stations…</span>
          </div>
        )}
        {!isDataLoading && latestReading?.note?.includes('Live data') && (
          <div className="mt-6 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50/60 border border-emerald-200 rounded-xl px-4 py-2.5 w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">Live data from government AQI stations • Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
        {!isDataLoading && !latestReading?.note?.includes('Live data') && (
          <div className="mt-6 flex items-center gap-2 text-sm text-amber-600 bg-amber-50/60 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span className="font-medium">Using historical data (API unavailable)</span>
          </div>
        )}
        {dataError && (
          <Card className="mt-6 border-amber-200 bg-amber-50/80">
            <CardContent className="flex items-center gap-3 py-3 text-sm text-amber-700">
              <ShieldAlert size={18} />
              <span>{dataError}</span>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,480px)]">
        <div className="space-y-6">

          <KPICards selectedCity={selectedCity} data={airQualityData} />

          <AirCharts 
            selectedCity={selectedCity} 
            data={airQualityData} 
            onExplainTrend={() => handleExplainChart('trend')}
            onExplainComparison={() => handleExplainChart('comparison')}
          />

          <Card className="border-emerald-50 bg-gradient-to-br from-white via-white to-emerald-50/60 shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-emerald-800">Monthly exposure outlook</CardTitle>
              <CardDescription>Track how particulate levels are shifting as winter inversions set in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {monthlyOutlook.map((entry) => (
                <div key={entry.month} className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-emerald-400 font-semibold">
                    <span>{entry.month}</span>
                    <span>{entry.pm25} µg/m³</span>
                  </div>
                  <div className="h-4 rounded-full bg-emerald-100/80 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm transition-all duration-300"
                      style={{ width: `${entry.width}%` }}
                    />
                  </div>
                  <p className="text-xs text-emerald-600/80 leading-relaxed">{entry.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 xl:sticky xl:top-24 xl:h-fit">
          <Card className="border-emerald-50 bg-white shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-emerald-800">High-alert metros</CardTitle>
              <CardDescription className="text-emerald-600/80">Where urgent mitigation is needed tonight.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {highestRiskCities.map((city) => (
                <div key={city.name} className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">
                      {city.change > 0 ? '🔴' : city.change < 0 ? '🟢' : '🟡'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">{city.name}</p>
                      <p className="text-xs text-emerald-500">{city.pm25} µg/m³</p>
                      <p className="text-xs text-emerald-400/80">{city.note}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-emerald-500">
                    <p className="font-semibold text-emerald-600">{city.pm25 > 100 ? 'Critical' : 'High'}</p>
                    <div className="flex items-center gap-1 justify-end">
                      {city.change !== 0 && (
                        <span className={city.change > 0 ? 'text-red-500' : 'text-green-500'}>
                          {city.change > 0 ? '↑' : '↓'}
                        </span>
                      )}
                      <p>{formatChange(city.pm25, city.pm25 - city.change)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-emerald-50 bg-white shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-emerald-800">Clean air leaders</CardTitle>
              <CardDescription className="text-emerald-600/80">Celebrate the metros staying below 60 µg/m³.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cleanestCities.map((city) => (
                <div key={city.name} className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">
                      {city.change > 0 ? '🟡' : city.change < 0 ? '🟢' : '🟢'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">{city.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-emerald-500">{city.pm25} µg/m³</p>
                        {city.change !== 0 && (
                          <span className={`text-xs flex items-center gap-0.5 ${city.change > 0 ? 'text-amber-500' : 'text-green-600'}`}>
                            {city.change > 0 ? '↑' : '↓'} {Math.abs(city.change).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-600">
                    <Leaf size={14} className="mr-1" /> Stable
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-emerald-50 bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 text-white shadow-lg">
        <CardContent className="flex flex-col gap-6 py-8 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80 font-semibold mb-2">Field intelligence</p>
            <h2 className="text-2xl font-bold mb-2">Deploy wearable sensors to validate particulate spikes</h2>
            <p className="text-sm text-emerald-50/90 leading-relaxed max-w-2xl">
              Combine AirSafe analytics with on-ground sampling to calibrate localised mitigation quickly.
            </p>
          </div>
          <Button variant="secondary" className="rounded-full bg-white text-emerald-600 hover:bg-emerald-50 font-semibold px-8 py-6 text-base shadow-lg whitespace-nowrap">
            Book validation drive
          </Button>
        </CardContent>
      </Card>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-slate-800">
      {/* Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[260px] z-30">{renderSidebar()}</aside>
      
      {/* Main Content with left margin for sidebar */}
      <div className="lg:ml-[260px] flex min-h-screen flex-col">
        {renderHeader()}
        <main className="flex-1 px-6 pb-12 pt-8 sm:px-8 lg:px-10 xl:px-16 max-w-[1600px] mx-auto w-full">
            {currentView === 'overview' && renderOverview()}
            {currentView === 'cities' && (
              <div className="space-y-6">
                {dataError && (
                  <Card className="border-amber-200 bg-amber-50/80">
                    <CardContent className="flex items-center gap-3 py-3 text-sm text-amber-700">
                      <ShieldAlert size={18} />
                      <span>{dataError}</span>
                    </CardContent>
                  </Card>
                )}
                <CitiesPage data={airQualityData} />
              </div>
            )}
            {currentView === 'about' && <AboutPage />}
          </main>
        </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="relative w-72 max-w-[80%]">
            {renderSidebar('mobile')}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full text-emerald-600 hover:bg-emerald-50"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>
          <button className="flex-1 bg-emerald-900/20" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />
        </div>
      )}
    </div>
  );
};

export default App;
