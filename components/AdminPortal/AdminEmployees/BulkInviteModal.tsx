'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  X, Download, Upload, CheckCircle, XCircle, Loader2,
  FileSpreadsheet, AlertTriangle, ChevronRight, Users,
  ArrowLeft, FileDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { bulkInviteEmployees, getInviteMasterData } from '@/lib/service/employee';

// ── Types ─────────────────────────────────────────────────────────────────────
interface BulkInviteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  row: number;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  designation?: string;
  employment_type?: string;
  date_of_joining: string;
  reporting_manager?: string;
  gender?: string;
  personal_phone?: string;
  employee_code?: string;
}

interface ImportResult {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    row: number;
    email: string;
    employee_code?: string;
    success: boolean;
    error?: string;
  }>;
}

// ── Required Excel columns ────────────────────────────────────────────────────
const REQUIRED_COLS = ['email', 'first_name', 'last_name', 'department', 'date_of_joining'];
const ALL_COLS = [
  'email', 'first_name', 'last_name', 'department', 'designation',
  'employment_type', 'date_of_joining', 'reporting_manager',
  'gender', 'personal_phone', 'employee_code',
];

const EMPLOYMENT_TYPE_OPTIONS = ['full_time', 'probation', 'intern', 'part_time', 'contract'];

