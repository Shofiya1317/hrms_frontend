'use client';

import { Upload, Download } from 'lucide-react';

export default function AttendanceUpload() {
  return (
    <div className="space-y-5 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-bold text-[#0f1f2e]">Bulk Upload</h1>
        <p className="text-sm text-gray-500 mt-0.5">Import attendance data via Excel</p>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Upload Attendance (Excel)</h3>
        <div className="group cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-5 text-center transition-colors hover:border-[#2D7A4F]/40 sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} className="text-[#2D7A4F]" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Drop your Excel file here</p>
          <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls · Max 10MB</p>
          <button className="mt-4 px-4 py-2 text-sm font-semibold text-[#2D7A4F] bg-[#e8f5ee] rounded-xl hover:bg-[#d0ead9] transition-colors">Browse File</button>
        </div>
        <div className="mt-4 flex flex-col gap-2 rounded-xl bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-600">Need the template?</span>
          <button className="flex items-center gap-2 text-xs font-semibold text-[#2D7A4F] hover:underline">
            <Download size={13} />
            {' '}
            Download Template
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-sm font-bold text-[#0f1f2e] mb-4">Upload History</h3>
        <div className="space-y-2">
          {[
            {
              file: 'attendance_march_w3.xlsx', date: '18 Mar 2026', records: 248, status: 'success',
            },
            {
              file: 'attendance_march_w2.xlsx', date: '11 Mar 2026', records: 245, status: 'success',
            },
            {
              file: 'attendance_march_w1.xlsx', date: '04 Mar 2026', records: 241, status: 'error',
            },
          ].map((upload, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl bg-gray-50 p-3 sm:flex-row sm:items-center">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-[10px] font-bold">XLS</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800">{upload.file}</p>
                <p className="text-[10px] text-gray-400">
                  {upload.date}
                  {' '}
                  ·
                  {' '}
                  {upload.records}
                  {' '}
                  records
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${upload.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {upload.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
