export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  copiesTotal: number;
  copiesAvailable: number;
  location: string; // e.g., "Shelf A-4"
  cost?: string;
  barcode?: string;
  description?: string;
  status?: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone: string;
  department: string;
  rollNo: string;
  status: 'Active' | 'Suspended';
  password?: string;
}

export interface IssueRecord {
  id: string;
  bookId: string;
  studentId: string;
  bookTitle: string;
  studentName: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD or null
  fineAmount: number;
  finePaid: boolean;
  status: 'Issued' | 'Returned' | 'Overdue' | 'Requested';
}

export type UserRole = 'Admin' | 'Librarian' | 'Student';

export interface Librarian {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  establishedYear: number;
  contactNumber: string;
}

export interface User {
  username: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  studentId?: string;
}
