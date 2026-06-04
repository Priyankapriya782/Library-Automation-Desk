import React, { useState } from 'react';
import { Book, Student, IssueRecord } from '../types';
import { 
  ArrowLeftRight, 
  BookOpen, 
  UserCheck, 
  CalendarDays, 
  Search, 
  AlertCircle, 
  RotateCcw, 
  Bookmark, 
  IndianRupee, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  X,
  Send
} from 'lucide-react';
import { calculateOverdueFine } from '../data';

interface IssueReturnModuleProps {
  books: Book[];
  students: Student[];
  records: IssueRecord[];
  onIssueBook: (bookId: string, studentId: string, dueDate: string) => void;
  onReturnBook: (recordId: string, returnDate: string, settleFineNow: boolean) => void;
  onPayFine: (recordId: string) => void;
  onApproveRequest?: (recordId: string) => void;
  onDeclineRequest?: (recordId: string) => void;
}

export default function IssueReturnModule({ 
  books, 
  students, 
  records, 
  onIssueBook, 
  onReturnBook,
  onPayFine,
  onApproveRequest,
  onDeclineRequest
}: IssueReturnModuleProps) {
  const [activeTab, setActiveTab] = useState<'issue' | 'return' | 'requests'>('issue');

  // Dynamic system current date
  const todayStr = new Date().toISOString().split('T')[0];

  // Issue Form States
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueBookId, setIssueBookId] = useState('');
  
  // Set default due/return date to 1 week (7 days) from today
  const [issueDueDate, setIssueDueDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [issueSearchStudent, setIssueSearchStudent] = useState('');
  const [issueSearchBook, setIssueSearchBook] = useState('');
  
  const [issueSuccessMsg, setIssueSuccessMsg] = useState('');
  const [issueErrorMsg, setIssueErrorMsg] = useState('');

  // Return Module Search States
  const [returnSearchText, setReturnSearchText] = useState('');

  // Settle Fine during return modal helper state
  const [returningRecord, setReturningRecord] = useState<IssueRecord | null>(null);
  const [settleFineNow, setSettleFineNow] = useState(true);

  // Lists for drop selections
  const activeStudents = students.filter(s => s.status === 'Active');
  const itemsInStock = books.filter(b => b.copiesAvailable > 0);

  // Filter Student query lists (Issue Tab)
  const filteredStudentsForIssue = activeStudents.filter(s => 
    s.name.toLowerCase().includes(issueSearchStudent.toLowerCase()) ||
    s.id.toLowerCase().includes(issueSearchStudent.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(issueSearchStudent.toLowerCase())
  );

  // Filter Book logs (Issue Tab)
  const filteredBooksForIssue = itemsInStock.filter(b => 
    b.title.toLowerCase().includes(issueSearchBook.toLowerCase()) ||
    b.id.toLowerCase().includes(issueSearchBook.toLowerCase()) ||
    b.isbn.includes(issueSearchBook)
  );

  // Filter active recordings (Return Tab)
  const activeLendings = records.filter(r => r.status === 'Issued' || r.status === 'Overdue');
  const filteredLendings = activeLendings.filter(r => 
    r.studentName.toLowerCase().includes(returnSearchText.toLowerCase()) ||
    r.bookTitle.toLowerCase().includes(returnSearchText.toLowerCase()) ||
    r.bookId.toLowerCase().includes(returnSearchText.toLowerCase()) ||
    r.studentId.toLowerCase().includes(returnSearchText.toLowerCase()) ||
    r.id.toLowerCase().includes(returnSearchText.toLowerCase())
  );

  // Handle book issue
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueErrorMsg('');
    setIssueSuccessMsg('');

    if (!issueStudentId) {
      setIssueErrorMsg('Please pick a student to issue the book to.');
      return;
    }
    if (!issueBookId) {
      setIssueErrorMsg('Please pick a book catalogue from in-stock items.');
      return;
    }
    if (!issueDueDate) {
      setIssueErrorMsg('Please select a valid Return Deadline Date.');
      return;
    }

    // Verify student is active and not frozen
    const stu = students.find(s => s.id === issueStudentId);
    if (!stu) {
      setIssueErrorMsg('Selected student does not exist.');
      return;
    }
    if (stu.status === 'Suspended') {
      setIssueErrorMsg('This student profile is currently suspended and cannot inherit checkout privileges.');
      return;
    }

    // Verify book is indeed in stock
    const bk = books.find(b => b.id === issueBookId);
    if (!bk || bk.copiesAvailable === 0) {
      setIssueErrorMsg('Selected book has no copies available for checkout.');
      return;
    }

    // Check if student already has this book issued
    const studentReadyIssuedThisBook = activeLendings.some(r => r.studentId === issueStudentId && r.bookId === issueBookId);
    if (studentReadyIssuedThisBook) {
      setIssueErrorMsg(`This student already has an active copy of "${bk.title}" checked out.`);
      return;
    }

    // Execute issuance
    onIssueBook(issueBookId, issueStudentId, issueDueDate);
    setIssueSuccessMsg(`Successfully issued "${bk.title}" to ${stu.name}! Form is reset.`);
    
    // Reset selection inputs
    setIssueBookId('');
    setIssueSearchBook('');
    setIssueSearchStudent('');
  };

  // Open Return processor helper
  const openReturnConfirmation = (record: IssueRecord) => {
    setReturningRecord(record);
    // Calculative check: is there a fine?
    const dynamicFine = calculateOverdueFine(record.dueDate, todayStr);
    setSettleFineNow(dynamicFine > 0);
  };

  const handleReturnSubmission = () => {
    if (!returningRecord) return;
    
    onReturnBook(returningRecord.id, todayStr, settleFineNow);
    setReturningRecord(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffef7] border-2 border-[#a88d55]/40 p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-black text-[#462d0e] tracking-tight flex items-center gap-2 uppercase">
            <ArrowLeftRight className="w-6 h-6 text-[#78521b]" />
            Issue & Return Module
          </h1>
          <p className="text-sm text-[#78521b] mt-1 font-semibold">
            Checkout available stock, manage loan agreements, track due dates and fines.
          </p>
        </div>

        {/* Action picker tab switchers */}
        <div className="flex bg-[#fdf6e2] border-2 border-[#a88d55]/50 rounded-2xl p-1 shrink-0 grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center justify-center gap-1 px-3 py-2 font-black text-xs rounded-xl transition-all cursor-pointer ${
              activeTab === 'issue'
                ? 'bg-[#78521b] text-[#fdf6e2] shadow-md border border-[#5c3f15]'
                : 'text-[#78521b] hover:bg-[#78521b]/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Issue Books
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex items-center justify-center gap-1 px-3 py-2 font-black text-xs rounded-xl transition-all cursor-pointer ${
              activeTab === 'return'
                ? 'bg-[#78521b] text-[#fdf6e2] shadow-md border border-[#5c3f15]'
                : 'text-[#78521b] hover:bg-[#78521b]/10'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Return Books
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center justify-center gap-1 px-3 py-2 font-black text-xs rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#78521b] text-[#fdf6e2] shadow-md border border-[#5c3f15]'
                : 'text-[#78521b] hover:bg-[#78521b]/10'
            }`}
          >
            <Send className="w-3 object-cover h-3" />
            Requests
            {records.filter(r => r.status === 'Requested').length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-700 text-[9px] font-extrabold text-white animate-pulse">
                {records.filter(r => r.status === 'Requested').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pick student card left */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="border-b-2 border-[#78521b]/20 pb-2">
                <h3 className="font-extrabold text-sm text-[#462d0e] uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#78521b]" />
                  1. Pick Borrower
                </h3>
              </div>

              {/* Search filter for selector */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-[#78521b]" />
                <input
                  type="text"
                  placeholder="Find student profile..."
                  value={issueSearchStudent}
                  onChange={(e) => setIssueSearchStudent(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-semibold text-[#2b1a05] placeholder-[#8c7855]"
                />
              </div>

              {/* Student choices listing */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredStudentsForIssue.length === 0 ? (
                  <p className="text-center py-6 text-[#78521b]/60 text-xs font-semibold">No active students found.</p>
                ) : (
                  filteredStudentsForIssue.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setIssueStudentId(s.id);
                        setIssueSearchStudent(s.name);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border-2 text-xs transition-all relative cursor-pointer ${
                        issueStudentId === s.id
                          ? 'bg-[#78521b]/10 border-[#78521b] text-[#462d0e]'
                          : 'bg-[#fdfcf3] border-[#a88d55]/30 text-[#462d0e]/90 hover:bg-[#78521b]/5'
                      }`}
                    >
                      <div className="font-extrabold flex justify-between">
                        <span>{s.name}</span>
                        <span className="text-[9px] font-mono font-bold text-[#78521b]">{s.id}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#78521b]/80 mt-1 font-semibold">
                        <span>Dept: {s.department}</span>
                        <span>Roll: {s.rollNo}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="border-t-2 border-[#78521b]/20 pt-3 mt-4 text-xs text-[#78521b] flex items-center justify-between font-bold">
              <span>Selected Borrower:</span>
              <span className={`font-black font-mono ${issueStudentId ? 'text-[#462d0e]' : 'text-[#8c7855]'}`}>
                {issueStudentId ? students.find(s=>s.id === issueStudentId)?.name : 'None (Select left)'}
              </span>
            </div>
          </div>

          {/* Pick book catalogue center */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="border-b-2 border-[#78521b]/20 pb-2">
                <h3 className="font-extrabold text-sm text-[#462d0e] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#78521b]" />
                  2. Pick Catalogue Book
                </h3>
              </div>

              {/* Search filter for selector */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-[#78521b]" />
                <input
                  type="text"
                  placeholder="Find catalogue in stock..."
                  value={issueSearchBook}
                  onChange={(e) => setIssueSearchBook(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-semibold text-[#2b1a05] placeholder-[#8c7855]"
                />
              </div>

              {/* Book choices list */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {filteredBooksForIssue.length === 0 ? (
                  <p className="text-center py-6 text-[#78521b]/60 text-xs font-semibold">No books available in stock.</p>
                ) : (
                  filteredBooksForIssue.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setIssueBookId(b.id);
                        setIssueSearchBook(b.title);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border-2 text-xs transition-all relative cursor-pointer ${
                        issueBookId === b.id
                          ? 'bg-[#78521b]/10 border-[#78521b] text-[#462d0e]'
                          : 'bg-[#fdfcf3] border-[#a88d55]/30 text-[#462d0e]/90 hover:bg-[#78521b]/5'
                      }`}
                    >
                      <div className="font-extrabold truncate text-[13px] text-[#462d0e]">{b.title}</div>
                      <div className="text-[10px] text-[#78521b] truncate font-mono mt-0.5 font-semibold">{b.author}</div>
                      <div className="flex justify-between items-center text-[10px] text-[#78521b] mt-1.5 pt-1 border-t border-[#78521b]/10 font-bold">
                        <span className="font-extrabold text-[#78521b] text-[9px] uppercase">{b.category}</span>
                        <span className="bg-emerald-500/10 text-emerald-800 px-1 py-0.5 rounded font-black text-[9px]">
                          {b.copiesAvailable} in-stock
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="border-t-2 border-[#78521b]/20 pt-3 mt-4 text-xs text-[#78521b] flex items-center justify-between select-none font-bold">
              <span>Selected Catalogue:</span>
              <span className={`font-black font-mono max-w-[150px] truncate block ${issueBookId ? 'text-[#462d0e]' : 'text-[#8c7855]'}`}>
                {issueBookId ? books.find(b=>b.id === issueBookId)?.title : 'None (Select left)'}
              </span>
            </div>
          </div>

          {/* Form Actions block right */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-5 rounded-2xl shadow-sm">
            <div className="border-b-2 border-[#78521b]/20 pb-2 mb-4">
              <h3 className="font-extrabold text-sm text-[#462d0e] uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#78521b]" />
                3. Finalize Agreement
              </h3>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-[#78521b] uppercase tracking-widest mb-1">
                  Agreement System Date
                </label>
                <input
                  type="text"
                  disabled
                  value={`${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (System Date)`}
                  className="block w-full px-3.5 py-2.5 bg-[#fdfbf2] border-2 border-[#a88d55]/30 rounded-xl text-[#78521b]/80 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[#78521b] uppercase tracking-widest mb-1">
                  Expected Return Deadline <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={issueDueDate}
                  onChange={(e) => setIssueDueDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-[#2b1a05] text-xs font-bold transition-all"
                />
                <span className="block mt-1 text-[10px] text-[#78521b] font-medium leading-normal">
                  Recommendation: Standard borrowing term is 7 days ({(() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    return nextWeek.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  })()}).
                </span>
              </div>

              {issueErrorMsg && (
                <div className="bg-red-950/15 border-2 border-red-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-red-900 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700 font-bold" />
                  <span>{issueErrorMsg}</span>
                </div>
              )}

              {issueSuccessMsg && (
                <div className="bg-emerald-500/10 border-2 border-emerald-500/25 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800 font-bold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                  <span>{issueSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-[#fdf6e2] bg-[#78521b] hover:bg-[#926628] border border-[#5c3f15] shadow-md transition-all cursor-pointer uppercase tracking-wider"
              >
                <Bookmark className="w-4 h-4 text-[#fdf6e2]" />
                Sign & Authorize Issue
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'return' && (
        <div className="space-y-4">
          {/* Filter options */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#78521b]" />
              <input
                type="text"
                placeholder="Find active loan records by Student name, Book name, Record tag..."
                value={returnSearchText}
                onChange={(e) => setReturnSearchText(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-[#2b1a05] placeholder-[#8c7855] text-xs transition-all"
              />
            </div>
            <div className="text-right text-[11px] text-[#78521b] font-mono hidden sm:block font-bold">
              Total active loans matches: <span className="text-[#462d0e] font-black">{filteredLendings.length}</span>
            </div>
          </div>

          {/* Table display */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md">
            <table className="min-w-full divide-y-2 divide-[#78521b]/20">
              <thead className="bg-[#fcf7ea] text-[10px] font-bold text-[#78521b] uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-4">Loan Record ID</th>
                  <th className="px-6 py-4">Borrower Name</th>
                  <th className="px-6 py-4">Book Title Code</th>
                  <th className="px-6 py-4 font-mono">Lend Date</th>
                  <th className="px-6 py-4 font-mono">Expected Due</th>
                  <th className="px-6 py-4 text-center">Current Fines</th>
                  <th className="px-6 py-4 text-right">Operation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#78521b]/10 text-xs text-[#2b1a05]">
                {filteredLendings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#78521b] font-bold">
                      <HelpCircle className="w-11 h-11 mx-auto stroke-1 text-[#78521b]/65 mb-2" />
                      No active lending record files detected matching query.
                    </td>
                  </tr>
                ) : (
                  filteredLendings.map((record) => {
                    const isOverdue = record.status === 'Overdue';
                    const computedFine = calculateOverdueFine(record.dueDate, todayStr);

                    return (
                      <tr key={record.id} className="hover:bg-[#78521b]/5 transition-all">
                        <td className="px-6 py-4 font-mono text-[10px] text-[#78521b] font-bold">
                          {record.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-[#462d0e] text-sm tracking-tight">{record.studentName}</div>
                          <div className="text-[10px] text-[#78521b] font-mono mt-0.5 font-bold">{record.studentId}</div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-extrabold text-[#462d0e] truncate">{record.bookTitle}</div>
                          <div className="text-[10px] text-[#78521b] font-mono mt-0.5 font-bold">Book ID: {record.bookId}</div>
                        </td>
                        <td className="px-6 py-4 font-mono tracking-tight text-[#78521b] font-bold">
                          {record.issueDate}
                        </td>
                        <td className="px-6 py-4 font-mono tracking-tight text-[#78521b] font-bold">
                          <span className={`px-2 py-0.5 rounded font-extrabold ${isOverdue ? 'bg-red-500/10 text-red-800 border-red-500/10' : ''}`}>
                            {record.dueDate}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          {computedFine > 0 ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-amber-800 font-black text-sm">₹{computedFine.toFixed(2)}</span>
                              <span className="text-[9px] font-extrabold text-red-700 animate-pulse font-sans">Accumulating fine</span>
                            </div>
                          ) : (
                            <span className="text-emerald-800 font-bold font-sans">No Fine (₹0.00)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Fine settlement controls */}
                            {record.fineAmount > 0 && !record.finePaid && (
                              <button
                                onClick={() => onPayFine(record.id)}
                                className="px-2.5 py-1.5 bg-amber-500/10 text-amber-900 hover:bg-amber-100 border border-amber-500/30 rounded-xl text-[10px] font-black transition-all flex items-center gap-0.5 cursor-pointer shadow-sm"
                                title="Process fine settlement"
                              >
                                <IndianRupee className="w-3 h-3 text-amber-800" />
                                Pay Fine
                              </button>
                            )}
                            <button
                              onClick={() => openReturnConfirmation(record)}
                              className="px-3 py-1.5 bg-[#78521b] hover:bg-[#926628] border border-[#5c3f15] text-[#fdf6e2] rounded-xl font-black text-[11px] hover:-translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                            >
                              <RotateCcw className="w-3 h-3 text-[#fdf6e2]" />
                              Process Return
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="w-full max-w-md text-xs">
              <span className="font-extrabold text-[#462d0e]">Pending Student Requests</span>
              <p className="text-[10px] text-[#78521b] leading-normal mt-0.5 font-semibold">Approve or decline book request files initiated by registered students.</p>
            </div>
            <div className="text-right text-[11px] text-[#78521b] font-mono hidden sm:block font-bold">
              Total waiting list: <span className="text-[#462d0e] font-black">{records.filter(r => r.status === 'Requested').length}</span>
            </div>
          </div>

          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md animate-fadeIn">
            <table className="min-w-full divide-y-2 divide-[#78521b]/20">
              <thead className="bg-[#fcf7ea] text-[10px] font-bold text-[#78521b] uppercase tracking-wider text-left font-sans">
                <tr>
                  <th className="px-6 py-4">Request id</th>
                  <th className="px-6 py-4">Student name</th>
                  <th className="px-6 py-4">Catalogue book requested</th>
                  <th className="px-6 py-4 font-mono">Request date</th>
                  <th className="px-6 py-4 text-right">Approval controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#78521b]/10 text-xs text-[#2b1a05]">
                {records.filter(r => r.status === 'Requested').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#78521b] font-bold">
                      <CheckCircle2 className="w-11 h-11 mx-auto stroke-1 text-emerald-850 mb-2" />
                      Splendid! No student requests on queue waiting for approval.
                    </td>
                  </tr>
                ) : (
                  records.filter(r => r.status === 'Requested').map((req) => (
                    <tr key={req.id} className="hover:bg-[#78521b]/5 transition-all">
                      <td className="px-6 py-4 font-mono text-[10px] text-[#78521b] font-bold">
                        {req.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-[#462d0e] text-sm">{req.studentName}</div>
                        <div className="text-[10px] text-[#78521b] font-mono mt-0.5 font-bold">{req.studentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#462d0e] truncate max-w-xs">{req.bookTitle}</div>
                        <div className="text-[10px] text-[#78521b] font-mono mt-0.5 font-bold">Book ID: {req.bookId}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#78521b] font-bold">
                        {req.issueDate}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onDeclineRequest && onDeclineRequest(req.id)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-800 font-extrabold rounded-xl text-[10px] transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onApproveRequest && onApproveRequest(req.id)}
                            className="px-3 py-1.5 bg-[#78521b] hover:bg-[#926628] border border-[#5c3f15] text-[#fdf6e2] font-black rounded-xl text-[10px] hover:-translate-y-0.5 transition-all uppercase tracking-wider cursor-pointer shadow-md"
                          >
                            Approve & Issue
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settle Return Dialog Overlay */}
      {returningRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2b1a05]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative parchment-container rounded-3xl w-full max-w-md shadow-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center pb-4 border-b-2 border-[#78521b]/30">
              <h3 className="text-lg font-black text-[#462d0e] tracking-tight flex items-center gap-2 uppercase">
                <RotateCcw className="w-5 h-5 text-[#78521b]" />
                Sign & Authenticate Return
              </h3>
              <button 
                onClick={() => setReturningRecord(null)}
                className="p-1.5 text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-[#fcf7ea] p-4 rounded-xl border border-[#a88d55]/30 text-xs text-[#2b1a05] space-y-2.5 select-none font-bold">
                <div className="flex justify-between">
                  <span className="text-[#78521b]">Library Loan Record:</span>
                  <span className="font-mono text-[#462d0e] font-black">{returningRecord.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78521b]">Borrower:</span>
                  <span className="font-bold text-[#462d0e]">{returningRecord.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78521b]">Book Catalogue:</span>
                  <span className="font-bold text-[#462d0e] truncate max-w-[200px]">{returningRecord.bookTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#78521b]/20 text-[10px]">
                  <div>
                    Lended Date: <span className="font-bold text-[#78521b]">{returningRecord.issueDate}</span>
                  </div>
                  <div>
                    Deadine Stamp: <span className="font-bold text-[#78521b]">{returningRecord.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Fine calculation alert view */}
              {calculateOverdueFine(returningRecord.dueDate, todayStr) > 0 && (
                <div className="bg-amber-600/10 border-2 border-amber-600/35 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-800 mt-0.5" />
                    <div className="text-xs text-amber-900 font-extrabold font-sans">
                      Overdue Fine Calculator Triggered!
                      <p className="text-[11px] text-[#78521b] mt-0.5 leading-normal font-semibold">
                        This book is overdue by <span className="text-[#462d0e] font-black font-mono">
                          {Math.ceil((new Date(todayStr).getTime() - new Date(returningRecord.dueDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </span> days. Standard fine calculates to <span className="text-red-800 font-black font-mono">₹{calculateOverdueFine(returningRecord.dueDate, todayStr).toFixed(2)}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Settled check */}
                  <div className="flex items-center gap-2 bg-[#fcf9ee] p-2.5 rounded-lg border border-[#a88d55]/35">
                    <input
                      type="checkbox"
                      id="settle-fine"
                      checked={settleFineNow}
                      onChange={(e) => setSettleFineNow(e.target.checked)}
                      className="w-4 h-4 text-[#78521b] bg-[#fdfcf3] border-[#a88d55] rounded focus:ring-[#78521b] accent-[#78521b] cursor-pointer"
                    />
                    <label htmlFor="settle-fine" className="text-[11px] text-[#78521b] font-extrabold cursor-pointer">
                      Settle and pay fine fully during return transaction (₹0.00 outstanding)
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#78521b]/20 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReturningRecord(null)}
                  className="px-4.5 py-2.5 bg-[#fdf6e2] hover:bg-[#fffef0] text-[#78521b] border border-[#a88d55] rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnSubmission}
                  className="px-5 py-2.5 parchment-btn rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  Confirm Return Checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
