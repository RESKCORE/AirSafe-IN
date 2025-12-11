import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-emerald-100 bg-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3">
          <p className="text-emerald-600 text-sm font-medium">
            © 2025 AirSafe India. Educational use only.
          </p>
          <p className="text-emerald-500/80 text-xs leading-relaxed max-w-3xl mx-auto">
            Disclaimer: This application provides general information based on simplified air quality data. 
            It is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always check with local authorities for real-time emergency advisories.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
