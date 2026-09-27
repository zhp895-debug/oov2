import React, { useState } from 'react';
import { Modal } from './Modal';
import { Download, FileSpreadsheet, FileCode, Printer, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  filename?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  filename = 'OliveOrange_Report'
}) => {
  const [exported, setExported] = useState(false);

  const downloadCSV = () => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h];
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export ${title}`}
      subtitle={`Export ${data.length} records in standard formats`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        <p className="text-gray-600 font-medium">
          Choose your preferred export format. CSV files can be opened directly in Microsoft Excel or Google Sheets.
        </p>

        {exported && (
          <div className="p-3 bg-amber-50 text-[#3D4A1E] rounded-lg border border-amber-200 font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#EA580C]" />
            <span>File downloaded successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={downloadCSV}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#3D4A1E] hover:bg-amber-50/50 text-gray-800 transition-all cursor-pointer group"
          >
            <FileSpreadsheet className="w-8 h-8 text-[#3D4A1E] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Export CSV / Excel</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Spreadsheet Format</span>
          </button>

          <button
            onClick={downloadJSON}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#3D4A1E] hover:bg-amber-50/50 text-gray-800 transition-all cursor-pointer group"
          >
            <FileCode className="w-8 h-8 text-[#EA580C] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Export JSON</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Structured Data</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-[#3D4A1E] hover:bg-amber-50/50 text-gray-800 transition-all cursor-pointer group"
          >
            <Printer className="w-8 h-8 text-gray-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Print / PDF</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Browser Print</span>
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
