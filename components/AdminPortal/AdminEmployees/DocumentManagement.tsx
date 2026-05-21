'use client';

import React from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';

interface Document {
  name: string;
  tag: string;
  size: string;
  date: string;
  expiry: string | null;
}

const DOCUMENTS: Document[] = [
  { name: 'Offer Letter - New Employee.pdf', tag: 'HR', size: '245 KB', date: 'Mar 2026', expiry: null },
  { name: 'Aadhaar Card - Employee.pdf', tag: 'KYC', size: '1.2 MB', date: 'Jan 2026', expiry: 'Dec 2030' },
  { name: 'PAN Card - Employee.pdf', tag: 'KYC', size: '890 KB', date: 'Jun 2025', expiry: null },
  { name: 'NDA Agreement - Employee.pdf', tag: 'Legal', size: '320 KB', date: 'Sep 2025', expiry: 'Sep 2028' },
  { name: 'Salary Slip - Feb 2026.pdf', tag: 'HR', size: '180 KB', date: 'Feb 2026', expiry: null },
];

const tagColors: Record<string, string> = {
  KYC: 'bg-blue-100 text-blue-700',
  HR: 'bg-green-100 text-green-700',
  Legal: 'bg-purple-100 text-purple-700',
};

export default function DocumentManagement() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0f1f2e]">Document Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2D7A4F] rounded-xl hover:bg-[#1e5c3a] transition-colors">
          <Upload size={14} /> Upload Document
        </button>
      </div>
      <div className="space-y-2">
        {DOCUMENTS.map((doc, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <span className="text-red-500 text-xs font-bold">PDF</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tagColors[doc.tag]}`}>{doc.tag}</span>
                <span className="text-xs text-gray-400">{doc.size} · {doc.date}</span>
                {doc.expiry && <span className="text-xs text-amber-600 font-medium">Expires {doc.expiry}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#2D7A4F] hover:bg-[#e8f5ee] transition-colors">
                <Download size={14} />
              </button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}