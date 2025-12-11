import React from 'react';
import { Wind } from 'lucide-react';
import { CityData, CityName } from '../types';

interface CitiesPageProps {
  data: Record<CityName, CityData>;
}

const CitiesPage: React.FC<CitiesPageProps> = ({ data }) => {
  const cities = Object.values(data);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">City Air Quality Index</h2>
        <p className="text-slate-500">Compare air quality readings across major Indian cities for November 2025.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => {
          const latestData = city.data[city.data.length - 1];
          let statusColor = 'text-green-600 bg-green-50 border-green-100';
          let statusText = 'Good';
          
          if (latestData.pm25 > 30) { statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-100'; statusText = 'Satisfactory'; }
          if (latestData.pm25 > 60) { statusColor = 'text-orange-600 bg-orange-50 border-orange-100'; statusText = 'Poor'; }
          if (latestData.pm25 > 90) { statusColor = 'text-red-600 bg-red-50 border-red-100'; statusText = 'Severe'; }

          return (
            <div key={city.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{city.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                  {statusText}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-full text-slate-500">
                  <Wind size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current PM2.5</p>
                  <p className="text-2xl font-bold text-slate-700">{latestData.pm25} <span className="text-sm font-normal text-slate-400">µg/m³</span></p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50">
                <p className="text-sm text-slate-600 italic">"{latestData.note}"</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CitiesPage;
