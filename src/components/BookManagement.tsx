import React, { useState } from 'react';
import { Book, User, IssueRecord } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  HelpCircle, 
  BookMarked,
  Filter,
  Check,
  MapPin,
  CalendarDays,
  Send,
  ArrowLeft
} from 'lucide-react';

interface BookManagementProps {
  books: Book[];
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  currentUser?: User | null;
  onRequestBook?: (bookId: string) => void;
  records?: IssueRecord[];
}

export default function BookManagement({ 
  books, 
  onAddBook, 
  onUpdateBook, 
  onDeleteBook,
  currentUser,
  onRequestBook,
  records = []
}: BookManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All'); // All, Available, OOS

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null); // null means adding a new book

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPublisher, setFormPublisher] = useState('');
  const [formYear, setFormYear] = useState<number | ''>('');
  const [formCopiesTotal, setFormCopiesTotal] = useState<number | ''>('');
  const [formLocation, setFormLocation] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('Available');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isStudent = currentUser?.role === 'Student';

  // List of Unique Categories
  const categoriesList = ['All', 'Computer Science', 'Commerce', 'Business management', 'General Knowledge'];

  // Filtering Logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm) ||
      book.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || book.category.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesAvailability = true;
    if (availabilityFilter === 'Available') {
      matchesAvailability = book.copiesAvailable > 0;
    } else if (availabilityFilter === 'OOS') {
      matchesAvailability = book.copiesAvailable === 0;
    }

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Open Modal Helper
  const openAddModal = () => {
    // Auto-generate random ID
    const nextNum = Math.floor(100 + Math.random() * 900);
    setFormId(`B-${nextNum}`);
    setFormTitle('');
    setFormAuthor('');
    setFormIsbn('');
    setFormCategory('');
    setFormPublisher('');
    setFormYear('');
    setFormCopiesTotal('');
    setFormLocation('');
    setFormCost('');
    setFormBarcode('');
    setFormDescription('');
    setFormStatus('Available');
    setFormErrorMessage('');
    setCurrentBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setFormId(book.id);
    setFormTitle(book.title);
    setFormAuthor(book.author);
    setFormIsbn(book.isbn);
    setFormCategory(book.category);
    setFormPublisher(book.publisher);
    setFormYear(book.year);
    setFormCopiesTotal(book.copiesTotal);
    setFormLocation(book.location);
    setFormCost(book.cost || '');
    setFormBarcode(book.barcode || '');
    setFormDescription(book.description || '');
    setFormStatus(book.status || 'Available');
    setFormErrorMessage('');
    setCurrentBook(book);
    setIsModalOpen(true);
  };

  // Submit Helper
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');

    if (!formTitle.trim() || !formAuthor.trim() || !formIsbn.trim() || !formCategory) {
      setFormErrorMessage('Please fill in all required fields (Book Title, Author, ISBN, Category).');
      return;
    }

    const copiesNum = Number(formCopiesTotal);
    if (formCopiesTotal === '' || isNaN(copiesNum) || copiesNum < 1) {
      setFormErrorMessage('Total copies must be a number greater than or equal to 1.');
      return;
    }

    const yearNum = formYear === '' ? new Date().getFullYear() : Number(formYear);

    // Check duplicate ID for newly created books
    if (currentBook === null && books.some(b => b.id.toLowerCase() === formId.toLowerCase())) {
      setFormErrorMessage(`A book with ID ${formId} already exists.`);
      return;
    }

    // Determine copies available difference
    let updatedCopiesAvailable = copiesNum;
    if (currentBook) {
      const copiesBorrowedNow = currentBook.copiesTotal - currentBook.copiesAvailable;
      updatedCopiesAvailable = copiesNum - copiesBorrowedNow;
      if (updatedCopiesAvailable < 0) {
        setFormErrorMessage(`Cannot decrease total copies to ${copiesNum} because ${copiesBorrowedNow} copies are actively lent out.`);
        return;
      }
    }

    // Default location to 'Unassigned' if empty or not provided
    const resolvedLocation = formLocation.trim() || 'Unassigned';

    const bookData: Book = {
      id: formId,
      title: formTitle,
      author: formAuthor,
      isbn: formIsbn,
      category: formCategory,
      publisher: formPublisher || 'N/A',
      year: yearNum,
      copiesTotal: copiesNum,
      copiesAvailable: updatedCopiesAvailable,
      location: resolvedLocation,
      cost: formCost,
      barcode: formBarcode,
      description: formDescription,
      status: formStatus
    };

    if (currentBook) {
      onUpdateBook(bookData);
    } else {
      onAddBook(bookData);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {!isModalOpen ? (
        <>
          {/* Title block */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffef7] border-2 border-[#a88d55]/40 p-6 rounded-2xl shadow-md">
            <div>
              <h1 className="text-2xl font-black text-[#462d0e] tracking-tight flex items-center gap-2 uppercase">
                <BookMarked className="w-6 h-6 text-[#78521b]" />
                Book Catalog Maintenance
              </h1>
              <p className="text-sm text-[#78521b] mt-1 font-semibold">
                {isStudent 
                  ? "Browse available catalog books and request digital checking permissions."
                  : "Maintain, customize, register, and locate digital library catalogs."
                }
              </p>
            </div>
            {!isStudent && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#78521b] hover:bg-[#926628] text-[#fdf6e2] rounded-xl text-xs font-black uppercase tracking-wider border border-[#54370f] shadow transition-all hover:-translate-y-0.5 cursor-pointer animate-fade-in"
              >
                <Plus className="w-4 h-4 text-[#fdf6e2]" />
                Add New Book
              </button>
            )}
          </div>

          {/* Filter Options */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 p-4 rounded-2xl shadow grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#78521b]" />
              <input
                type="text"
                placeholder="Search by Title, Author, ISBN, Book ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-semibold placeholder-[#8c7855] text-[#2b1a05] transition-all"
              />
            </div>

            {/* Category select */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-bold text-[#2b1a05] cursor-pointer appearance-none shadow-sm"
              >
                <option value="All">All Book Genres</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Business management">Business management</option>
                <option value="General Knowledge">General Knowledge</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#78521b]">
                ▼
              </div>
            </div>

            {/* Availability select */}
            <div className="relative">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="block w-full px-3.5 py-2.5 bg-[#fdfcf3] border-2 border-[#a88d55]/40 focus:border-[#78521b] focus:outline-none rounded-xl text-xs font-bold text-[#2b1a05] cursor-pointer appearance-none shadow-sm"
              >
                <option value="All">All Availabilities</option>
                <option value="Available">In Stock / Available</option>
                <option value="OOS">Out of Stock</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#78521b]">
                ▼
              </div>
            </div>
          </div>

          {/* Book Database Table list layout */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#78521b]/20">
                <thead className="bg-[#fcf7ea]/70 text-[10px] font-black text-[#78521b] uppercase tracking-widest text-left">
                  <tr>
                    <th className="px-6 py-4">ID / Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Isbn / Year</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Remaining Quantity</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#78521b]/15 text-xs text-[#462d0e] bg-[#fffef7]">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                        <HelpCircle className="w-12 h-12 mx-auto stroke-1 text-slate-600 mb-3" />
                        No books match your criteria. Try redefining search tokens.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => {
                      const isLow = book.copiesAvailable <= 1;
                      const isOutOfStock = book.copiesAvailable === 0;

                      // Student request state determination
                      const studentRecord = isStudent && currentUser?.studentId 
                        ? records.find(r => r.bookId === book.id && r.studentId === currentUser.studentId && r.status !== 'Returned')
                        : null;

                      return (
                        <tr key={book.id} className="hover:bg-[#78521b]/5 transition-all">
                          <td className="px-6 py-4 max-w-xs">
                            <div className="font-extrabold text-[#78521b]/80 font-mono text-[10px]">{book.id}</div>
                            <div className="font-extrabold text-[#462d0e] text-sm tracking-tight truncate mt-0.5">{book.title}</div>
                          </td>
                          <td className="px-6 py-4 truncate max-w-[150px] font-bold text-[#462d0e]">
                            {book.author}
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-[#78521b]/90 space-y-0.5">
                            <div className="text-[#462d0e] font-bold">{book.isbn}</div>
                            <div className="flex items-center gap-1 font-semibold text-[#8c7855]">
                              <CalendarDays className="w-3 h-3 text-[#78521b]/70" />
                              <span>{book.year} (pub)</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-[#78521b]/10 border border-[#78521b]/20 text-[#78521b] font-bold rounded-lg text-[10px]">
                              {book.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={`px-2.5 py-1 text-xs font-black rounded-xl flex items-center gap-1.5 border ${
                                isOutOfStock 
                                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-800' 
                                  : isLow 
                                    ? 'bg-amber-500/15 border border-amber-500/20 text-amber-800'
                                    : 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-600' : isLow ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                                {book.copiesAvailable} / {book.copiesTotal} left
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isStudent ? (
                              <div className="flex justify-end">
                                {studentRecord ? (
                                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider ${
                                    studentRecord.status === 'Requested' 
                                      ? 'bg-amber-500/10 border border-amber-500/25 text-amber-800'
                                      : studentRecord.status === 'Overdue'
                                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-800 font-bold animate-pulse'
                                        : 'bg-purple-500/10 border border-purple-500/25 text-purple-800'
                                  }`}>
                                    {studentRecord.status === 'Requested' ? 'Pending Approval' : studentRecord.status}
                                  </span>
                                ) : isOutOfStock ? (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] bg-[#78521b]/10 border border-[#78521b]/20 text-[#78521b]/60 font-black tracking-widest uppercase select-none">
                                    Out of Stock
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => onRequestBook && onRequestBook(book.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#78521b] hover:bg-[#5c3f15] text-[#fdf6e2] font-black rounded-xl text-[10px] border border-[#54370f] shadow transition-all hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                                  >
                                    <Send className="w-3 h-3" />
                                    Request Book
                                  </button>
                                )}
                              </div>
                            ) : (
                              /* Quick action controls for single-book instances */
                              deleteConfirmId === book.id ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      onDeleteBook(book.id);
                                      setDeleteConfirmId(null);
                                    }}
                                    className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-black text-[10px] border border-red-950 shadow"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2.5 py-1 bg-[#fcf7ea] hover:bg-[#78521b]/10 text-[#78521b] border border-[#a88d55]/30 rounded font-bold text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => openEditModal(book)}
                                    className="p-1.5 text-[#78521b] hover:text-[#462d0e] hover:bg-[#78521b]/10 rounded-lg transition-all cursor-pointer"
                                    title="Edit book file"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(book.id)}
                                    className="p-1.5 text-[#78521b] hover:text-red-700 hover:bg-red-700/10 rounded-lg transition-all cursor-pointer"
                                    title="Delete book records"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Header block for form */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffef7] border-2 border-[#a88d55]/40 p-6 rounded-2xl shadow-md">
            <div>
              <h1 className="text-2xl font-black text-[#462d0e] tracking-tight flex items-center gap-2 uppercase">
                <BookMarked className="w-6 h-6 text-[#78521b]" />
                {currentBook ? 'Modify Catalog Entry' : 'Register New Book Item'}
              </h1>
              <p className="text-sm text-[#78521b] mt-1 font-semibold">
                Update the metadata and holdings of the selected digital catalog publication.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#fdf6e2] hover:bg-[#fffef0] text-[#78521b] border border-[#a88d55] rounded-xl text-xs font-black uppercase tracking-wider shadow transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#78521b]" />
              Back to Catalog
            </button>
          </div>

          {/* Inline Form Card */}
          <div className="bg-[#fffef7] border-2 border-[#a88d55]/40 rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4 text-left">
                  {/* Book ID */}
                  <div>
                    <label className="parchment-label block mb-1">Book ID (Auto):</label>
                    <input
                      type="text"
                      disabled
                      value={formId}
                      className="block w-full px-3.5 py-2.5 bg-[#fffdf0] border border-[#a88d55]/30 rounded-xl text-xs font-semibold text-[#78521b]/60 cursor-not-allowed"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      Book Category: <span className="text-red-700 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="block w-full px-3.5 py-2.5 pr-8 parchment-input text-xs font-bold cursor-pointer appearance-none shadow-sm"
                      >
                        <option value="" disabled>Select book category</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Business management">Business management</option>
                        <option value="General Knowledge">General Knowledge</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#78521b]">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Book Name */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      Book Title: <span className="text-red-700 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Enter book title"
                      className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Book Author */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      Book Author: <span className="text-red-700 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="Enter Book author"
                      className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* ISBN Code */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      ISBN Code: <span className="text-red-700 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formIsbn}
                      onChange={(e) => setFormIsbn(e.target.value)}
                      placeholder="Enter ISBN number"
                      className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>

                </div>

                {/* Right Column */}
                <div className="space-y-4 text-left">
                  {/* Publisher & Year */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="parchment-label block mb-1 font-bold">Publisher:</label>
                      <input
                        type="text"
                        value={formPublisher}
                        onChange={(e) => setFormPublisher(e.target.value)}
                        placeholder="e.g. Academic Press"
                        className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="parchment-label block mb-1 font-bold">Publish Year:</label>
                      <input
                        type="number"
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Year"
                        className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                      />
                    </div>
                  </div>

                  {/* Total Copies */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      Total Copies: <span className="text-red-700 font-bold">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formCopiesTotal}
                      onChange={(e) => setFormCopiesTotal(e.target.value === '' ? '' : Number(e.target.value))}
                      className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Book Cost */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      Book Cost (INR):
                    </label>
                    <input
                      type="text"
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      placeholder="Enter Book cost"
                      className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Barcode */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      Barcode Identifier:
                    </label>
                    <input
                      type="text"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                      placeholder="Enter barcode"
                      className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Book Status */}
                  <div>
                    <label className="parchment-label block mb-1 font-bold">
                      Book Status:
                    </label>
                    <div className="relative">
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="block w-full px-3.5 py-2.5 pr-8 parchment-input text-xs font-bold cursor-pointer appearance-none shadow-sm"
                      >
                        <option value="Available">Available</option>
                        <option value="Reference Only">Reference Only</option>
                        <option value="Lost">Lost</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#78521b]">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Systematic Full-Width Book Description Summary */}
              <div className="border-t border-[#78521b]/10 pt-4 text-left">
                <label className="parchment-label block mb-1.5 font-bold">
                  Book Description Summary:
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Format: Title core references, chapter listings, index and visual catalog summaries..."
                  rows={4}
                  className="block w-full px-3.5 py-2.5 parchment-input text-xs font-semibold resize-none focus:outline-none focus:ring-2"
                />
              </div>

              {formErrorMessage && (
                <div className="bg-red-950/20 border border-red-500/30 text-red-800 text-xs px-3.5 py-2 rounded-xl font-bold">
                  {formErrorMessage}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#78521b]/20 flex justify-center items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-[#fdf6e2] hover:bg-[#fffef0] text-[#78521b] border border-[#a88d55] rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-12 py-2.5 bg-[#78521b] hover:bg-[#5c3f15] text-[#fdf6e2] font-black rounded-xl text-xs uppercase tracking-wider border border-[#54370f] cursor-pointer shadow-md transition-all"
                >
                  {currentBook ? 'Submit' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
