import React, { useState } from 'react';
import { Book, Student, IssueRecord } from '../types';
import { 
  FileText, 
  ArrowDownToLine, 
  TrendingUp, 
  BookMarked, 
  RefreshCw, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle,
  Inbox,
  Lock
} from 'lucide-react';

interface ReportsProps {
  books: Book[];
  students: Student[];
  records: IssueRecord[];
}

export default function Reports({ books, students, records }: ReportsProps) {
  const [reportType, setReportType] = useState<'inventory' | 'loans' | 'fines'>('inventory');

  // Metrics summary
  const totalBooksCount = books.reduce((acc, b) => acc + b.copiesTotal, 0);
  const totalUniqueBooks = books.length;
  const totalIssuedBooks = records.filter(r => r.status === 'Issued' || r.status === 'Overdue').length;
  const totalReturnedBooks = records.filter(r => r.status === 'Returned').length;
  const totalOverdueBooks = records.filter(r => r.status === 'Overdue').length;

  // Fines Calculations
  const collectedFines = records
    .filter(r => r.fineAmount > 0 && r.finePaid)
    .reduce((acc, r) => acc + r.fineAmount, 0);

  const pendingFines = records
    .filter(r => r.fineAmount > 0 && !r.finePaid)
    .reduce((acc, r) => acc + r.fineAmount, 0);

  // Helper: Export current data as CSV
  const handleExportCSV = () => {
    let csvContent = "";
    
    if (reportType === 'inventory') {
      csvContent += "Book ID,Title,Author,ISBN,Category,Publisher,Year,Total Copies,Available Copies,Shelf Location\n";
      books.forEach(b => {
        csvContent += `"${b.id}","${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}","${b.isbn}","${b.category}","${b.publisher}","${b.year}","${b.copiesTotal}","${b.copiesAvailable}","${b.location}"\n`;
      });
    } else if (reportType === 'loans') {
      csvContent += "Record ID,Book ID,Book Title,Student ID,Student Name,Issue Date,Due Date,Return Date,Fine Amount,Fine Paid,Status\n";
      records.forEach(r => {
        csvContent += `"${r.id}","${r.bookId}","${r.bookTitle.replace(/"/g, '""')}","${r.studentId}","${r.studentName.replace(/"/g, '""')}","${r.issueDate}","${r.dueDate}","${r.returnDate || 'N/A'}","${r.fineAmount}","${r.finePaid ? 'Yes' : 'No'}","${r.status}"\n`;
      });
    } else {
      csvContent += "Record ID,Student Name,Book Title,Overdue Fines (₹),Paid Status\n";
      records.filter(r => r.fineAmount > 0).forEach(r => {
        csvContent += `"${r.id}","${r.studentName.replace(/"/g, '""')}","${r.bookTitle.replace(/"/g, '""')}","${r.fineAmount}","${r.finePaid ? 'Paid' : 'Unpaid'}"\n`;
      });
    }

    // Modern CSV downloader using browser Blobs
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hoysala_library_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffef7] border-2 border-[#a88d55]/40 p-6 rounded-2xl animate-fadeIn shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#462d0e] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#78521b]" />
            Report Management Console
          </h1>
          <p className="text-sm text-[#78521b] mt-1 font-medium">
            Generate printable grids, monitor library operations, ledger status, and export catalog CSV files.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="parchment-btn flex items-center gap-1.5 transition-all text-xs font-black shadow-sm"
        >
          <ArrowDownToLine className="w-4 h-4 text-[#fdf6e2]" />
          Export Report (.CSV)
        </button>
      </div>

      {/* Reports mini cards tab select */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#fffef7] border-2 border-[#a88d55]/40 p-2 rounded-2xl shadow-sm">
        <button
          onClick={() => setReportType('inventory')}
          className={`px-4 py-3.5 text-xs font-bold rounded-xl transition-all text-left flex items-center gap-2.5 cursor-pointer ${
            reportType === 'inventory'
              ? 'bg-[#78521b]/10 text-[#462d0e] font-black border-2 border-[#78521b]/30'
              : 'text-[#78521b]/80 hover:bg-[#78521b]/5 hover:text-[#462d0e]'
          }`}
        >
          <BookMarked className="w-4 h-4 text-[#78521b]" />
          <div>
            <div className="font-extrabold text-[#462d0e]">Books Inventory Report</div>
            <div className="text-[10px] font-semibold text-[#78521b]/70">{totalBooksCount} copies registered</div>
          </div>
        </button>

        <button
          onClick={() => setReportType('loans')}
          className={`px-4 py-3.5 text-xs font-bold rounded-xl transition-all text-left flex items-center gap-2.5 cursor-pointer ${
            reportType === 'loans'
              ? 'bg-[#78521b]/10 text-[#462d0e] font-black border-2 border-[#78521b]/30'
              : 'text-[#78521b]/80 hover:bg-[#78521b]/5 hover:text-[#462d0e]'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-[#78521b]" />
          <div>
            <div className="font-extrabold text-[#462d0e]">Active Loans & Returns</div>
            <div className="text-[10px] font-semibold text-[#78521b]/70">{totalIssuedBooks} active, {totalReturnedBooks} returned</div>
          </div>
        </button>

        <button
          onClick={() => setReportType('fines')}
          className={`px-4 py-3.5 text-xs font-bold rounded-xl transition-all text-left flex items-center gap-2.5 cursor-pointer ${
            reportType === 'fines'
              ? 'bg-[#78521b]/10 text-[#462d0e] font-black border-2 border-[#78521b]/30'
              : 'text-[#78521b]/80 hover:bg-[#78521b]/5 hover:text-[#462d0e]'
          }`}
        >
          <IndianRupee className="w-4 h-4 text-[#78521b]" />
          <div>
            <div className="font-extrabold text-[#462d0e]">Fines & Ledger Report</div>
            <div className="text-[10px] font-semibold text-[#78521b]/70">₹{collectedFines.toFixed(1)} collected, ₹{pendingFines.toFixed(1)} pending</div>
          </div>
        </button>
      </div>

      {/* Numerical Data summary overview charts based on tab selection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-[#fffef7] border-2 border-[#a88d55]/40 p-5 rounded-2xl flex flex-col justify-between gap-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="font-black text-[#462d0e] text-xs uppercase tracking-wider border-b-2 border-[#78521b]/20 pb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#78521b]" />
              Summary Indices
            </h3>
            
            <div className="space-y-4 text-xs font-bold text-[#462d0e]">
              <div className="flex justify-between items-center bg-[#fdfcf3] p-2.5 rounded-xl border border-[#a88d55]/30">
                <span className="text-[#78521b]">Total Unique Volumes:</span>
                <span className="font-mono font-black text-[#462d0e] text-sm">{totalUniqueBooks}</span>
              </div>
              <div className="flex justify-between items-center bg-[#fdfcf3] p-2.5 rounded-xl border border-[#a88d55]/30">
                <span className="text-[#78521b]">Total Catalog Inventory:</span>
                <span className="font-mono font-black text-[#462d0e] text-sm">{totalBooksCount}</span>
              </div>
              <div className="flex justify-between items-center bg-[#fdfcf3] p-2.5 rounded-xl border border-[#a88d55]/30">
                <span className="text-[#78521b]">Active Checked Out:</span>
                <span className="font-mono font-black text-[#78521b] text-sm">{totalIssuedBooks}</span>
              </div>
              <div className="flex justify-between items-center bg-[#fdfcf3] p-2.5 rounded-xl border border-[#a88d55]/30">
                <span className="text-[#78521b]">Return Rate:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {records.length > 0 ? `${Math.round((totalReturnedBooks / records.length) * 100)}%` : '100%'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#fdfcf3] p-2.5 rounded-xl border border-[#a88d55]/30">
                <span className="text-red-700">Overdue Incidents:</span>
                <span className="font-mono font-black text-red-850 text-sm">{totalOverdueBooks}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#fcf7ea] border border-[#a88d55]/35 rounded-xl p-3 text-[10px] text-[#78521b] space-y-1 font-semibold leading-relaxed">
            <div className="font-extrabold text-[#462d0e] uppercase tracking-wide">Dynamic Aggregates</div>
            <p>Calculated dynamic records of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. File downloads generated directly dynamically.</p>
          </div>
        </div>

        {/* Tab specific detail lists table */}
        <div className="lg:col-span-3 bg-[#fffef7] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md">
          {reportType === 'inventory' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-[#78521b]/20">
                <thead className="bg-[#fcf7ea] text-[10px] font-bold text-[#78521b] uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Shelf location</th>
                    <th className="px-6 py-4 text-center">Remaining Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#78521b]/10 text-xs text-[#2b1a05] font-bold">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-[#78521b]/5 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-black text-[#462d0e] text-sm truncate max-w-[250px]">{b.title}</div>
                        <div className="text-[10px] text-[#78521b]/80 mt-0.5">{b.author} • ISBN: {b.isbn}</div>
                      </td>
                      <td className="px-6 py-4 text-[#78521b] font-black">{b.category}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-[#78521b]">{b.location}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                          b.copiesAvailable === 0 
                            ? 'bg-rose-500/10 border-rose-500/15 text-rose-800' 
                            : b.copiesAvailable <= 1 
                              ? 'bg-amber-500/10 border-amber-500/15 text-amber-900'
                              : 'bg-emerald-500/10 border-emerald-505/15 text-emerald-800'
                        }`}>
                          {b.copiesAvailable} / {b.copiesTotal} available
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'loans' && (
            <div className="overflow-x-auto font-sans">
              <table className="min-w-full divide-y-2 divide-[#78521b]/20">
                <thead className="bg-[#fcf7ea] text-[10px] font-bold text-[#78521b] uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-4">Record ID</th>
                    <th className="px-6 py-4">Borrower Details</th>
                    <th className="px-6 py-4">Catalogue Item</th>
                    <th className="px-6 py-4">Timeline dates</th>
                    <th className="px-6 py-4 text-right">Status State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#78521b]/10 text-xs text-[#2b1a05] font-bold container_scroll">
                  {records.map((r) => {
                    const isOverdue = r.status === 'Overdue';
                    const isReturned = r.status === 'Returned';
                    return (
                      <tr key={r.id} className="hover:bg-[#78521b]/5 transition-all">
                        <td className="px-6 py-4 font-mono text-[10px] text-[#78521b] font-bold">{r.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-[#462d0e] text-xs">{r.studentName}</div>
                          <div className="text-[10px] text-[#78521b] font-mono mt-0.5">{r.studentId}</div>
                        </td>
                        <td className="px-6 py-4 truncate max-w-[170px]">
                          <div className="font-black text-[#462d0e] truncate">{r.bookTitle}</div>
                          <div className="text-[10px] text-[#78521b] font-mono mt-0.5">Book: {r.bookId}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-[#78521b] space-y-0.5 font-bold">
                          <div>Issued: <span className="font-extrabold text-[#462d0e]">{r.issueDate}</span></div>
                          <div>Due: <span className="font-extrabold text-[#462d0e]">{r.dueDate}</span></div>
                          {r.returnDate && <div>Returned: <span className="font-extrabold text-emerald-800">{r.returnDate}</span></div>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded border ${
                            isReturned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' : isOverdue ? 'bg-rose-500/10 border-rose-500/20 text-rose-800' : 'bg-indigo-505/10 border-indigo-505/20 text-[#78521b]'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'fines' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-[#78521b]/20">
                <thead className="bg-[#fcf7ea] text-[10px] font-bold text-[#78521b] uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-4">Record ID</th>
                    <th className="px-6 py-4">Borrower Name</th>
                    <th className="px-6 py-4">Lent catalogue title</th>
                    <th className="px-6 py-4 text-center">Fines Amount Due</th>
                    <th className="px-6 py-4 text-right">Settlement status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#78521b]/10 text-xs text-[#2b1a05] font-bold">
                  {records.filter(r => r.fineAmount > 0).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#78521b] font-bold font-sans">
                        <Inbox className="w-12 h-12 mx-auto stroke-1 text-[#78521b]/50 mb-3" />
                        Pristine financial book registers. No fines collected or due!
                      </td>
                    </tr>
                  ) : (
                    records.filter(r => r.fineAmount > 0).map((r) => (
                      <tr key={r.id} className="hover:bg-[#78521b]/5 transition-all">
                        <td className="px-6 py-4 font-mono text-[10px] text-[#78521b] font-bold">{r.id}</td>
                        <td className="px-6 py-4 font-black text-[#462d0e]">{r.studentName}</td>
                        <td className="px-6 py-4 truncate max-w-[200px] text-[#462d0e] font-black">{r.bookTitle}</td>
                        <td className="px-6 py-4 text-center font-mono font-black text-sm text-[#462d0e]">
                          ₹{r.fineAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-1 text-[10px] font-black rounded-xl border ${
                            r.finePaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-900'
                          }`}>
                            {r.finePaid ? 'Resolved & Settled Fully' : 'Outstanding Payment'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
