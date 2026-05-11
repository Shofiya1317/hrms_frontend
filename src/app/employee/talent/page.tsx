'use client';

import React from 'react';
import { Briefcase, Clock } from 'lucide-react';

export default function TalentPage() {
  return (
    <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mx-auto mb-4">
          <Briefcase size={28} className="text-[#2D7A4F]" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Talent Module</h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Performance management, goals, and career development tools are coming in Phase 2.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 w-fit mx-auto">
          <Clock size={13} />
          Coming in Phase 2
        </div>
      </div>
    </div>
  );
}
