import React, { useState } from 'react';
import { Book, Student, IssueRecord, User, Branch } from '../types';
import { Building2, MapPin, Phone, CalendarDays, Plus, CheckCircle } from 'lucide-react';

interface DashboardProps {
  books: Book[];
  students: Student[];
  records: IssueRecord[];
  branches: Branch[];
  onNavigate: (tab: string) => void;
  currentUser?: User | null;
}

export default function Dashboard({ books, students, records, branches = [], currentUser }: DashboardProps) {
  // Compute dynamic stats based on realistic state
  const totalUniqueBooks = books.length;
  const totalCategories = new Set(books.map((b) => b.category)).size;
  const totalPhysicalBooksCount = books.reduce((sum, b) => sum + b.copiesTotal, 0);

  const cardItems = [
    {
      id: "c-books",
      title: "Books record",
      countValue: totalUniqueBooks,
      subText: "records",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "c-cats",
      title: "Book category record",
      countValue: totalCategories,
      subText: "records",
      imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "c-total",
      title: "No. of Books in Library",
      countValue: totalPhysicalBooksCount,
      subText: "records",
      imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop"
    }
  ];

  return (
    <div className="space-y-12 font-sans py-4">
      {/* Centered Dashboard Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-[#462d0e] tracking-tight uppercase border-b-2 border-[#78521b]/30 pb-3 max-w-xs mx-auto">
          System Dashboard
        </h1>
      </div>

      {/* Grid of three vertical cards center-aligned balanced layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 sm:px-6">
        {cardItems.map((card) => (
          <div 
            key={card.id} 
            className="bg-[#fcf7ea] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-[#78521b] transition-all flex flex-col hover:scale-[1.01]"
          >
            {/* Top section: Clean Image representation */}
            <div className="w-full h-48 md:h-52 overflow-hidden bg-amber-50 shrink-0 relative">
              <img 
                src={card.imageUrl} 
                alt={card.title} 
                className="w-full h-full object-cover object-center sepia-[20%] opacity-90 contrast-[105%]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#78521b]/5 mix-blend-multiply" />
            </div>

            {/* Middle section: Large count indicator and label */}
            <div className="flex-1 flex flex-col justify-center items-center py-7 px-4 text-center bg-[#fffef7] border-b border-[#a88d55]/20">
              <span className="text-5xl font-black text-[#5c3f15] leading-none tracking-tight">
                {card.countValue}
              </span>
              <span className="text-xs font-bold text-[#8c7855] mt-1.5 uppercase tracking-widest">
                {card.subText}
              </span>
            </div>

            {/* Bottom section: Ancient label strip */}
            <div className="bg-[#78521b] py-3.5 px-4 text-center select-none shrink-0 border-t border-[#54370f]">
              <span className="text-xs font-extrabold text-[#fdf6e2] block truncate tracking-widest uppercase">
                {card.title}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