// ── Template generator ────────────────────────────────────────────────────────
async function downloadTemplate(masterData: any) {
  const XLSX = await import('xlsx');

  const depts = (masterData?.departments || []).map((d: any) => d.name);
  const designations = (masterData?.designations || []).map((d: any) => d.name);
  const managers = (masterData?.employees || []).map((e: any) => e.name);

  const sampleDept = depts[0] || 'HR';
  const sampleDesg = designations[0] || 'HR';
  const sampleManager = managers[0] || '';

  // Sheet 1: Employees — editable, with sample row using actual tenant values
  const employeesData = [
    ALL_COLS, // header row
    [
      'john.doe@company.com', 'John', 'Doe', sampleDept, sampleDesg,
      'full_time', '2026-08-01', sampleManager, 'Male', '+91 9876543210', '',
    ],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(employeesData);
  // Style header row width
  ws1['!cols'] = ALL_COLS.map((col) => ({
    wch: Math.max(col.length + 4, 18),
  }));

  // Sheet 2: Reference — read-only hints


  const maxLen = Math.max(depts.length, designations.length, EMPLOYMENT_TYPE_OPTIONS.length, managers.length, 1);

  const refHeader = ['Departments', 'Designations', 'Employment Types', 'Reporting Managers'];
  const refRows: string[][] = [];
  for (let i = 0; i < maxLen; i++) {
    refRows.push([
      depts[i] || '',
      designations[i] || '',
      EMPLOYMENT_TYPE_OPTIONS[i] || '',
      managers[i] || '',
    ]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet([refHeader, ...refRows]);
  ws2['!cols'] = refHeader.map(() => ({ wch: 28 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Employees');
  XLSX.utils.book_append_sheet(wb, ws2, 'Reference');

  XLSX.writeFile(wb, 'bulk_employee_invite_template.xlsx');
}

// ── File parser ───────────────────────────────────────────────────────────────
async function parseUploadedFile(file: File): Promise<ParsedRow[]> {
  const XLSX = await import('xlsx');

  const buffer = await file.arrayBuffer();

  // Support both .xlsx and .csv (from Google Sheets export)
  const workbook = XLSX.read(buffer, { type: 'array', dateNF: 'yyyy-mm-dd' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawRows.length) throw new Error('No data rows found in the file');

  // Normalize keys: trim, lowercase, replace spaces with underscores
  return rawRows.map((raw: any, idx) => {
    const norm: any = {};
    for (const key of Object.keys(raw)) {
      const normalKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      norm[normalKey] = typeof raw[key] === 'string' ? raw[key].trim() : String(raw[key]);
    }
    return {
      row: idx + 2, // 1-based, +1 for header
      email: norm.email || '',
      first_name: norm.first_name || '',
      last_name: norm.last_name || '',
      department: norm.department || '',
      designation: norm.designation || undefined,
      employment_type: norm.employment_type || 'full_time',
      date_of_joining: norm.date_of_joining || '',
      reporting_manager: norm.reporting_manager || undefined,
      gender: norm.gender || undefined,
      personal_phone: norm.personal_phone || undefined,
      employee_code: norm.employee_code || undefined,
    } as ParsedRow;
  });
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function BulkInviteModal({ onClose, onSuccess }: BulkInviteModalProps) {
  const { subdomain } = useParams();
  const tenantId = subdomain as string;

  const [step, setStep] = useState<'instructions' | 'upload' | 'results'>('instructions');
  const [masterData, setMasterData] = useState<any>(null);
  const [masterLoading, setMasterLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load master data for template reference sheet
  const loadMasterData = useCallback(async () => {
    if (masterData) return masterData;
    setMasterLoading(true);
    try {
      const res = await getInviteMasterData(tenantId);
      const data = res?.data?.data || res?.data || res;
      setMasterData(data);
      return data;
    } catch {
      toast.error('Failed to load reference data');
      return null;
    } finally {
      setMasterLoading(false);
    }
  }, [tenantId, masterData]);

  const handleDownloadTemplate = async () => {
    const data = await loadMasterData();
    if (!data) return;
    try {
      await downloadTemplate(data);
      toast.success('Template downloaded!');
    } catch (e: any) {
      toast.error('Failed to generate template: ' + e.message);
    }
  };

  const handleFile = async (file: File) => {
    setParseError(null);
    setParsedRows([]);
    setFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setParseError('Unsupported file type. Please upload .xlsx, .xls, or .csv');
      return;
    }

    try {
      const rows = await parseUploadedFile(file);

      // Validate required columns from first row
      const firstRow = rows[0] as any;
      const missing = REQUIRED_COLS.filter(col => !(col in firstRow) && !firstRow[col]);
      if (missing.length) {
        setParseError(`Missing required columns: ${missing.join(', ')}`);
        return;
      }

      // Filter out empty rows
      const validRows = rows.filter(r => r.email || r.first_name);
      if (!validRows.length) {
        setParseError('No valid data rows found');
        return;
      }

      setParsedRows(validRows);
      setStep('upload');
    } catch (e: any) {
      setParseError(e.message || 'Failed to parse file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await bulkInviteEmployees(parsedRows, tenantId);
      const data = res?.data?.data || res?.data || res;
      setResult(data);
      setStep('results');
      if (data?.succeeded > 0) {
        onSuccess();
      }
    } catch (e: any) {
      toast.error(e?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!result) return;
    const failed = result.results.filter(r => !r.success);
    const csvLines = [
      'Row,Email,Error',
      ...failed.map(r => `${r.row},"${r.email}","${(r.error || '').replace(/"/g, "'")}"`)
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bulk_invite_errors_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-700 to-teal-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Bulk Employee Invite</h2>
              <p className="text-[11px] text-teal-100 mt-0.5">
                {step === 'instructions' ? 'Download template → Fill → Upload'
                  : step === 'upload' ? `${parsedRows.length} employees ready to import`
                  : 'Import complete'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
          {(['instructions', 'upload', 'results'] as const).map((s, idx) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                step === s ? 'text-teal-700' : idx < ['instructions','upload','results'].indexOf(step) ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s ? 'bg-teal-600 text-white' : idx < ['instructions','upload','results'].indexOf(step) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {idx < ['instructions','upload','results'].indexOf(step) ? '✓' : idx + 1}
                </div>
                {s === 'instructions' ? 'Template' : s === 'upload' ? 'Review & Import' : 'Results'}
              </div>
              {idx < 2 && <ChevronRight size={12} className="text-slate-300" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Step 1: Instructions ─────────────────────────────── */}
          {step === 'instructions' && (
            <div className="p-6 space-y-5">
              {/* Instruction steps */}
              <div className="space-y-3">
                {[
                  { num: '1', text: 'Download the template below. It includes an Employees sheet and a Reference sheet with your departments, designations, and manager names.' },
                  { num: '2', text: 'Fill in the Employees sheet only. Use names or IDs for Department, Designation, and Reporting Manager. Employee codes are auto-generated if left empty.' },
                  { num: '3', text: 'Do not modify the column headers or the Reference sheet.' },
                  { num: '4', text: 'Save as .xlsx or export as .csv from Google Sheets, then upload the file.' },
                ].map(item => (
                  <div key={item.num} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-teal-700">{item.num}</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Required fields callout */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-800 mb-2">Required columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {REQUIRED_COLS.map(col => (
                    <span key={col} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[11px] font-mono font-semibold">{col}</span>
                  ))}
                </div>
                <p className="text-[11px] text-amber-600 mt-2">All other columns are optional — defaults from your policy mapping will be applied automatically.</p>
              </div>

              {/* Google Sheets note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                <AlertTriangle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <span className="font-bold">Google Sheets users:</span> After filling the template, go to <span className="font-mono bg-blue-100 px-1 rounded">File → Download → CSV (.csv)</span> and upload the CSV file here.
                </p>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownloadTemplate}
                disabled={masterLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                {masterLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {masterLoading ? 'Preparing template…' : 'Download Template (.xlsx)'}
              </button>

              {/* Upload area */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 text-center">— then upload the filled file —</p>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50'
                  }`}
                >
                  <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Drag & drop your file here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports .xlsx, .xls, .csv (Google Sheets export)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  />
                </div>

                {parseError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{parseError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Review & Import ──────────────────────────── */}
          {step === 'upload' && (
            <div className="p-6 space-y-5">
              {/* File info */}
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                <FileSpreadsheet size={18} className="text-teal-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-teal-800 truncate">{fileName}</p>
                  <p className="text-xs text-teal-600">{parsedRows.length} employee rows detected</p>
                </div>
                <button
                  onClick={() => { setStep('instructions'); setParsedRows([]); setFileName(''); }}
                  className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={12} /> Change file
                </button>
              </div>

              {/* Preview table */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Preview (first 5 rows)</p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['#', 'Email', 'Name', 'Department', 'Type', 'Join Date', 'Manager'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-400">{row.row}</td>
                          <td className="px-3 py-2 text-slate-700 max-w-[140px] truncate">{row.email}</td>
                          <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.first_name} {row.last_name}</td>
                          <td className="px-3 py-2 text-slate-600 max-w-[100px] truncate">{row.department}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono whitespace-nowrap">
                              {row.employment_type || 'full_time'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.date_of_joining}</td>
                          <td className="px-3 py-2 text-slate-500 max-w-[100px] truncate">{row.reporting_manager || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 5 && (
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
                      <p className="text-[11px] text-slate-400 text-center">…and {parsedRows.length - 5} more rows</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Default policy mappings will be applied automatically per employment type. Each row is processed independently — failed rows won't block successful ones.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: Results ──────────────────────────────────── */}
          {step === 'results' && result && (
            <div className="p-6 space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{result.total}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Total</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{result.succeeded}</p>
                  <p className="text-xs text-emerald-600 mt-0.5 font-semibold">Imported</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${result.failed > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-700' : 'text-slate-400'}`}>{result.failed}</p>
                  <p className={`text-xs mt-0.5 font-semibold ${result.failed > 0 ? 'text-red-500' : 'text-slate-400'}`}>Failed</p>
                </div>
              </div>

              {/* Success message */}
              {result.succeeded > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <p className="text-sm text-emerald-700 font-medium">
                    {result.succeeded} employee{result.succeeded !== 1 ? 's' : ''} invited successfully. Invitation emails have been sent.
                  </p>
                </div>
              )}

              {/* Failed rows table */}
              {result.failed > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">Failed Rows</p>
                  <div className="overflow-x-auto rounded-xl border border-red-100">
                    <table className="w-full text-xs">
                      <thead className="bg-red-50 border-b border-red-100">
                        <tr>
                          {['Row', 'Email', 'Reason'].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-red-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.filter(r => !r.success).map((r) => (
                          <tr key={r.row} className="border-b border-red-50 last:border-0">
                            <td className="px-3 py-2 text-slate-500 font-mono">{r.row}</td>
                            <td className="px-3 py-2 text-slate-700 max-w-[140px] truncate">{r.email}</td>
                            <td className="px-3 py-2 text-red-600">{r.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-200 rounded-xl transition-all"
          >
            {step === 'results' ? 'Close' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            {step === 'results' && result?.failed > 0 && (
              <button
                onClick={handleDownloadErrorReport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all"
              >
                <FileDown size={14} />
                Download Error Report
              </button>
            )}

            {step === 'upload' && (
              <button
                onClick={handleImport}
                disabled={importing || parsedRows.length === 0}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
              >
                {importing ? (
                  <><Loader2 size={14} className="animate-spin" /> Importing…</>
                ) : (
                  <><Users size={14} /> Import {parsedRows.length} Employee{parsedRows.length !== 1 ? 's' : ''}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
