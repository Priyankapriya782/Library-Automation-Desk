import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getLocalStorageData } from '../data';
import { BookOpen, Lock, UserCheck, ShieldAlert, KeyRound, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  initialRole?: UserRole;
  initialRegister?: boolean;
  onBackToHome?: () => void;
}

export default function Login({ onLoginSuccess, initialRole, initialRegister, onBackToHome }: LoginProps) {
  // Map internal student role to "Member" label in UI dropdown
  const [role, setRole] = useState<UserRole>(initialRole || 'Librarian');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  // Register screen state
  const [isRegistering, setIsRegistering] = useState(initialRegister || false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState('BCA');
  const [regRollNo, setRegRollNo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regStudentIdInfo, setRegStudentIdInfo] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const handleRoleChangeInDropdown = (val: string) => {
    let selectedRole: UserRole = 'Librarian';
    if (val === 'Admin') selectedRole = 'Admin';
    if (val === 'Member') selectedRole = 'Student';
    if (val === 'Librarian') selectedRole = 'Librarian';

    setRole(selectedRole);
    // Keep username and password input elements completely empty by user request
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regPhone.trim() || !regRollNo.trim()) {
      setError('Please fill in Name, Phone, and Roll Number.');
      return;
    }

    if (!regEmail.trim()) {
      setError('Email address is required for registration.');
      return;
    }

    const emailLower = regEmail.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(emailLower)) {
      setError('A valid Gmail address (@gmail.com) is required to register.');
      return;
    }

    if (regPhone.trim().length !== 10) {
      setError('Contact No must be exactly 10 digits.');
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const data = getLocalStorageData();
    const studentList = data.students;

    // Check if Roll No already registered to avoid duplicates
    const isRollNoTaken = studentList.some((s: any) => s.rollNo.toUpperCase() === regRollNo.trim().toUpperCase());
    if (isRollNoTaken) {
      setError(`Roll number "${regRollNo}" is already registered.`);
      return;
    }

    // Check if Email already registered to avoid duplicates
    const isEmailTaken = studentList.some((s: any) => s.email && s.email.toLowerCase() === emailLower);
    if (isEmailTaken) {
      setError(`Email address "${regEmail}" is already in use.`);
      return;
    }

    // Next sequential Student ID
    let nextIdNum = 202406;
    const ids = studentList
      .map((s: any) => {
        const numPart = s.id ? s.id.replace('S-', '') : '';
        const parsed = parseInt(numPart, 10);
        return isNaN(parsed) ? null : parsed;
      })
      .filter((n: any) => n !== null);

    if (ids.length > 0) {
      nextIdNum = Math.max(...ids) + 1;
    }
    const nextStudentId = `S-${nextIdNum}`;

    const newStudent = {
      id: nextStudentId,
      name: regName.trim(),
      email: emailLower,
      phone: regPhone.trim(),
      department: regDepartment,
      rollNo: regRollNo.trim().toUpperCase(),
      status: 'Active' as const,
      password: regPassword || 'password'
    };

    const updatedStudents = [...studentList, newStudent];
    localStorage.setItem("lib_students", JSON.stringify(updatedStudents));

    // Also POST to update central server so Admin/Librarian gets the details instantly
    fetch('/api/library-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: updatedStudents })
    }).catch(err => console.warn("Failed to update central database during registration:", err));

    setRegStudentIdInfo(nextStudentId);
    setRegSuccess(true);
    setError('');

    // Admin-level login simulation after register success
    setTimeout(() => {
      onLoginSuccess({
        username: newStudent.id,
        role: 'Student',
        name: `${newStudent.name} (Student)`,
        studentId: newStudent.id,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
      });
    }, 2000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    if (role === 'Admin') {
      if (username === 'admin' && password === 'admin123') {
        onLoginSuccess({
          username: 'admin',
          role: 'Admin',
          name: 'Sahana',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
        });
      } else {
        setError('Invalid admin credentials. (Hint: admin / admin123)');
      }
    } else if (role === 'Librarian') {
      const data = getLocalStorageData();
      const librarianList = data.librarians;

      const match = librarianList.find(
        (l: any) => l.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (match) {
        if (match.status === 'Suspended') {
          setError('Librarian account suspended. Contact Admin.');
          return;
        }
        if (password === 'lib123' || password === 'password') {
          onLoginSuccess({
            username: match.username,
            role: 'Librarian',
            name: match.name,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
          });
        } else {
          setError('Invalid librarian password. (try "lib123")');
        }
      } else {
        setError('Invalid librarian username. (Hint: librarian1 / lib123)');
      }
    } else if (role === 'Student') {
      const data = getLocalStorageData();
      const studentList = data.students;
      const cleanUser = username.trim().toUpperCase();
      const matchedStu = studentList.find((s: any) => 
        s.id.toUpperCase() === cleanUser || 
        s.rollNo.toUpperCase() === cleanUser ||
        (s.email && s.email.toUpperCase() === username.trim().toUpperCase())
      );

      if (!matchedStu) {
        setError(`Access Denied. Registered accounts only.`);
        return;
      }

      // Confirm correct credential
      const studentPassword = matchedStu.password || 'password';
      if (password !== studentPassword) {
        setError('Invalid login credential or password combination.');
        return;
      }

      if (matchedStu.status === 'Suspended') {
        setError('Your account is on hold. Please visit the desk.');
        return;
      }

      onLoginSuccess({
        username: matchedStu.id,
        role: 'Student',
        name: `${matchedStu.name}`,
        studentId: matchedStu.id,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5eeda] text-[#2b1a05] flex flex-col font-sans select-none relative overflow-x-hidden" style={{
      backgroundImage: `radial-gradient(circle at 20% 20%, rgba(198, 160, 82, 0.05) 0%, transparent 60%), repeating-linear-gradient(rgba(0,0,0,0.003) 0px, rgba(0,0,0,0.003) 1px, transparent 1px, transparent 4px)`
    }}>
      
      {/* Dynamic exact header - White styling */}
      <header className="w-full bg-[#fdf9ee] border-b-4 border-[#78521b] px-6 sm:px-12 py-4 flex items-center justify-between shrink-0 shadow-md">
        <button 
          onClick={onBackToHome}
          className="text-xl font-black text-[#462d0e] tracking-wider text-left cursor-pointer hover:text-[#78521b] transition-all uppercase"
        >
          🏛️ Library Automation Desk
        </button>

        {/* Dynamic header controllers to easily flip views */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => {
              setIsRegistering(false);
              setError('');
            }}
            className={`flex items-center gap-2 text-sm font-bold transition-all cursor-pointer ${!isRegistering ? 'text-[#462d0e] scale-102' : 'text-[#78521b] hover:text-[#462d0e]'}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#78521b] flex items-center justify-center text-[#fdf6e2] shrink-0 shadow-md border border-[#54370f]">
              <Lock className="w-4 h-4" />
            </div>
            <span>Login Entry</span>
          </button>

          <button
            onClick={() => {
              setIsRegistering(true);
              setError('');
            }}
            className={`flex items-center gap-2 text-sm font-bold transition-all cursor-pointer ${isRegistering ? 'text-[#462d0e] scale-102' : 'text-[#78521b] hover:text-[#462d0e]'}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#78521b] flex items-center justify-center text-[#fdf6e2] shrink-0 shadow-md border border-[#54370f]">
              <UserCheck className="w-4 h-4" />
            </div>
            <span>Register Desk</span>
          </button>
        </div>
      </header>

      {/* Main Container Area centered on light gray background */}
      <main className="flex-1 w-full bg-[#f5eeda] flex flex-col items-center justify-center px-4 py-12 relative" style={{
        backgroundImage: `radial-gradient(circle at 80% 20%, rgba(120, 82, 27, 0.05) 0%, transparent 60%)`
      }}>
        
        {/* Back Link overlay */}
        <button
          onClick={onBackToHome}
          className="absolute top-4 left-6 text-xs text-[#78521b] hover:text-[#462d0e] font-bold flex items-center gap-1 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to welcome screen
        </button>

        {/* 1. LOGIN MODE: Vintage double-bordered Parchment folder sheet */}
        {!isRegistering && (
          <div className="parchment-container p-8 sm:p-10 rounded-3xl w-full max-w-md text-center transition-transform duration-300 relative">
            <div className="absolute top-0 inset-x-0 h-11 bg-[#5c3f15] rounded-t-2xl flex items-center justify-center border-b-2 border-[#3a2608]">
              <span className="text-amber-100 uppercase tracking-widest text-[11px] font-black">
                🔒 Library Access Terminal
              </span>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="w-full mt-10 flex flex-col items-center justify-center space-y-4 pt-4">
              <h2 className="text-xl font-black text-[#462d0e] tracking-tight uppercase border-b-2 border-[#78521b]/40 pb-2.5 w-full">
                Member Login Panel
              </h2>

              {/* Login ID Input */}
              <div className="w-full text-left">
                <label className="parchment-label block mb-1">
                  Login ID / Roll No / Email Address:
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., student@gmail.com, S-202401 or roll no"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full parchment-input px-3.5 py-2.5 focus:outline-none text-sm font-semibold shadow-sm"
                />
              </div>

              {/* Password Input */}
              <div className="w-full text-left">
                <label className="parchment-label block mb-1">
                  Security Code:
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="Enter security code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full parchment-input px-3.5 py-2.5 pr-10 focus:outline-none text-sm font-semibold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 text-[#78521b] hover:text-[#462d0e] hover:scale-110 transition-transform cursor-pointer"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* User Type Selection Dropdown */}
              <div className="w-full text-left relative">
                <label className="parchment-label block mb-1">
                  User Privilege Role:
                </label>
                <div className="relative">
                  <select
                    value={role === 'Student' ? 'Member' : role}
                    onChange={(e) => handleRoleChangeInDropdown(e.target.value)}
                    className="w-full parchment-input px-3.5 py-2.5 pr-10 focus:outline-none text-sm font-bold cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="Select" disabled>Select User type</option>
                    <option value="Member">Member</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#78521b]">
                    ▼
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-red-600 font-semibold leading-tight max-w-[280px]">
                  {error}
                </p>
              )}

              {/* Action centered submit pill button */}
              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#78521b] hover:bg-[#5c3f15] text-[#fdf6e2] font-black text-xs uppercase tracking-widest rounded-xl shadow-md border border-[#4a320f] hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Access Account Desk
              </button>
            </form>
            
            {/* Super handy credential hint helper */}
          </div>
        )}

        {/* 2. REGISTER MODE: Vintage Parchment Form Sheet */}
        {isRegistering && (
          <div className="parchment-container p-8 sm:p-10 rounded-3xl w-full max-w-md transition-transform duration-300 relative shadow-xl">
            <div className="absolute top-0 inset-x-0 h-11 bg-[#5c3f15] rounded-t-2xl flex items-center justify-center border-b-2 border-[#3a2608]">
              <span className="text-amber-100 uppercase tracking-widest text-[11px] font-black">
                📝 Register New Directory Account
              </span>
            </div>

            <div className="mt-8 pt-2">
              <h2 className="text-xl font-black text-[#462d0e] mb-4 text-center tracking-tight uppercase border-b border-[#78521b]/20 pb-2">
                Create Student Desk
              </h2>
              
              {regSuccess ? (
                <div className="py-6 text-center space-y-4 bg-emerald-950/10 border border-emerald-800/20 rounded-2xl p-4">
                  <div className="inline-flex p-3 bg-[#78521b] text-white rounded-full">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#2e1d08] text-sm uppercase">Account Configured Successfully!</h4>
                    <p className="text-xs text-gray-800 mt-2 font-medium">Use the ID code below to login:</p>
                    <div className="mt-2.5 font-mono font-bold bg-[#fffef2] px-4 py-1.5 rounded-lg border border-[#a88d55] text-xl text-[#78521b] shadow-sm select-all inline-block">
                      {regStudentIdInfo}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">Security password set: "password"</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Department Selector */}
                    <div className="col-span-1 text-left">
                      <label className="parchment-label block mb-1">
                        Dept:
                      </label>
                      <div className="relative">
                        <select
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          className="w-full parchment-input px-3 py-2 pr-8 focus:outline-none text-xs font-bold cursor-pointer appearance-none shadow-sm"
                        >
                          <option value="" disabled>Select Department</option>
                          <option value="BCA">BCA (CS)</option>
                          <option value="BCOM">BCOM (Comm)</option>
                          <option value="BBA">BBA (Mgmt)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#78521b]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Roll number */}
                    <div className="col-span-1 text-left">
                      <label className="parchment-label block mb-1">
                        Roll Number:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="BCA-2026-05"
                        value={regRollNo}
                        onChange={(e) => setRegRollNo(e.target.value)}
                        className="w-full parchment-input px-3 py-2 focus:outline-none text-xs font-semibold shadow-sm"
                        style={{ paddingHeight: 'unset', paddingTop: '8px', paddingBottom: '8px' }}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="text-left">
                    <label className="parchment-label block mb-1">
                      Full Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Priya Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full parchment-input px-3 py-1.5 focus:outline-none text-xs font-semibold shadow-sm"
                    />
                  </div>

                  {/* Password field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div>
                      <label className="parchment-label block mb-1">
                        Security Pass:
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full parchment-input px-3 py-1.5 pr-8 focus:outline-none text-xs font-semibold shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 text-[#78521b] hover:text-[#462d0e] cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label className="parchment-label block mb-1">
                        Confirm:
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showRegConfirmPassword ? "text" : "password"}
                          placeholder="Confirm"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full parchment-input px-3 py-1.5 pr-8 focus:outline-none text-xs font-semibold shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-2 text-[#78521b] hover:text-[#462d0e] cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="text-left">
                    <label className="parchment-label block mb-1">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      placeholder="priya@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full parchment-input px-3 py-1.5 focus:outline-none text-xs font-semibold shadow-sm"
                    />
                  </div>

                  {/* Contact phone */}
                  <div className="text-left">
                    <label className="parchment-label block mb-1">
                      Contact No (10-Digit Mobile):
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full parchment-input px-3 py-1.5 focus:outline-none text-xs font-semibold shadow-sm"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-950/20 border border-red-500/20 text-red-800 text-xs font-bold py-1.5 px-3 rounded-lg w-full text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-4 py-2.5 bg-[#78521b] hover:bg-[#5c3f15] text-[#fdf6e2] font-black text-xs uppercase tracking-widest rounded-xl shadow-md border border-[#4a320f] transition-all cursor-pointer"
                  >
                    Submit Register Request
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

