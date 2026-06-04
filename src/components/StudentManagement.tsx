import React, { useState } from 'react';
import { Student, IssueRecord } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  X, 
  History, 
  CheckCircle, 
  UserPlus, 
  BookOpen, 
  Phone, 
  Mail, 
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';

interface StudentManagementProps {
  students: Student[];
  records: IssueRecord[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  currentUser: any;
}

export default function StudentManagement({ 
  students, 
  records, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent,
  currentUser
}: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Student for viewing borrowing history modal
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [studentDeleteConfirmId, setStudentDeleteConfirmId] = useState<string | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('BCA');
  const [formRollNo, setFormRollNo] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended'>('Active');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Filtering Logic
  const departmentsList = ['All', 'BCOM', 'BCA', 'BBA'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'All' || student.department.toUpperCase() === deptFilter.toUpperCase();
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate stats for each student on the fly
  const getStudentStats = (studentId: string) => {
    const studentRecords = records.filter(r => r.studentId === studentId);
    const activeCheckedOut = studentRecords.filter(r => r.status === 'Issued' || r.status === 'Overdue');
    const overdues = studentRecords.filter(r => r.status === 'Overdue');
    const totalIssuedInHistory = studentRecords.length;

    return {
      activeCount: activeCheckedOut.length,
      overdueCount: overdues.length,
      historyCount: totalIssuedInHistory
    };
  };

  // Open Modal Helpers
  const openAddModal = () => {
    const nextNum = Math.floor(100000 + Math.random() * 900000);
    setFormId(`S-${nextNum}`);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDepartment('BCA');
    setFormRollNo(`BCA-2026-${Math.floor(10 + Math.random() * 89)}`);
    setFormStatus('Active');
    setFormErrorMessage('');
    setCurrentStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setFormId(student.id);
    setFormName(student.name);
    setFormEmail(student.email || '');
    setFormPhone(student.phone);
    setFormDepartment(student.department);
    setFormRollNo(student.rollNo);
    setFormStatus(student.status);
    setFormErrorMessage('');
    setCurrentStudent(student);
    setIsModalOpen(true);
  };

  // Form Submission Helper
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');

    if (!formName.trim() || !formPhone.trim() || !formRollNo.trim() || !formEmail.trim()) {
      setFormErrorMessage('Please make sure all required fields (including Gmail Address) are filled out.');
      return;
    }

    // Gmail validity verification block
    const emailLower = formEmail.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(emailLower)) {
      setFormErrorMessage('Acceptance error: A correct student @gmail.com address is strictly required!');
      return;
    }

    if (formPhone.length !== 10) {
      setFormErrorMessage('Contact number must be exactly 10 digits.');
      return;
    }

    if (currentStudent === null && students.some(s => s.rollNo.toLowerCase() === formRollNo.toLowerCase())) {
      setFormErrorMessage(`A student with Roll No ${formRollNo} already exists.`);
      return;
    }

    if (students.some(s => s.id !== formId && s.email && s.email.toLowerCase() === emailLower)) {
      setFormErrorMessage(`Email address "${formEmail}" is already in use by another student directory file.`);
      return;
    }

    // Since added by Admin or Librarian, it is "defaultly set as it has been registered"
    const studentData: Student = {
      id: formId,
      name: formName.trim(),
      email: emailLower,
      phone: formPhone,
      department: formDepartment,
      rollNo: formRollNo.toUpperCase(),
      status: formStatus,
      password: currentStudent?.password || 'password' // Pre-registered credentials set automatically
    };

    if (currentStudent) {
      onUpdateStudent(studentData);
    } else {
      onAddStudent(studentData);
    }

    setIsModalOpen(false);
  };

