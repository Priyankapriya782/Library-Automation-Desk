import React, { useState } from 'react';
import { Librarian } from '../types';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit3, 
  X, 
  AlertCircle, 
  Trash2,
  Phone, 
  Mail, 
  ShieldAlert,
  UserX,
  UserPlus,
  ShieldCheck
} from 'lucide-react';

interface LibrarianManagementProps {
  librarians: Librarian[];
  onAddLibrarian: (librarian: Librarian) => void;
  onUpdateLibrarian: (librarian: Librarian) => void;
  onDeleteLibrarian: (id: string) => void;
}

export default function LibrarianManagement({ 
  librarians, 
  onAddLibrarian, 
  onUpdateLibrarian, 
  onDeleteLibrarian 
}: LibrarianManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLibrarian, setCurrentLibrarian] = useState<Librarian | null>(null);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended'>('Active');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Filtering
  const filteredLibrarians = librarians.filter(lib => {
    const matchesSearch = 
      lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.phone.includes(searchTerm) ||
      lib.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || lib.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Open Modal Helpers
  const openAddModal = () => {
    const nextNum = Math.floor(100 + Math.random() * 899);
    setFormId(`L-${nextNum}`);
    setFormName('');
    setFormUsername(`librarian${librarians.length + 1}`);
    setFormEmail('');
    setFormPhone('');
    setFormStatus('Active');
    setFormErrorMessage('');
    setCurrentLibrarian(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lib: Librarian) => {
    setFormId(lib.id);
    setFormName(lib.name);
    setFormUsername(lib.username);
    setFormEmail(lib.email);
    setFormPhone(lib.phone);
    setFormStatus(lib.status);
    setFormErrorMessage('');
    setCurrentLibrarian(lib);
    setIsModalOpen(true);
  };

  // Submit Helper
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');

    if (!formName.trim() || !formUsername.trim() || !formPhone.trim() || !formEmail.trim()) {
      setFormErrorMessage('Please make sure all fields are filled out fully.');
      return;
    }

    if (formPhone.replace(/[^0-9]/g, '').length < 10) {
      setFormErrorMessage('Phone number should be at least 10 digits.');
      return;
    }

    // Check if username taken by another librarian
    const usernameTaken = librarians.some(
      l => l.id !== formId && l.username.toLowerCase() === formUsername.trim().toLowerCase()
    );

    if (usernameTaken) {
      setFormErrorMessage(`Username "${formUsername}" is already chosen by another Librarian.`);
      return;
    }

    const libData: Librarian = {
      id: formId,
      name: formName.trim(),
      username: formUsername.trim().toLowerCase(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      status: formStatus
    };

    if (currentLibrarian) {
      onUpdateLibrarian(libData);
    } else {
      onAddLibrarian(libData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* banner container section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffef7] border-2 border-[#a88d55]/40 p-6 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#78521b]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="z-10">
          <h1 className="text-2xl font-black text-[#462d0e] tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-[#78521b]" />
            Librarian Command Desk
          </h1>
          <p className="text-sm text-[#78521b] mt-1 font-medium">
            Authorize, audit, or cancel credentials for campus librarians with complete Admin control.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="parchment-btn text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4 text-[#fdf6e2]" />
          Add Librarian
        </button>
      </div>

      {/* Quick overview statistical widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold text-[#78521b] uppercase tracking-wider">Total Active Staff</p>
            <h3 className="text-2xl font-black text-[#462d0e] mt-1">
              {librarians.filter(l => l.status === 'Active').length}
            </h3>
          </div>
          <div className="bg-emerald-500/10 text-emerald-800 p-3 rounded-xl border-2 border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold text-[#78521b] uppercase tracking-wider">Suspended / Cancelled</p>
            <h3 className="text-2xl font-black text-red-800 mt-1">
              {librarians.filter(l => l.status === 'Suspended').length}
            </h3>
          </div>
          <div className="bg-rose-500/10 text-rose-800 p-3 rounded-xl border-2 border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold text-[#78521b] uppercase tracking-wider">All Listed Staff</p>
            <h3 className="text-2xl font-black text-[#462d0e] mt-1">{librarians.length}</h3>
          </div>
          <div className="bg-[#78521b]/10 text-[#78521b] p-3 rounded-xl border-2 border-[#78521b]/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and search bar controls */}
      <div className="flex flex-col md:flex-row gap-3 bg-[#fffef7] p-4 rounded-2xl border-2 border-[#a88d55]/40 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78521b]" />
          <input
            type="text"
            placeholder="Search by name, username, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2b1a05] placeholder-[#8c7855] font-semibold transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-[#78521b] uppercase tracking-widest hidden sm:inline">Status:</span>
          <div className="bg-[#fcf7ea] border-2 border-[#a88d55]/30 p-1 rounded-xl flex items-center gap-1">
            {['All', 'Active', 'Suspended'].map(statusOption => (
              <button
                key={statusOption}
                onClick={() => setStatusFilter(statusOption)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === statusOption
                    ? 'bg-[#78521b] text-[#fdf6e2] shadow-sm'
                    : 'text-[#78521b]/80 hover:text-[#462d0e] hover:bg-[#78521b]/5'
                }`}
              >
                {statusOption === 'Suspended' ? 'Cancelled' : statusOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Librarians Grid Board */}
      {filteredLibrarians.length === 0 ? (
        <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 rounded-2xl py-12 px-6 text-center shadow-sm">
          <UserX className="w-10 h-10 text-[#78521b]/60 mx-auto mb-3" />
          <h3 className="font-extrabold text-[#462d0e] text-sm">No librarians found</h3>
          <p className="text-xs text-[#78521b] mt-1 max-w-sm mx-auto font-medium">
            Try adjusting your search filters or add a new librarian staff to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLibrarians.map(lib => (
            <div 
              key={lib.id}
              className={`bg-[#fffef7] hover:bg-[#fffef0] border-2 border-[#a88d55]/40 hover:border-[#78521b] transition-all duration-300 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm ${
                lib.status === 'Suspended' ? 'opacity-80 border-[#a88d55]/60 bg-[#fdfcf3]' : ''
              }`}
            >
              <div>
                {/* ID Card Header */}
                <div className="flex items-start justify-between gap-2.5 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      lib.status === 'Suspended' 
                        ? 'bg-rose-500/10 text-rose-800 border border-rose-500/20' 
                        : 'bg-[#78521b]/10 text-[#78521b] border-2 border-[#a88d55]/20'
                    }`}>
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#462d0e] leading-tight">{lib.name}</h4>
                      <p className="text-[10px] text-[#78521b] font-mono mt-0.5 font-bold">ID: {lib.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[8px] font-black font-mono uppercase tracking-widest rounded-lg border ${
                    lib.status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-800'
                      : 'bg-rose-500/10 border-rose-500/35 text-rose-800'
                  }`}>
                    {lib.status === 'Active' ? 'Active Duty' : 'Cancelled'}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2 py-3 border-y-2 border-[#78521b]/10 text-xs text-[#2b1a05] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-[#78521b] uppercase w-16">Username:</span>
                    <span className="font-mono font-bold text-[#462d0e] bg-[#fcf9ee] px-1.5 py-0.5 rounded border border-[#a88d55]/30">
                      {lib.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#78521b] shrink-0" />
                    <span className="truncate">{lib.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#78521b] shrink-0" />
                    <span>{lib.phone}</span>
                  </div>
                </div>
              </div>

              {/* Controls Footer */}
              <div className="flex items-center gap-2.5 mt-4 pt-4 border-t-2 border-[#78521b]/10">
                <button
                  onClick={() => openEditModal(lib)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#fdf6e2] border border-[#a88d55] hover:border-[#78521b] text-[11px] font-black text-[#78521b] hover:text-[#462d0e] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>

                {lib.status === 'Active' ? (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to cancel / suspend librarian "${lib.name}"? They will lose access immediately.`)) {
                        onUpdateLibrarian({ ...lib, status: 'Suspended' });
                      }
                    }}
                    className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/15 text-red-900 text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5"
                    title="Cancel account/Suspend duty"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Cancel Account
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onUpdateLibrarian({ ...lib, status: 'Active' });
                      }}
                      className="py-1.5 px-3 rounded-lg bg-[#78521b]/10 hover:bg-[#78521b]/20 border border-[#78521b]/30 text-[#462d0e] text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5"
                      title="Reactivate Duty"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Restore Active
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`DANGER: Are you sure you want to PERMANENTLY DELETE librarian "${lib.name}" from database records? This cannot be undone.`)) {
                          onDeleteLibrarian(lib.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-strawberry/10 hover:bg-red-700 hover:text-white border border-red-500/35 text-red-700 transition-all cursor-pointer"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT LIBRARIAN MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="parchment-container w-full max-w-md rounded-3xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10 p-1.5 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b-2 border-[#78521b]/30 mb-5 text-[#462d0e]">
              <div className="bg-[#78521b] p-2 rounded-xl text-white">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">
                  {currentLibrarian ? 'Modify Librarian Profile' : 'Add New Librarian'}
                </h3>
                <p className="text-[10px] text-gray-700 mt-0.5">
                  Set security clearance codes and basic directory records.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="parchment-label block mb-1">Account ID</label>
                  <input
                    type="text"
                    disabled
                    value={formId}
                    className="block w-full px-3.5 py-2.5 parchment-input text-gray-500 font-mono text-xs cursor-not-allowed opacity-75"
                  />
                </div>
                <div>
                  <label className="parchment-label block mb-1">Login Username</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., librarian_jane"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                    className="block w-full px-3.5 py-2.5 parchment-input text-xs font-mono font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="parchment-label block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Jane Watson"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="parchment-label block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="E.g., jane@college.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="parchment-label block mb-1">Phone / Contact Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value.replace(/[^0-9\-+ ()]/g, ''))}
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-mono font-semibold focus:outline-none"
                />
              </div>

              <div className="text-left relative">
                <label className="parchment-label block mb-1">Registry Status</label>
                <div className="relative">
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Suspended')}
                    className="block w-full px-3.5 py-2.5 pr-8 parchment-input text-xs font-bold cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="Suspended">Cancelled Account / Suspended</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#78521b]">
                    ▼
                  </div>
                </div>
              </div>

              {formErrorMessage && (
                <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-2 text-red-800 font-semibold text-xs animate-shake">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-700" />
                  <span className="leading-normal">{formErrorMessage}</span>
                </div>
              )}

              <p className="text-[10px] text-gray-800 leading-relaxed bg-[#fffef2]/75 p-2.5 rounded-xl border border-[#a88d55]/40 mb-2 font-medium">
                🔒 Note: Default login pass-code for new account is{' '}
                <span className="font-mono text-[#78521b] font-bold">lib123</span> (or <span className="font-mono text-[#78521b] font-bold">password</span>).
              </p>

              <div className="flex gap-3 pt-3 border-t border-[#78521b]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#fdf6e2] hover:bg-[#fffef0] text-[#78521b] border border-[#a88d55] rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 parchment-btn rounded-xl text-xs transition-all cursor-pointer"
                >
                  {currentLibrarian ? 'Apply Changes' : 'Confirm Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
