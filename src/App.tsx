import { useState, useEffect } from 'react';
import { User, Book, Student, IssueRecord, Librarian, UserRole, Branch } from './types';
import { getLocalStorageData, saveLocalStorageData, calculateOverdueFine } from './data';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BookManagement from './components/BookManagement';
import StudentManagement from './components/StudentManagement';
import IssueReturnModule from './components/IssueReturnModule';
import Reports from './components/Reports';
import LibrarianManagement from './components/LibrarianManagement';
import HomePage from './components/HomePage';
// @ts-ignore
import bookshelfLogo from './assets/images/bookshelf_logo_1779725771754.png';
// @ts-ignore
import returnedBooksIcon from './assets/images/returned_books_icon_1780580203455.png';
// @ts-ignore
import returnedBanner from './assets/images/returned_banner_1780580363425.png';

import { 
  BookOpen, 
  UserCheck, 
  LogOut,
  Search,
  BookMarked,
  Clock,
  CheckCircle,
  AlertOctagon,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lib_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<IssueRecord[]>([]);
  const [librarians, setLibrarians] = useState<Librarian[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Account dropdown visibility logic
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Home Page Navigation States
  const [unauthView, setUnauthView] = useState<'home' | 'login'>('home');
  const [unauthInitialRole, setUnauthInitialRole] = useState<UserRole>('Librarian');
  const [unauthInitialRegister, setUnauthInitialRegister] = useState<boolean>(false);

  // Student specific inner filtered tab selections (for image 4 category modules)
  const [studentActiveFilterModule, setStudentActiveFilterModule] = useState<string | null>(null);

  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  // Synced Device Live Polling Engine
  const fetchDataFromServer = async () => {
    try {
      const response = await fetch('/api/library-data');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Real-time synchronization change listener for newly registered students
          if (data.students) {
            setStudents((prev) => {
              if (prev && prev.length > 0) {
                const prevIds = new Set(prev.map(s => s.id));
                const newlyAdded = data.students.filter((s: Student) => !prevIds.has(s.id));
                if (newlyAdded.length > 0) {
                  const names = newlyAdded.map((s: Student) => `${s.name} (${s.rollNo})`).join(', ');
                  setSyncAlert(`🔔 Inter-Device Sync Active: Student "${names}" has registered live from another device!`);
                  // Auto dismiss in 8s
                  setTimeout(() => setSyncAlert(null), 8000);
                }
              }
              return data.students;
            });
          }

          if (data.books) setBooks(data.books);
          if (data.librarians) setLibrarians(data.librarians);
          if (data.branches) setBranches(data.branches);

          if (data.records) {
            const updatedRecords = data.records.map((r: IssueRecord) => {
              if (r.status === 'Issued' || r.status === 'Overdue') {
                const dynamicFine = calculateOverdueFine(r.dueDate, null);
                const newStatus = dynamicFine > 0 ? 'Overdue' : 'Issued';
                return {
                  ...r,
                  fineAmount: dynamicFine,
                  status: newStatus as 'Issued' | 'Overdue'
                };
              }
              return r;
            });
            setRecords(updatedRecords);
          }
        }
      }
    } catch (err) {
      console.warn("Connection fallback: offline simulated storage in use.", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDataFromServer();

    // Constant 3.5s cycle loop to immediately pull student registrations from any other devices
    const syncInterval = setInterval(() => {
      fetchDataFromServer();
    }, 3500);

    return () => clearInterval(syncInterval);
  }, []);

  // Sync state helpers
  const syncState = (
    updatedBooks: Book[], 
    updatedStudents: Student[], 
    updatedRecords: IssueRecord[], 
    updatedLibrarians?: Librarian[],
    updatedBranches?: Branch[]
  ) => {
    const finalLibrarians = updatedLibrarians || librarians;
    const finalBranches = updatedBranches || branches;

    setBooks(updatedBooks);
    setStudents(updatedStudents);
    setRecords(updatedRecords);
    if (updatedLibrarians) {
      setLibrarians(updatedLibrarians);
    }
    if (updatedBranches) {
      setBranches(updatedBranches);
    }
    saveLocalStorageData(updatedBooks, updatedStudents, updatedRecords, finalLibrarians, finalBranches);

    // Push changes to central server
    fetch('/api/library-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        books: updatedBooks,
        students: updatedStudents,
        records: updatedRecords,
        librarians: finalLibrarians,
        branches: finalBranches
      })
    }).catch(err => console.warn("Failed to update central cloud state:", err));
  };

  // Branch Operations
  const handleAddBranch = (newBranch: Branch) => {
    const updated = [...branches, newBranch];
    setBranches(updated);
    saveLocalStorageData(books, students, records, librarians, updated);
    
    fetch('/api/library-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branches: updated
      })
    }).catch(err => console.warn(err));
  };

  // Login event handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('lib_session_user', JSON.stringify(user));
    
    const data = getLocalStorageData();
    setStudents(data.students);
    setLibrarians(data.librarians || []);
    setCurrentTab('dashboard'); // Go directly to dashboard / main view upon authentication
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lib_session_user');
    setStudentActiveFilterModule(null);
    setCurrentTab('dashboard');
  };

  // Book Catalog Operations
  const handleAddBook = (newBook: Book) => {
    const updated = [newBook, ...books];
    syncState(updated, students, records);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    const updated = books.map(b => b.id === updatedBook.id ? updatedBook : b);
    syncState(updated, students, records);
  };

  const handleDeleteBook = (id: string) => {
    const updated = books.filter(b => b.id !== id);
    syncState(updated, students, records);
  };

  // Student Directory Operations
  const handleAddStudent = (newStudent: Student) => {
    const updated = [newStudent, ...students];
    syncState(books, updated, records);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    syncState(books, updated, records);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    syncState(books, updated, records);
  };

  // Librarian Operations
  const handleAddLibrarian = (newLibrarian: Librarian) => {
    const updated = [newLibrarian, ...librarians];
    syncState(books, students, records, updated);
  };

  const handleUpdateLibrarian = (updatedLibrarian: Librarian) => {
    const updated = librarians.map(l => l.id === updatedLibrarian.id ? updatedLibrarian : l);
    syncState(books, students, records, updated);
  };

  const handleDeleteLibrarian = (id: string) => {
    const updated = librarians.filter(l => l.id !== id);
    syncState(books, students, records, updated);
  };

  // Issue & Return processing
  const handleIssueBook = (bookId: string, studentId: string, dueDate: string) => {
    const bk = books.find(b => b.id === bookId);
    const stu = students.find(s => s.id === studentId);
    if (!bk || !stu) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextIdNum = Math.floor(5000 + Math.random() * 4999);
    const newRecord: IssueRecord = {
      id: `R-${nextIdNum}`,
      bookId: bk.id,
      studentId: stu.id,
      bookTitle: bk.title,
      studentName: stu.name,
      issueDate: todayStr,
      dueDate: dueDate,
      returnDate: null,
      fineAmount: 0,
      finePaid: false,
      status: "Issued"
    };

    const updatedBooks = books.map(b => b.id === bookId ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b);
    const updatedRecords = [newRecord, ...records];

    syncState(updatedBooks, students, updatedRecords);
  };

  const handleReturnBook = (recordId: string, returnDate: string, settleFineNow: boolean) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const finalFine = calculateOverdueFine(record.dueDate, returnDate);

    const updatedRecords = records.map(r => r.id === recordId ? {
      ...r,
      returnDate: returnDate,
      fineAmount: finalFine,
      finePaid: settleFineNow ? true : r.finePaid,
      status: "Returned" as const
    } : r);

    const updatedBooks = books.map(b => b.id === record.bookId ? { ...b, copiesAvailable: b.copiesAvailable + 1 } : b);

    syncState(updatedBooks, students, updatedRecords);
  };

  const handlePayFine = (recordId: string) => {
    const updatedRecords = records.map(r => r.id === recordId ? { ...r, finePaid: true } : r);
    syncState(books, students, updatedRecords);
  };

  const handleRequestBook = (bookId: string) => {
    if (!currentUser) return;
    const bk = books.find(b => b.id === bookId);
    if (!bk) return;

    const alreadyRequested = records.some(r => r.studentId === currentUser.studentId && r.bookId === bookId && r.status === 'Requested');
    if (alreadyRequested) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const dueDateStr = nextWeekDate.toISOString().split('T')[0];

    const nextIdNum = Math.floor(5000 + Math.random() * 4999);
    const newRecord: IssueRecord = {
      id: `R-${nextIdNum}`,
      bookId: bk.id,
      studentId: currentUser.studentId || `S-${Math.floor(1000 + Math.random() * 9000)}`,
      bookTitle: bk.title,
      studentName: currentUser.name,
      issueDate: todayStr,
      dueDate: dueDateStr,   
      returnDate: null,
      fineAmount: 0,
      finePaid: false,
      status: "Requested"
    };

    const updatedRecords = [newRecord, ...records];
    syncState(books, students, updatedRecords);
  };

  const handleApproveRequest = (recordId: string) => {
    const req = records.find(r => r.id === recordId);
    if (!req) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const dueDateStr = nextWeekDate.toISOString().split('T')[0];

    const updatedRecords = records.map(r => r.id === recordId ? {
      ...r,
      status: 'Issued' as const,
      issueDate: todayStr,
      dueDate: dueDateStr
    } : r);

    const updatedBooks = books.map(b => b.id === req.bookId ? { ...b, copiesAvailable: b.copiesAvailable - 1 } : b);

    syncState(updatedBooks, students, updatedRecords);
  };

  const handleDeclineRequest = (recordId: string) => {
    const updatedRecords = records.filter(r => r.id !== recordId);
    syncState(books, students, updatedRecords);
  };

  // Fallback rendering for catalog and login views when log out
  if (!currentUser) {
    if (unauthView === 'login') {
      return (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          initialRole={unauthInitialRole}
          initialRegister={unauthInitialRegister}
          onBackToHome={() => setUnauthView('home')}
        />
      );
    }
    return (
      <HomePage 
        onEnterLogin={(role) => {
          setUnauthInitialRole(role || 'Librarian');
          setUnauthInitialRegister(false);
          setUnauthView('login');
        }} 
        onEnterRegister={() => {
          setUnauthInitialRole('Student');
          setUnauthInitialRegister(true);
          setUnauthView('login');
        }}
      />
    );
  }

  // Filter elements to display under student workspace sub-sections
  const studentOverdueRecords = records.filter(r => r.studentId === currentUser.studentId && r.status === 'Overdue');
  const studentIssuedRecords = records.filter(r => r.studentId === currentUser.studentId && r.status === 'Issued');
  const studentReturnedRecords = records.filter(r => r.studentId === currentUser.studentId && r.status === 'Returned');
  const studentRequestedRecords = records.filter(r => r.studentId === currentUser.studentId && r.status === 'Requested');

  return (
    <div className="min-h-screen bg-[#f5eeda] text-[#2b1a05] flex flex-col font-sans select-none overflow-x-hidden" style={{
      backgroundImage: `radial-gradient(circle at 20% 20%, rgba(198, 160, 82, 0.06) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(120, 82, 27, 0.05) 0%, transparent 50%), repeating-linear-gradient(rgba(0,0,0,0.004) 0px, rgba(0,0,0,0.004) 1px, transparent 1px, transparent 4px)`
    }}>
      
      {/* Real-time synchronization pop-up alerts */}
      {syncAlert && (
        <div className="fixed top-20 right-6 z-[100] max-w-[21rem] bg-amber-50 border-2 border-[#a88d55] text-[#462d0e] shadow-xl rounded-2xl p-4 flex items-start gap-3 animate-bounce">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-left font-sans">
            <h5 className="text-[9px] uppercase font-black tracking-widest text-emerald-800">Multi-Device Live Stream</h5>
            <p className="text-[11px] font-extrabold leading-snug mt-1 text-[#462d0e]">{syncAlert}</p>
          </div>
        </div>
      )}

      {/* 
        TOP HORIZONTAL NAVIGATION BAR - STYLED EXACTLY MATCHING SCREENS 3, 4, 5
        - White background
        - Clean layout
        - Dynamic menus based on role
      */}
      <header className="sticky top-0 z-50 w-full bg-[#fdf9ee] border-b-4 border-[#78521b] px-6 sm:px-12 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => {
              setStudentActiveFilterModule(null);
              setCurrentTab('dashboard');
            }}
            className="text-lg font-black text-[#462d0e] uppercase tracking-wider cursor-pointer hover:opacity-90 flex items-center gap-2"
          >
            🏛️ Library Desk
          </button>

          {/* Connected Device badge indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[9px] uppercase font-mono font-black tracking-wider shadow-sm shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live Device Synced
          </div>

          {/* Librarian / Admin Navigation Links */}
          {currentUser.role !== 'Student' && (
            <nav className="hidden lg:flex items-center gap-1.5 pl-6 border-l border-gray-200">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-[#78521b] text-[#fdf6e2] font-black'
                    : 'text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setCurrentTab('books')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  currentTab === 'books'
                    ? 'bg-[#78521b] text-[#fdf6e2] font-black'
                    : 'text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10'
                }`}
              >
                Book <ChevronDown className="w-3 h-3 text-current ml-0.5" />
              </button>

              {currentUser.role === 'Admin' && (
                <button
                  onClick={() => setCurrentTab('librarians')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    currentTab === 'librarians'
                      ? 'bg-[#78521b] text-[#fdf6e2] font-black'
                      : 'text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10'
                  }`}
                >
                  Librarian
                </button>
              )}

              <button
                onClick={() => setCurrentTab('issue-return')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentTab === 'issue-return'
                    ? 'bg-[#78521b] text-[#fdf6e2] font-black'
                    : 'text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10'
                }`}
              >
                Book Issue-Return
              </button>

              <button
                onClick={() => setCurrentTab('students')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentTab === 'students'
                    ? 'bg-[#78521b] text-[#fdf6e2] font-black'
                    : 'text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10'
                }`}
              >
                Student
              </button>

              <button
                onClick={() => setCurrentTab('reports')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentTab === 'reports'
                    ? 'bg-[#78521b] text-[#fdf6e2] font-black'
                    : 'text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10'
                }`}
              >
                Report
              </button>
            </nav>
          )}

          {/* Student Specific top navigation indicator */}
          {currentUser.role === 'Student' && (
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-200">
              <span className="text-[11px] font-black text-[#78521b] bg-[#fbf5e2] border border-[#a88d55]/40 px-3 py-1 rounded-full uppercase tracking-wider">
                Student desk: {currentUser.name}
              </span>
            </div>
          )}
        </div>

        {/* Right side aligned "Account widget" with gold circle profile icon */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#fdfaf0] hover:bg-[#f2e9cf] rounded-xl text-sm font-bold text-[#78521b] transition-all cursor-pointer border border-[#a88d55]/40"
          >
            <div className="w-7 h-7 rounded-full bg-[#78521b] flex items-center justify-center text-[#fdf6e2] shrink-0 shadow-sm">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <span>Account</span>
            <ChevronDown className="w-3 h-3 text-[#78521b]" />
          </button>

          {/* Account drop down matching list options of screenshot 3 */}
          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#fffef7] border-2 border-[#78521b] rounded-2xl shadow-xl py-2 z-50 shrink-0 text-left font-sans select-none animate-fade-in text-[#462d0e]">
              <div className="px-4 py-1.5 border-b border-[#78521b]/20 mb-1">
                <p className="text-[10px] font-bold text-[#8c7855] uppercase tracking-wider font-mono">My Profile</p>
                <p className="text-xs font-black text-[#5c3f15] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-gray-600">{currentUser.username}</p>
              </div>

              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  alert(`Logged in as: ${currentUser.name}\nRole: ${currentUser.role}\nStudent/Account ID: ${currentUser.studentId || "N/A"}`);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10 transition-all flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-[#78521b]/15 text-[#78521b] flex items-center justify-center"><UserCheck className="w-2.5 h-2.5" /></div>
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                   setShowAccountMenu(false);
                   alert("Simulating standard password reset request inside digital desk. Please enter credentials as normal.");
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10 transition-all flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-[#78521b]/15 text-[#78521b] flex items-center justify-center">🔐</div>
                <span>Change Password</span>
              </button>

              <hr className="border-[#78521b]/20 my-1.5" />

              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-all flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-700 ml-0.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 
        RESPONSIVE FALLBACK LINKS ON MOBILE SCREEN TO SWITCH MODULES 
      */}
      {currentUser.role !== 'Student' && (
        <div className="lg:hidden w-full bg-[#fdf9ee] border-b-2 border-[#78521b]/40 px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 z-20">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentTab === 'dashboard' ? 'bg-[#78521b] text-[#fdf6e2]' : 'bg-white border border-[#a88d55]/40 text-[#78521b]'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab('books')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentTab === 'books' ? 'bg-[#78521b] text-[#fdf6e2]' : 'bg-white border border-[#a88d55]/40 text-[#78521b]'}`}
          >
            Books
          </button>
          <button 
            onClick={() => setCurrentTab('issue-return')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentTab === 'issue-return' ? 'bg-[#78521b] text-[#fdf6e2]' : 'bg-white border border-[#a88d55]/40 text-[#78521b]'}`}
          >
            Issue
          </button>
          <button 
            onClick={() => setCurrentTab('students')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentTab === 'students' ? 'bg-[#78521b] text-[#fdf6e2]' : 'bg-white border border-[#a88d55]/40 text-[#78521b]'}`}
          >
            Student
          </button>
          {currentUser.role === 'Admin' && (
            <button 
              onClick={() => setCurrentTab('librarians')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentTab === 'librarians' ? 'bg-[#78521b] text-[#fdf6e2]' : 'bg-white border border-[#a88d55]/40 text-[#78521b]'}`}
            >
              Librarian
            </button>
          )}
          <button 
            onClick={() => setCurrentTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentTab === 'reports' ? 'bg-[#78521b] text-[#fdf6e2]' : 'bg-white border border-[#a88d55]/40 text-[#78521b]'}`}
          >
            Report
          </button>
        </div>
      )}

      {/* CORE WORKSPACE VIEW */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-12 py-8 relative">

        {/* 
          1. STUDENT DESK HOME OPTION (IMAGE 4 LAYOUT)
          - Centered layout
          - Shows 5 clickable dynamic blocks
        */}
        {currentUser.role === 'Student' && !studentActiveFilterModule && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-black text-[#462d0e] tracking-tight uppercase border-b-2 border-[#78521b]/30 pb-3 max-w-sm mx-auto">🏛️ Student Hub 🏛️</h2>
              <p className="text-sm text-[#78521b] font-medium mt-3">Manage requests, view outstanding penalties, and track borrowing catalogs from the academic archives.</p>
            </div>

            {/* Grid layout containing exactly 5 cards shown in Image 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Card 1: SEARCH BOOKS */}
              <div 
                onClick={() => {
                  setStudentActiveFilterModule('SEARCH');
                  setCurrentTab('books');
                }}
                className="bg-[#fcf7ea] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-[#78521b] transition-all cursor-pointer flex flex-col text-center hover:scale-[1.01]"
              >
                <div className="bg-[#78521b] border-b border-[#54370f] py-3.5 px-4 text-center font-black text-[#fdf6e2] text-xs tracking-widest leading-none uppercase">
                  SEARCH FOR BOOKS
                </div>
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=400&auto=format&fit=crop" 
                    alt="Search Books" 
                    className="w-full h-full object-cover object-center sepia-[20%] opacity-90 contrast-[105%]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#78521b]/5 flex items-center justify-center">
                    <div className="bg-[#78521b] p-3 rounded-full shadow-lg border border-[#54370f]">
                      <Search className="w-6 h-6 text-[#fdf6e2]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: VIEW BOOK REQUESTS */}
              <div 
                onClick={() => setStudentActiveFilterModule('REQUESTS')}
                className="bg-[#fcf7ea] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-[#78521b] transition-all cursor-pointer flex flex-col text-center hover:scale-[1.01]"
              >
                <div className="bg-[#78521b] border-b border-[#54370f] py-3.5 px-4 text-center font-black text-[#fdf6e2] text-xs tracking-widest leading-none uppercase">
                  VIEW BOOK REQUESTS
                </div>
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1513001900722-370f803f498d?q=80&w=400&auto=format&fit=crop" 
                    alt="Book Requests" 
                    className="w-full h-full object-cover object-center sepia-[20%] opacity-90 contrast-[105%]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#78521b]/5 flex items-center justify-center">
                    <span className="bg-[#78521b] text-[#fdf6e2] font-black text-xs px-4 py-2 rounded-full shadow border border-[#54370f] uppercase tracking-wider">
                      {studentRequestedRecords.length} Requests Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: ISSUED */}
              <div 
                onClick={() => setStudentActiveFilterModule('ISSUED')}
                className="bg-[#fcf7ea] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-[#78521b] transition-all cursor-pointer flex flex-col text-center hover:scale-[1.01]"
              >
                <div className="bg-[#78521b] border-b border-[#54370f] py-3.5 px-4 text-center font-black text-[#fdf6e2] text-xs tracking-widest leading-none uppercase">
                  ACTIVE BORROWS
                </div>
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop" 
                    alt="Issued books" 
                    className="w-full h-full object-cover object-center sepia-[20%] opacity-90 contrast-[105%]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#78521b]/5 flex items-center justify-center">
                    <span className="bg-[#78521b] text-[#fdf6e2] font-black text-xs px-4 py-2 rounded-full shadow border border-[#54370f] uppercase tracking-wider">
                      {studentIssuedRecords.length} Active Items Out
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: RETURNED */}
              <div 
                onClick={() => setStudentActiveFilterModule('RETURNED')}
                className="bg-[#fcf7ea] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-[#78521b] transition-all cursor-pointer flex flex-col text-center hover:scale-[1.01]"
              >
                <div className="bg-[#78521b] border-b border-[#54370f] py-3.5 px-4 text-center font-black text-[#fdf6e2] text-xs tracking-widest leading-none uppercase">
                  RETURNED COMPLETIONS
                </div>
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={returnedBanner} 
                    alt="Returned books" 
                    className="w-full h-full object-cover object-center sepia-[20%] opacity-90 contrast-[105%]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#78521b]/5 flex flex-col items-center justify-center gap-2">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#78521b]/40 shadow-lg bg-[#fdf9ee] flex items-center justify-center">
                      <img 
                        src={returnedBooksIcon} 
                        alt="Returned Books Emblem" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="bg-[#7a541c] text-[#fdf6e2] font-black text-xs px-4 py-2 rounded-full shadow border border-[#3d2607] uppercase tracking-wider">
                      {studentReturnedRecords.length} Historic Logs
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 5: PENALTIES/CHARGES */}
              <div 
                onClick={() => setStudentActiveFilterModule('PENALTIES')}
                className="bg-[#fcf7ea] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-[#78521b] transition-all cursor-pointer flex flex-col text-center hover:scale-[1.01]"
              >
                <div className="bg-[#7a541c] border-b border-[#3d2607] py-3.5 px-4 text-center font-black text-[#fdf6e2] text-xs tracking-widest leading-none uppercase">
                  PENALTIES & CHARGES
                </div>
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400&auto=format&fit=crop" 
                    alt="Penalties and fines stamp" 
                    className="w-full h-full object-cover object-center sepia-[20%] opacity-90 contrast-[105%]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#78521b]/10 flex items-center justify-center">
                    <span className="bg-red-800 text-[#fdf6e2] font-black text-xs px-4 py-2 rounded-full shadow border border-red-950 uppercase tracking-wider">
                      Unpaid Amt: ₹{studentOverdueRecords.reduce((sum, r) => sum + r.fineAmount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 
          2. DETAILED INNER VIEWS SWITCH BASED ON SELECTIONS 
        */}

        {/* Student Desk specific inner sub-views */}
        {currentUser.role === 'Student' && studentActiveFilterModule && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#78521b]/30 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-[#462d0e] uppercase tracking-tight">
                  {studentActiveFilterModule === 'REQUESTS' && 'Pending Library Issue Requests'}
                  {studentActiveFilterModule === 'ISSUED' && 'Currently Checked Out Items'}
                  {studentActiveFilterModule === 'RETURNED' && 'Returned Volume Logbook History'}
                  {studentActiveFilterModule === 'PENALTIES' && 'Fines & Account Accruals Desk'}
                </h3>
                <p className="text-xs text-[#78521b] font-mono">Student ID: {currentUser.studentId}</p>
              </div>

              <button
                onClick={() => setStudentActiveFilterModule(null)}
                className="px-4 py-2 text-xs font-bold text-[#78521b] bg-[#fffef7] border-2 border-[#a88d55]/40 rounded-xl hover:bg-[#78521b] hover:text-[#fdf6e2] transition-all cursor-pointer shadow-sm"
              >
                ← Back to Student Hub
              </button>
            </div>

            {/* REQUESTS LIST */}
            {studentActiveFilterModule === 'REQUESTS' && (
              <div className="bg-[#fffef7] border-2 border-[#a88d55]/45 rounded-2xl p-6 shadow-md space-y-4">
                {studentRequestedRecords.length === 0 ? (
                  <p className="text-sm text-[#78521b] py-8 text-center font-medium">No active requests found. Explore the Book Catalog to request textbooks!</p>
                ) : (
                  <div className="divide-y divide-[#78521b]/10">
                    {studentRequestedRecords.map(r => (
                      <div key={r.id} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-extrabold text-sm text-[#462d0e]">{r.bookTitle}</p>
                          <p className="text-[11px] text-[#78521b] font-medium">Requested Date: {r.issueDate}</p>
                        </div>
                        <span className="px-3 py-1 text-[11px] font-black bg-amber-500/10 text-amber-800 border border-amber-500/25 rounded-lg uppercase tracking-wider">
                          Awaiting Desk Officer Approval
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ISSUED ITEMS LIST */}
            {studentActiveFilterModule === 'ISSUED' && (
              <div className="bg-[#fffef7] border-2 border-[#a88d55]/45 rounded-2xl p-6 shadow-md space-y-4">
                {studentIssuedRecords.length === 0 ? (
                  <p className="text-sm text-[#78521b] py-8 text-center font-medium">No currently borrowed textbooks found.</p>
                ) : (
                  <div className="divide-y divide-[#78521b]/10">
                    {studentIssuedRecords.map(r => (
                      <div key={r.id} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-extrabold text-sm text-[#462d0e]">{r.bookTitle}</p>
                          <p className="text-xs text-[#a855f7] font-bold">Due Back Date: {r.dueDate}</p>
                          <p className="text-[11px] text-[#78521b] mt-0.5">Checked-out Date: {r.issueDate}</p>
                        </div>
                        <span className="px-3 py-1 text-[11px] font-black bg-emerald-500/10 text-emerald-800 border border-emerald-500/25 rounded-lg uppercase tracking-wider">
                          Actively Issued
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RETURNED HISTORY */}
            {studentActiveFilterModule === 'RETURNED' && (
              <div className="bg-[#fffef7] border-2 border-[#a88d55]/45 rounded-2xl p-6 shadow-md space-y-6">
                {/* Official Return Stamp Emblem Logo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-left animate-fade-in font-sans">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm relative">
                    <img 
                      src={bookshelfLogo} 
                      alt="Returned completions logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      Verified Clearance Registry
                      <span className="bg-emerald-700 text-[#fdf6e2] text-[8px] px-1.5 py-0.5 rounded font-mono font-black uppercase">Cleared</span>
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                      All credentials and loaned textbooks listed below have been physically verified, re-shelved, and cleared of all account dues by campus desk officers.
                    </p>
                  </div>
                </div>

                {studentReturnedRecords.length === 0 ? (
                  <div className="text-center py-10 max-w-sm mx-auto space-y-4">
                    <div className="h-44 overflow-hidden rounded-2xl border-2 border-[#a88d55]/40 shadow-inner">
                      <img 
                        src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=400&auto=format&fit=crop" 
                        alt="Completed stack of library books returned" 
                        className="w-full h-full object-cover sepia-[15%] contrast-[105%]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#462d0e] text-sm uppercase">No Checked-in Logs</h4>
                      <p className="text-xs text-[#78521b] mt-1.5 font-bold leading-relaxed">
                        Any issued books you return to campus dropboxes will appear here with confirmation stamps once cleared by staff officers.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-[#78521b]/10">
                    {studentReturnedRecords.map(r => {
                      const matchedBk = books.find(b => b.id === r.bookId || b.title.toLowerCase() === r.bookTitle.toLowerCase());
                      const cat = matchedBk?.category || "Others";
                      const map: Record<string, string> = {
                        "Applied Sciences": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=150&auto=format&fit=crop",
                        "Business Administration": "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=150&auto=format&fit=crop",
                        "Engineering & Technology": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=150&auto=format&fit=crop",
                        "Literature & Fiction": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=150&auto=format&fit=crop",
                        "Biographies & Memoirs": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
                        "History & Politics": "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=150&auto=format&fit=crop",
                      };
                      const coverUrl = map[cat] || "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=150&auto=format&fit=crop";

                      return (
                        <div key={r.id} className="py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-left">
                          <div className="flex gap-4 items-center">
                            <img 
                              src={coverUrl} 
                              alt="Book cover" 
                              referrerPolicy="no-referrer"
                              className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl border-2 border-[#a88d55]/40 shadow-sm shrink-0"
                            />
                            <div>
                              <p className="font-extrabold text-sm text-[#462d0e]">{r.bookTitle}</p>
                              <div className="text-[11px] text-[#78521b] space-y-0.5 mt-1 font-bold">
                                <p>Author: <span className="text-[#462d0e]">{matchedBk?.author || "Academic Publisher"}</span></p>
                                <p>Borrowed On: <span className="text-gray-700">{r.issueDate}</span></p>
                                <p>Returned On: <span className="text-emerald-700 font-extrabold">{r.returnDate || "Cleared"}</span></p>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 sm:self-center text-[10px] font-black bg-[#78521b]/10 text-[#78521b] border-2 border-[#78521b]/15 rounded-xl uppercase tracking-wider shrink-0 mt-2 sm:mt-0">
                            Returned Complete
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PENALTIES & CHARGES INTERACTIVE ACCRUAL MODULE */}
            {studentActiveFilterModule === 'PENALTIES' && (
              <div className="bg-[#fffef7] border-2 border-[#a88d55]/45 rounded-2xl p-6 shadow-md space-y-6">
                <div className="text-left border-b border-[#78521b]/10 pb-3">
                  <h4 className="font-extrabold text-[#462d0e] text-sm uppercase tracking-wide">Overdue fine list & settled bills</h4>
                  <p className="text-xs text-[#78521b] font-semibold mt-1">Fines accrue at ₹5.00 per day for each book past due after 1 week.</p>
                </div>

                {studentOverdueRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-10 h-10 text-[#78521b] mx-auto mb-2" />
                    <p className="text-sm font-extrabold text-[#462d0e]">Your account record is in pristine standing!</p>
                    <p className="text-xs text-[#78521b] mt-1 font-medium">Zero unpaid penalties or late returns currently listed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="divide-y divide-[#78521b]/10">
                      {studentOverdueRecords.map(r => (
                        <div key={r.id} className="py-4 flex justify-between items-center text-left">
                          <div>
                            <p className="font-extrabold text-sm text-[#462d0e]">{r.bookTitle}</p>
                            <div className="text-[11px] text-[#78521b] space-y-0.5 mt-1 font-semibold">
                              <p>Checked-out (Issued): <span className="text-gray-700 font-bold">{r.issueDate}</span></p>
                              <p>Original Due Date: <span className="text-red-600 font-bold">{r.dueDate}</span></p>
                            </div>
                            <span className="text-xs font-bold text-red-700 mt-1 block">Accrued Fine Amt: ₹{r.fineAmount.toFixed(2)}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              handlePayFine(r.id);
                              alert(`Fine of ₹${r.fineAmount.toFixed(2)} for "${r.bookTitle}" has been settled digitally!`);
                            }}
                            className="px-4 py-2 bg-[#78521b] hover:bg-[#5c3f15] text-[#fdf6e2] font-black text-[11px] rounded-xl transition-all cursor-pointer shadow border border-[#3d2607] uppercase tracking-wider"
                          >
                            Pay ₹{r.fineAmount.toFixed(0)} Fine
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#fcf7ea] p-4 rounded-2xl flex items-center justify-between border-2 border-[#a88d55]/30">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-5 h-5 text-red-700" />
                        <div>
                          <p className="text-xs font-extrabold text-[#462d0e] uppercase tracking-wide">Total Outstanding Penalty balance</p>
                          <p className="text-[10px] text-[#78521b] font-medium">Must be paid to keep desk requests active.</p>
                        </div>
                      </div>
                      <span className="text-xl font-black text-red-700">
                        ₹{studentOverdueRecords.reduce((sum, r) => sum + r.fineAmount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Default standard pages for other roles, or student browsing card catalog */}
        {((currentUser.role !== 'Student') || (studentActiveFilterModule === 'SEARCH')) && (
          <div>
            {currentTab === 'dashboard' && (
              <Dashboard 
                books={books} 
                students={students} 
                records={records} 
                branches={branches}
                onNavigate={(tab) => {
                  setStudentActiveFilterModule(null);
                  setCurrentTab(tab);
                }} 
                currentUser={currentUser}
              />
            )}
            
            {currentTab === 'books' && (
              <BookManagement 
                books={books} 
                onAddBook={handleAddBook} 
                onUpdateBook={handleUpdateBook} 
                onDeleteBook={handleDeleteBook} 
                currentUser={currentUser}
                records={records}
                onRequestBook={handleRequestBook}
              />
            )}

            {currentTab === 'students' && currentUser.role !== 'Student' && (
              <StudentManagement 
                students={students} 
                records={records} 
                onAddStudent={handleAddStudent} 
                onUpdateStudent={handleUpdateStudent} 
                onDeleteStudent={handleDeleteStudent}
                currentUser={currentUser}
              />
            )}

            {currentTab === 'issue-return' && currentUser.role !== 'Student' && (
              <IssueReturnModule 
                books={books} 
                students={students} 
                records={records} 
                onIssueBook={handleIssueBook} 
                onReturnBook={handleReturnBook} 
                onPayFine={handlePayFine} 
                onApproveRequest={handleApproveRequest}
                onDeclineRequest={handleDeclineRequest}
              />
            )}

            {currentTab === 'reports' && currentUser.role !== 'Student' && (
              <Reports 
                books={books} 
                students={students} 
                records={records} 
              />
            )}

            {currentTab === 'librarians' && currentUser.role === 'Admin' && (
              <LibrarianManagement 
                librarians={librarians}
                onAddLibrarian={handleAddLibrarian}
                onUpdateLibrarian={handleUpdateLibrarian}
                onDeleteLibrarian={handleDeleteLibrarian}
              />
            )}
          </div>
        )}

      </main>

      {/* Styled academic minimal footer */}
      <footer className="border-t-4 border-[#78521b] bg-[#fdf9ee] py-6 shrink-0 mt-auto select-none">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:sm:row items-center justify-between gap-4 text-xs text-[#78521b]/80">
          <p>© 2026 Hoysala Degree College Library System. All physical rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#462d0e] cursor-pointer">Desk Rules SLA</span>
            <span className="hover:text-[#462d0e] cursor-pointer">Fine Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