  // Get active student borrowing records list
  const getSelectedStudentHistory = () => {
    if (!selectedStudentForHistory) return [];
    return records.filter(r => r.studentId === selectedStudentForHistory.id);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Upper banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffef7] border-2 border-[#a88d55]/40 p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-black text-[#462d0e] tracking-tight flex items-center gap-2 uppercase">
            <Users className="w-6 h-6 text-[#78521b]" />
            Student Detail Register
          </h1>
          <p className="text-sm text-[#78521b] mt-1 font-semibold">
            Maintain accounts, track historical listings, and monitor suspended user lists.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#78521b] hover:bg-[#926628] text-[#fdf6e2] rounded-xl text-xs font-black uppercase tracking-wider border border-[#54370f] shadow transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#fdf6e2]" />
          Add Student Profile
        </button>
      </div>

      {/* Filter Block */}
      <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-4 rounded-2xl shadow grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#78521b]" />
          <input
            type="text"
            placeholder="Search by Student Name, Roll No, or Contact Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-semibold placeholder-[#8c7855] text-[#2b1a05] transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="block w-full px-3.5 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-bold text-[#2b1a05] cursor-pointer appearance-none shadow-sm"
          >
            <option value="All">All Departments</option>
            {departmentsList.filter(d => d !== 'All').map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#78521b]">
            ▼
          </div>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3.5 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-bold text-[#2b1a05] cursor-pointer appearance-none shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Profile</option>
            <option value="Suspended">Suspended / Frozen</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#78521b]">
            ▼
          </div>
        </div>
      </div>

      {/* Grid view of student profiles - visually stunning bento structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-[#fcf7ea]/50 border-2 border-dashed border-[#a88d55]/40 p-12 text-center rounded-2xl text-[#78521b] font-medium">
            <Users className="w-12 h-12 mx-auto stroke-1 text-[#78521b]/60 mb-3" />
            No student profile files match query filters.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const stats = getStudentStats(student.id);
            const isSuspended = student.status === 'Suspended';

            return (
              <div 
                key={student.id} 
                className={`bg-[#fffef7] hover:bg-[#fcfaf2] border-2 rounded-2xl p-5 transition-all flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:scale-[1.01] ${
                  isSuspended ? 'border-amber-600/40 shadow-amber-500/2 bg-amber-500/[0.01]' : 'border-[#a88d55]/30'
                }`}
              >
                {/* Upper Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-xs text-[#78521b]/80 font-mono font-bold">
                        Roll No: <span className="text-[#462d0e] font-black">{student.rollNo}</span>
                      </span>
                      <span className="bg-emerald-600/15 border border-emerald-500/25 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md w-max">
                        ✓ Preregistered Hub Account
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                      isSuspended ? 'bg-amber-500/10 border border-amber-500/25 text-amber-800' : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-[#462d0e] text-base tracking-tight">{student.name}</h3>
                    <p className="text-xs text-[#78521b] font-mono mt-0.5 font-bold">Department: {student.department.toUpperCase()}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-[#462d0e] bg-[#fcf7ea]/80 p-2.5 rounded-xl border border-[#a88d55]/20 font-medium">
                    <div className="flex items-center gap-1.5 text-[#78521b]/80">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-[#78521b]" />
                      <span className="font-bold text-[#462d0e]">Contact No: {student.phone}</span>
                    </div>
                    {student.email && (
                      <div className="flex items-center gap-1.5 text-[#78521b]/80 border-t border-[#78521b]/10 pt-1.5 mt-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-[#78521b]" />
                        <span className="font-mono text-[10px] text-[#462d0e] truncate w-full">{student.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lower Action & Stat blocks */}
                <div className="pt-3 border-t border-[#78521b]/20 flex items-center justify-between gap-2">
                  {/* Miniature dashboard counter icons */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 cursor-help" title="Active checked out files currently with user">
                      <BookOpen className="w-3.5 h-3.5 text-[#78521b]" />
                      <span className="text-xs font-black text-[#462d0e]">{stats.activeCount}</span>
                    </div>
                    {stats.overdueCount > 0 && (
                      <div className="flex items-center gap-1 cursor-help animate-pulse" title="Lending profiles overdue!">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                        <span className="text-xs font-black text-rose-800">{stats.overdueCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 shadow-sm">
                    {/* View history history */}
                    <button
                      onClick={() => setSelectedStudentForHistory(student)}
                      className="px-3 py-1.5 bg-[#fdf6e2] hover:bg-[#fffef0] border border-[#a88d55]/40 text-[#78521b] hover:text-[#462d0e] rounded-lg text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3 h-3 text-[#78521b]" />
                      History
                    </button>
                    {/* Edit Student profile */}
                    <button
                      onClick={() => openEditModal(student)}
                      className="p-1.5 bg-[#fdf6e2] hover:bg-[#fffef0] border border-[#a88d55]/40 text-[#78521b] hover:text-[#462d0e] rounded-lg transition-all cursor-pointer"
                      title="Edit student profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete Student profile */}
                    {(currentUser?.role === 'Admin' || currentUser?.role === 'Librarian') && (
                      <button
                        onClick={() => {
                          if (studentDeleteConfirmId === student.id) {
                            onDeleteStudent(student.id);
                            setStudentDeleteConfirmId(null);
                          } else {
                            setStudentDeleteConfirmId(student.id);
                          }
                        }}
                        className={`px-2 py-1.5 border rounded-lg transition-all flex items-center gap-1 font-extrabold text-[11px] cursor-pointer ${
                          studentDeleteConfirmId === student.id
                            ? 'bg-red-700 text-white border-red-950 animate-pulse'
                            : 'bg-[#fdf6e2] hover:bg-red-750 hover:bg-red-700/10 border-[#a88d55]/40 text-rose-700 hover:text-red-700'
                        }`}
                        title="Delete student directory account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {studentDeleteConfirmId === student.id && <span className="font-black">Confirm?</span>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Profile Form Modal for adding/modifying */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative parchment-container rounded-3xl w-full max-w-md shadow-2xl p-8 overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b-2 border-[#78521b]/30 mb-5">
              <h3 className="text-lg font-black text-[#462d0e] tracking-tight uppercase">
                {currentStudent ? 'Modify Directory Folder' : 'Register Student Profile'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="parchment-label block mb-1">
                  Roll No <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formRollNo}
                  onChange={(e) => setFormRollNo(e.target.value)}
                  placeholder="E.g., BCA-2026-44"
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="parchment-label block mb-1">
                  Full Student Name <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="E.g., Liam Thompson"
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="parchment-label block mb-1">
                  Gmail Address <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="E.g., studentname@gmail.com"
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-left relative">
                  <label className="parchment-label block mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="block w-full px-3.5 py-2.5 pr-8 parchment-input text-xs font-bold cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="BCOM">BCOM</option>
                      <option value="BCA">BCA</option>
                      <option value="BBA">BBA</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#78521b]">
                      ▼
                    </div>
                  </div>
                </div>
                
                <div className="text-left relative">
                  <label className="parchment-label block mb-1">
                    Account Status
                  </label>
                  <div className="relative">
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Suspended')}
                      className="block w-full px-3.5 py-2.5 pr-8 parchment-input text-xs font-bold cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="Active">Active Profile</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#78521b]">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="parchment-label block mb-1">
                  Contact Number <span className="text-red-700 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormPhone(digits);
                  }}
                  placeholder="10-digit mobile number"
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                />
              </div>

              {formErrorMessage && (
                <div className="bg-red-950/20 border border-red-500/25 text-red-850 text-xs px-3.5 py-2 rounded-xl font-bold">
                  {formErrorMessage}
                </div>
              )}

              <div className="pt-4 border-t border-[#78521b]/20 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 bg-[#fdf6e2] hover:bg-[#fffef0] text-[#78521b] border border-[#a88d55] rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 parchment-btn rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {currentStudent ? 'Save Profile' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrowing History Modal (Objective 3: View Borrowing History) */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2b1a05]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative parchment-container rounded-3xl w-full max-w-2xl shadow-2xl p-6 overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b-2 border-[#78521b]/30">
              <div className="flex items-center gap-2.5 text-[#462d0e]">
                <div className="bg-[#78521b]/10 text-[#78521b] p-2 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase">
                    Borrowing History Log
                  </h3>
                  <p className="text-xs text-[#78521b] font-semibold">
                    Showing all checkout logs for <span className="text-[#462d0e] font-black">{selectedStudentForHistory.name}</span> ({selectedStudentForHistory.id})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentForHistory(null)}
                className="p-1.5 text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List log */}
            <div className="mt-4 max-h-96 overflow-y-auto space-y-3 pr-1">
              {getSelectedStudentHistory().length === 0 ? (
                <div className="py-12 text-center text-[#78521b]">
                  <History className="w-12 h-12 mx-auto stroke-1 text-[#78521b]/55 mb-3" />
                  This student has no borrowing logs in Hoysala Degree College records.
                </div>
              ) : (
                getSelectedStudentHistory().map((record) => {
                  const isLate = record.status === 'Overdue';
                  const isReturned = record.status === 'Returned';
                  
                  return (
                    <div 
                      key={record.id} 
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-3 ${
                        isLate 
                          ? 'bg-rose-500/[0.02] border-rose-500/25' 
                          : isReturned 
                            ? 'bg-emerald-500/[0.01] border-emerald-500/10'
                            : 'bg-[#fdfcf5] border-[#a88d55]/30'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-[#fcf7ea] border border-[#a88d55]/35 px-1.5 py-0.5 rounded text-[#78521b] font-bold">
                            {record.id}
                          </span>
                          <span className="text-xs font-bold text-[#78521b]">
                            Book ID: {record.bookId}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#462d0e] truncate pr-4">{record.bookTitle}</h4>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 pt-1.5 text-[11px] font-semibold text-[#8c7855]">
                          <div>
                            Issued: <span className="font-bold text-[#462d0e]">{record.issueDate}</span>
                          </div>
                          <div>
                            Due: <span className="font-bold text-[#462d0e]">{record.dueDate}</span>
                          </div>
                          {record.returnDate && (
                            <div>
                              Returned: <span className="font-bold text-emerald-800">{record.returnDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Return/Status and Fine summary details */}
                      <div className="shrink-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1 border-t sm:border-t-0 border-[#78521b]/10 pt-2 sm:pt-0">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                          record.status === 'Returned' 
                            ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/20' 
                            : record.status === 'Overdue'
                              ? 'bg-rose-500/15 text-rose-800 border border-rose-500/20 animate-pulse'
                              : 'bg-indigo-500/15 text-indigo-800 border border-indigo-500/20'
                        }`}>
                          {record.status}
                        </span>

                        {record.fineAmount > 0 && (
                          <div className="text-right sm:mt-1.5 space-y-0.5">
                            <span className="text-xs font-black text-[#5c3f15]">₹{record.fineAmount.toFixed(2)} Fine</span>
                            <div className="text-[9px] font-extrabold text-[#78521b]/80">
                              {record.finePaid ? (
                                <span className="text-emerald-800 flex items-center justify-end gap-0.5">
                                  <CheckCircle className="w-2.5 h-2.5" /> Paid
                                </span>
                              ) : (
                                <span className="text-amber-800">Unresolved Fine</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#78521b]/20 flex justify-end">
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="px-4 py-2 bg-[#fdf6e2] hover:bg-[#fffef0] border border-[#a88d55]/40 text-[#78521b] hover:text-[#462d0e] rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Close History Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
