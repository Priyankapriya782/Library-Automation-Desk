import React from 'react';
import { BookOpen, Lock, UserCheck } from 'lucide-react';

interface HomePageProps {
  onEnterLogin: (initialRole?: 'Librarian' | 'Admin' | 'Student') => void;
  onEnterRegister: () => void;
}

export default function HomePage({ onEnterLogin, onEnterRegister }: HomePageProps) {
  return (
    <div className="min-h-screen bg-[#f5eeda] flex flex-col font-sans select-none overflow-x-hidden relative" style={{
      backgroundImage: `radial-gradient(circle at 20% 20%, rgba(198, 160, 82, 0.05) 0%, transparent 60%), repeating-linear-gradient(rgba(0,0,0,0.003) 0px, rgba(0,0,0,0.003) 1px, transparent 1px, transparent 4px)`
    }}>
      
      {/* 
        Header bar matching screenshot perfectly:
        - White background
        - "Library Automation Desk" on the left
        - Removed Home, About, Contact
        - Right side aligned Login and Register buttons in specific green styling
      */}
      <header className="sticky top-0 z-50 w-full bg-[#fdf9ee] border-b-4 border-[#78521b] px-6 sm:px-12 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-black text-[#462d0e] tracking-wider uppercase">
          🏛️ Library Automation Desk 🏛️
        </h1>

        {/* Right side aligned buttons with theme badges */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => onEnterLogin('Student')}
            className="flex items-center gap-2 text-sm font-bold text-[#78521b] hover:text-[#462d0e] hover:scale-102 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#78521b] flex items-center justify-center text-[#fdf6e2] shrink-0 shadow-md border border-[#54370f]">
              <Lock className="w-4 h-4" />
            </div>
            <span>Login Entry</span>
          </button>

          <button
            onClick={onEnterRegister}
            className="flex items-center gap-2 text-sm font-bold text-[#78521b] hover:text-[#462d0e] hover:scale-102 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#78521b] flex items-center justify-center text-[#fdf6e2] shrink-0 shadow-md border border-[#54370f]">
              <UserCheck className="w-4 h-4" />
            </div>
            <span>Register Desk</span>
          </button>
        </div>
      </header>

      {/* 
        Hero Banner Content underneath Header
        - Covers the full view, using the actual image of students matching screen 1
        - Includes the bold text in white overlay
      */}
      <div className="flex-1 relative min-h-[450px] sm:min-h-[600px] flex items-center px-6 sm:px-16 py-12 z-10 overflow-hidden">
        
        {/* Background Image matches general look */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1800&auto=format&fit=crop" 
            alt="Library Study Desk" 
            className="w-full h-full object-cover object-center scale-102 sepia-[30%] contrast-[105%]"
            referrerPolicy="no-referrer"
          />
          {/* Subtle vignette/shading overlay with historical warm filter */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
        </div>

        {/* Hero content aligned exactly on the left as shown in print */}
        <div className="relative z-10 max-w-4xl text-left text-[#fdf6e2] space-y-5">
          <span className="text-xs font-black uppercase tracking-widest text-[#c6a052] bg-black/40 px-3.5 py-1.5 rounded-full border border-[#c6a052]/30 inline-block">
            HOYSALA DEGREE COLLEGE ARCHIVES
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight uppercase border-b-2 border-[#c6a052]/30 pb-4 max-w-xl">
            Library Desk
          </h2>
          <p className="text-base sm:text-lg text-[#fdf6e2]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
            Settle Overdue Penalties, Register Student Clearance Accounts, and Search Books directly with an elegant physical-inspired academic hub.
          </p>
        </div>
      </div>
    </div>
  );
}
