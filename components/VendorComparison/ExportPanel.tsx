// /* eslint-disable @typescript-eslint/no-explicit-any */

// 'use client';

// import { useState } from 'react';
// import Icon from '@/components/ui/AppIcon';

// interface ExportPanelProps {
//   selectedVendors: string[];
//   onExport: (format: string, options: ExportOptions) => void;
// }

// interface ExportOptions {
//   includeCharts: boolean;
//   includeMetrics: boolean;
//   includeSummary: boolean;
//   includeRecommendations: boolean;
// }

// const ExportPanel = ({ selectedVendors, onExport }: ExportPanelProps) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [exportFormat, setExportFormat] = useState('pdf');
//   const [options, setOptions] = useState<ExportOptions>({
//     includeCharts: true,
//     includeMetrics: true,
//     includeSummary: true,
//     includeRecommendations: true,
//   });

//   const formats = [
//     { value: 'pdf', label: 'PDF Report', icon: 'DocumentTextIcon' },
//     { value: 'excel', label: 'Excel Spreadsheet', icon: 'TableCellsIcon' },
//     { value: 'csv', label: 'CSV Data', icon: 'DocumentIcon' },
//   ];

//   const handleExport = () => {
//     onExport(exportFormat, options);
//     setIsOpen(false);
//   };

//   const handleOptionToggle = (key: keyof ExportOptions) => {
//     setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   return (
//     <div className="relative">
//       {/* <button
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         disabled={selectedVendors.length === 0}
//         className={`flex items-center gap-2 px-4 py-2
//         rounded-md transition-colors duration-fast text-sm ${
//           selectedVendors.length === 0
//             ? 'bg-muted text-text-secondary cursor-not-allowed'
//             : 'bg-[#383838] text-primary-foreground hover:bg-primary/90'
//         }`}
//       >
//         <Icon name="ArrowDownTrayIcon" size={20} />
//         <span>Export Comparison</span>
//       </button> */}

//       {isOpen && (
//         <>
//           <div
//             className="fixed inset-0 z-backdrop"
//             onClick={() => setIsOpen(false)}
//             aria-hidden="true"
//           />
//           <div className="absolute right-0 top-full mt-2 w-80 bg-popover
// border border-border rounded-lg shadow-modal z-dropdown">
//             <div className="p-4 border-b border-border">
//               <h3 className="text-sm font-semibold text-text-primary">Export Options</h3>
//             </div>

//             <div className="p-4 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-text-primary mb-2">
//                   Export Format
//                 </label>
//                 <div className="space-y-2">
//                   {formats.map((format) => (
//                     <button
//                       type="button"
//                       key={format.value}
//                       onClick={() => setExportFormat(format.value)}
//                       className={`w-full flex items-center gap-3 p-3 r
// ounded-md border transition-colors duration-fast ${
//                         exportFormat === format.value
//                           ? 'border-primary bg-primary/10'
//                           : 'border-border hover:bg-muted'
//                       }`}
//                     >
//                       <Icon
//                         name={format.icon as 'DocumentTextIcon' |
// 'TableCellsIcon' | 'DocumentIcon'}
//                         size={20}
//                         className={
//                           exportFormat === format.value ? 'text-primary' : 'text-text-secondary'
//                         }
//                       />
//                       <span
//                         className={`text-sm ${
//                           exportFormat === format.value
//                             ? 'text-primary font-medium'
//                             : 'text-text-primary'
//                         }`}
//                       >
//                         {format.label}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-text-primary mb-2">
//                   Include in Export
//                 </label>
//                 <div className="space-y-2">
//                   {Object.entries(options).map(([key, value]) => (
//                     <label key={key} className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={value}
//                         onChange={() => handleOptionToggle(key as keyof ExportOptions)}
//                         className="w-4 h-4 text-primary border-border
// rounded focus:ring-primary"
//                       />
//                       <span className="text-sm text-text-primary">
//                         {key.replace(/([A-Z])/g, ' $1').replace(/^./,
// (str) => str.toUpperCase())}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 border-t border-border flex gap-2">
//               <button
//                 type="button"
//                 onClick={() => setIsOpen(false)}
//                 className="flex-1 px-4 py-2 text-sm text-text-secondary border border-border
// rounded-md hover:bg-muted transition-colors duration-fast"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleExport}
//                 className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground
// rounded-md hover:bg-primary/90 transition-colors duration-fast"
//               >
//                 Export
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ExportPanel;
