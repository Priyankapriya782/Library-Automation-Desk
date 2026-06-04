import { Book, Student, IssueRecord, Librarian, Branch } from './types';

// Seed Books Data
const INITIAL_BOOKS: Book[] = [];

// Seed Students Data
const INITIAL_STUDENTS: Student[] = [];

// Seed Issue Records Data
// Let's program dynamic dates so they look natural around the mock run time (2026-05-20)
const INITIAL_RECORDS: IssueRecord[] = [];

// Seed Librarians Data
const INITIAL_LIBRARIANS: Librarian[] = [
  {
    id: "L-201",
    name: "Vedha (Librarian)",
    username: "librarian1",
    email: "vedha@college.edu",
    phone: "9123456780",
    status: "Active"
  },
  {
    id: "L-202",
    name: "Kiran R.",
    username: "librarian2",
    email: "kiran@college.edu",
    phone: "9812345671",
    status: "Active"
  }
];

const INITIAL_BRANCHES: Branch[] = [
  {
    id: "BR-101",
    name: "Hoysala Central Branch",
    code: "HCB-01",
    location: "Main Science & Commerce Campus, 1st Floor",
    establishedYear: 2011,
    contactNumber: "9123456781"
  }
];

export const getLocalStorageData = () => {
  // Automatic cache reset flag to flush default old local storage mock books, students, and records
  if (!localStorage.getItem("lib_clean_slate_done_v2")) {
    localStorage.removeItem("lib_books");
    localStorage.removeItem("lib_students");
    localStorage.removeItem("lib_records");
    localStorage.setItem("lib_clean_slate_done_v2", "true");
  }

  const booksStr = localStorage.getItem("lib_books");
  const studentsStr = localStorage.getItem("lib_students");
  const recordsStr = localStorage.getItem("lib_records");
  const librariansStr = localStorage.getItem("lib_librarians");
  const branchesStr = localStorage.getItem("lib_branches");

  let parsedBooks: Book[] = booksStr ? JSON.parse(booksStr) : INITIAL_BOOKS;
  let parsedStudents: Student[] = studentsStr ? JSON.parse(studentsStr) : INITIAL_STUDENTS;
  let parsedRecords: IssueRecord[] = recordsStr ? JSON.parse(recordsStr) : INITIAL_RECORDS;
  let parsedLibrarians: Librarian[] = librariansStr ? JSON.parse(librariansStr) : INITIAL_LIBRARIANS;
  let parsedBranches: Branch[] = branchesStr ? JSON.parse(branchesStr) : INITIAL_BRANCHES;

  // Auto-migrate any old or lowercase categories to correct genres
  parsedBooks = parsedBooks.map(b => {
    let cat = b.category;
    if (cat.toLowerCase() === 'bca') cat = 'Computer Science';
    if (cat.toLowerCase() === 'bcom') cat = 'Commerce';
    if (cat.toLowerCase() === 'bba') cat = 'Business management';
    return { ...b, category: cat };
  });

  // Auto-migrate student departments to BCOM, BCA, BBA
  parsedStudents = parsedStudents.map(s => {
    let dept = s.department;
    if (dept.toLowerCase() === 'bca') dept = 'BCA';
    if (dept.toLowerCase() === 'bcom') dept = 'BCOM';
    if (dept.toLowerCase() === 'bba') dept = 'BBA';
    return { ...s, department: dept };
  });

  return {
    books: parsedBooks,
    students: parsedStudents,
    records: parsedRecords,
    librarians: parsedLibrarians,
    branches: parsedBranches,
  };
};

export const saveLocalStorageData = (
  books: Book[], 
  students: Student[], 
  records: IssueRecord[], 
  librarians?: Librarian[],
  branches?: Branch[]
) => {
  localStorage.setItem("lib_books", JSON.stringify(books));
  localStorage.setItem("lib_students", JSON.stringify(students));
  localStorage.setItem("lib_records", JSON.stringify(records));
  if (librarians) {
    localStorage.setItem("lib_librarians", JSON.stringify(librarians));
  }
  if (branches) {
    localStorage.setItem("lib_branches", JSON.stringify(branches));
  }
};

// Utilities for date manipulation
export function calculateOverdueFine(dueDateStr: string, returnDateStr: string | null = null, finePerDay: number = 5.0): number {
  const due = new Date(dueDateStr);
  const end = returnDateStr ? new Date(returnDateStr) : new Date();

  due.setHours(0,0,0,0);
  end.setHours(0,0,0,0);

  const diffTime = end.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays * finePerDay : 0;
}
