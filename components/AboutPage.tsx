import React from 'react';
import { ShieldCheck, Database, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Breathing Cleaner, Living Better</h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          AirSafe India is dedicated to democratizing air quality data. We believe everyone deserves to know what they breathe, in simple, jargon-free language.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Our Mission</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            To provide accessible, actionable air quality insights that empower Indian citizens to protect their health.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Database size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">The Data</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            We aggregate simplified PM2.5 readings for major metropolitan areas, focusing on trends rather than raw noise.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Community First</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Designed for non-experts. Our AI Copilot helps translate complex environmental data into simple health advice.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Data Sources & Methodology</h3>
        <p className="text-sm text-slate-600 mb-4">
          The data presented in this application is for educational and demonstration purposes. It highlights typical trends observed during the post-monsoon and winter seasons in India (September–November).
        </p>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
          <li>PM2.5 values are monthly averages in µg/m³.</li>
          <li>NAAQS Limit references the Indian National Ambient Air Quality Standards (60 µg/m³ daily average).</li>
          <li>Health advice is generated based on general public health guidelines.</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
