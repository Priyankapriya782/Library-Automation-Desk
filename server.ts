import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

app.use(express.json());

// Initial seed data structures
const INITIAL_BOOKS: any[] = [];

const INITIAL_STUDENTS: any[] = [];

const INITIAL_RECORDS: any[] = [];

const INITIAL_LIBRARIANS = [
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

const INITIAL_BRANCHES = [
  {
    id: "BR-101",
    name: "Hoysala Central Branch",
    code: "HCB-01",
    location: "Main Science & Commerce Campus, 1st Floor",
    establishedYear: 2011,
    contactNumber: "9123456781"
  }
];

// Read or initialize database schema
function getLibraryData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const dataStr = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(dataStr);
      // Clean slate migration: Clear default preloaded seed books/students from earlier iterations
      if (parsed.books && parsed.books.length > 0 && parsed.books.some((b: any) => b.id === "B-101")) {
        console.log("Emptying old seed library catalogs...");
        parsed.books = [];
        parsed.students = [];
        parsed.records = [];
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
      }
      return parsed;
    }
  } catch (err) {
    console.error("Failed to read database.json, rebuilding default.", err);
  }

  const defaultDbData = {
    books: INITIAL_BOOKS,
    students: INITIAL_STUDENTS,
    records: INITIAL_RECORDS,
    librarians: INITIAL_LIBRARIANS,
    branches: INITIAL_BRANCHES
  };
  
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDbData, null, 2), "utf-8");
  } catch (err) {
    console.error("Unable to seed database.json", err);
  }
  return defaultDbData;
}

// Write to database
function saveLibraryData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save to database.json", err);
  }
}

// API endpoint to fetch the synchronized catalog and student state
app.get("/api/library-data", (req, res) => {
  const data = getLibraryData();
  res.json(data);
});

// API endpoint to post changes from any device
app.post("/api/library-data", (req, res) => {
  try {
    const freshData = req.body;
    if (freshData && typeof freshData === "object") {
      const db = getLibraryData();
      
      // Update fields if provided in request
      if (freshData.books) db.books = freshData.books;
      if (freshData.students) db.students = freshData.students;
      if (freshData.records) db.records = freshData.records;
      if (freshData.librarians) db.librarians = freshData.librarians;
      if (freshData.branches) db.branches = freshData.branches;

      saveLibraryData(db);
      res.json({ success: true, message: "Database compiled and synced successfully.", data: db });
    } else {
      res.status(400).json({ error: "Invalid data payload." });
    }
  } catch (err) {
    res.status(500).json({ error: "Server-side synchronization fault." });
  }
});

async function runExpress() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Synchronization Link active at: http://localhost:${PORT}`);
  });
}

runExpress();
