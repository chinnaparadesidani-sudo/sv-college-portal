const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./college_portal.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables and insert sample data
function initializeDatabase() {
  // Create tables sequentially
  db.serialize(() => {
    // Create branches table
    db.run(`CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )`);

    // Create sections table
    db.run(`CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )`);

    // Create semesters table
    db.run(`CREATE TABLE IF NOT EXISTS semesters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL
    )`);

    // Create subjects table
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      faculty TEXT NOT NULL
    )`);

    // Create timetable_slots table
    db.run(`CREATE TABLE IF NOT EXISTS timetable_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      time_range TEXT NOT NULL,
      semester_type TEXT DEFAULT 'default'
    )`);

    // Create timetables table
    db.run(`CREATE TABLE IF NOT EXISTS timetables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL,
      section_id INTEGER NOT NULL,
      semester_id INTEGER NOT NULL,
      day TEXT NOT NULL,
      slot_id INTEGER NOT NULL,
      subject_id INTEGER,
      FOREIGN KEY (branch_id) REFERENCES branches (id),
      FOREIGN KEY (section_id) REFERENCES sections (id),
      FOREIGN KEY (semester_id) REFERENCES semesters (id),
      FOREIGN KEY (slot_id) REFERENCES timetable_slots (id),
      FOREIGN KEY (subject_id) REFERENCES subjects (id)
    )`);

    // Create previous_year_papers table
    db.run(`CREATE TABLE IF NOT EXISTS previous_year_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      semester_id INTEGER NOT NULL,
      file_path TEXT,
      FOREIGN KEY (branch_id) REFERENCES branches (id),
      FOREIGN KEY (semester_id) REFERENCES semesters (id)
    )`);

    // Create syllabus table
    db.run(`CREATE TABLE IF NOT EXISTS syllabus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL,
      semester_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY (branch_id) REFERENCES branches (id),
      FOREIGN KEY (semester_id) REFERENCES semesters (id)
    )`);

    // Create syllabus_sections table
    db.run(`CREATE TABLE IF NOT EXISTS syllabus_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      syllabus_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY (syllabus_id) REFERENCES syllabus (id)
    )`);

    // Create syllabus_topics table
    db.run(`CREATE TABLE IF NOT EXISTS syllabus_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      topic TEXT NOT NULL,
      FOREIGN KEY (section_id) REFERENCES syllabus_sections (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
        return;
      }
      
      // After all tables are created, check if data exists
      checkAndInsertData();
    });
  });
}

// Check if data exists and insert if needed
function checkAndInsertData() {
  db.get("SELECT COUNT(*) as count FROM branches", (err, row) => {
    if (err) {
      console.error('Error checking data:', err.message);
      return;
    }

    // Insert sample data if tables are empty
    if (row.count === 0) {
      console.log('Database is empty, inserting sample data...');
      insertSampleData();
    } else {
      console.log('Database already contains data.');
    }
  });
}

// Insert sample data
function insertSampleData() {
  // Insert branches
  const branches = ['CSE', 'ECE', 'CSM'];
  branches.forEach(branch => {
    db.run('INSERT INTO branches (name) VALUES (?)', [branch]);
  });

  // Insert sections
  const sections = ['A', 'B', 'C'];
  sections.forEach(section => {
    db.run('INSERT INTO sections (name) VALUES (?)', [section]);
  });

  // Insert semesters
  for (let i = 1; i <= 8; i++) {
    db.run('INSERT INTO semesters (number) VALUES (?)', [i]);
  }

  // Insert subjects
  const subjects = [
    { code: '23A31401T', name: 'Machine Learning', faculty: 'D. Masthan Pasha' },
    { code: '23A37501T', name: 'Cloud Computing', faculty: 'K. Kishore Kumar' },
    { code: '23A50601T', name: 'Cryptography & Network Security', faculty: 'Dr. M. Jaya Bhaskar' },
    { code: '23A50602A', name: 'Software Testing Methodologies', faculty: 'P. Ram Prasad' },
    { code: '23A50603A', name: 'Software Project Management', faculty: 'G. Parvathi' },
    { code: '23A31601', name: 'Chemistry of Polymers and Applications', faculty: 'Dr. Z. Raveendra Babu' },
    { code: '23A31401P', name: 'Machine Learning Lab', faculty: 'P. Ram Prasad' },
    { code: '23A50601P', name: 'Cryptography & Network Security Lab', faculty: 'Dr. M. Jaya Bhaskar' },
    { code: '23A52501', name: 'Soft Skills', faculty: 'T. Sanjeeva Prasad' },
    { code: '23A52601', name: 'Technical Paper Writing & IPR', faculty: 'B. Soma Sekhara Reddy' },
    { code: 'CRT001', name: 'CRT - Aptitude', faculty: 'CRT Faculty' },
    { code: '23A11101P', name: 'Engineering Physics/Engineering Workshop Lab', faculty: 'DR.P.Sreenivasula Reddy' },
    { code: '23A11103T', name: 'Programming in C', faculty: 'Mr.G.Sreenivasulu' },
    { code: '23A11102T', name: 'Basic Chemistry', faculty: 'dr.z.Ravindra Babu' },
    { code: '23A11104P', name: 'Engineering Graphics Practice', faculty: 'Mr.B.Saroj kumar' },
    { code: '23A11105T', name: 'Introduction to Web Technologies', faculty: 'Computer Science Faculty' },
    { code: '23A11106T', name: 'Aptitude Skills', faculty: 'Training Faculty' },
    { code: '23A11107T', name: 'Mathematics for Engineers', faculty: 'Mr.M.firoj ali baig' },
    { code: '23A11108T', name: 'Engineering Graphics', faculty: 'Mr.B.saroj kumar' },
    { code: '23A11109T', name: 'Linear algebra & calculus', faculty: 'Mr.M.firoj ali baig' },
    { code: '23A11110T', name: 'Health and Wellness', faculty: 'Mrs.T.silpa' },
    { code: '23A11111T', name: 'Engineering Physics', faculty: 'Dr.P.sreenivasulu' },
    { code: '23A11112T', name: 'Yoga and Sports', faculty: 'Mr.M.ravi kumar' },
    { code: 'LIB001', name: 'Library Hour', faculty: 'Library Staff' },
    { code: '23A11113P', name: 'C Programming Lab', faculty: 'Computer Science Faculty' },
    { code: '23A11114T', name: 'Soft Skills', faculty: 'English Faculty' },
    { code: 'SPORTS001', name: 'Sports Activities', faculty: 'Physical Education Faculty' },
    { code: '23A11115P', name: 'Electrical and Electronics Engineering Workshop', faculty: 'EEE Faculty' },
    { code: '23A11116T', name: 'Basic Electrical and Electronics Engineering (ECE)', faculty: 'ECE Faculty' },
    { code: '23A11117P', name: 'Information Technology/Chemistry Lab', faculty: 'IT/Chemistry Faculty' },
    { code: '23A11118T', name: 'Chemistry', faculty: 'Chemistry Faculty' },
    { code: '23A11119T', name: 'Basic Electrical and Electronics Engineering (EEE)', faculty: 'EEE Faculty' },
    { code: 'NSS001', name: 'National Service Scheme', faculty: 'NSS Coordinator' }
  ];

  subjects.forEach(subject => {
    db.run('INSERT INTO subjects (code, name, faculty) VALUES (?, ?, ?)', 
      [subject.code, subject.name, subject.faculty]);
  });

  // Insert timetable slots
  const defaultSlots = [
    { name: '9:30-10:20 1', time_range: '9:30 am - 10:20 am', semester_type: 'default' },
    { name: '10:20-11:10 2', time_range: '10:20 am - 11:10 am', semester_type: 'default' },
    { name: 'tea Break', time_range: '11:10 am - 11:30 am', semester_type: 'default' },
    { name: '11:30 am - 12:20  3', time_range: '11:30 am - 12:20 pm', semester_type: 'default' },
    { name: '12:20 pm - 1:10 pm 4', time_range: '12:20 pm - 1:10 pm', semester_type: 'default' },
    { name: 'Lunch Break', time_range: '1:10 pm - 2:00 pm', semester_type: 'default' },
    { name: '2:00 pm - 2:50 pm 5', time_range: '2:00 pm - 2:50 pm', semester_type: 'default' },
    { name: '2:50 pm - 3:40 pm 6', time_range: '2:50 pm - 3:40 pm', semester_type: 'default' },
    { name: '3:40 pm - 4:30 pm 7', time_range: '3:40 pm - 4:30 pm', semester_type: 'default' }
  ];

  const sem1Slots = [
    { name: 'P1  9:30am-10:20am ', time_range: ' 9:30 am - 10:20 am', semester_type: 'sem1' },
    { name: 'P2 10:20-11:10', time_range: '10:20 am - 11:10 am', semester_type: 'sem1' },
    { name: 'P3 11:10am-12:00pm', time_range: '11:10 am - 12:00 pm', semester_type: 'sem1' },
    { name: 'LUNCH BREAK ', time_range: '12:00 pm - 12:50 pm', semester_type: 'sem1' },
    { name: 'P4 12:50pm-1:40pm ', time_range: ' 12:50pm-1:40pm', semester_type: 'sem1' },
    { name: 'P5 1:40 pm - 2:30 pm ', time_range: '1:40 pm - 2:30 pm', semester_type: 'sem1' },
    { name: 'tea Break', time_range: '2:30pm-2:50pm', semester_type: 'sem1' },
    { name: 'P6 2:50 pm - 3:40 pm ', time_range: '2:50 pm - 3:40 pm', semester_type: 'sem1' },
    { name: 'P7 3:40 pm - 4:30 pm ', time_range: '3:40 pm - 4:30 pm', semester_type: 'sem1' }
  ];

  defaultSlots.forEach(slot => {
    db.run('INSERT INTO timetable_slots (name, time_range, semester_type) VALUES (?, ?, ?)', 
      [slot.name, slot.time_range, slot.semester_type]);
  });

  sem1Slots.forEach(slot => {
    db.run('INSERT INTO timetable_slots (name, time_range, semester_type) VALUES (?, ?, ?)', 
      [slot.name, slot.time_range, slot.semester_type]);
  });

  // Insert timetable data for CSE-6-A
  const cse6aTimetable = {
    Monday: ["ML", "STM", "Break", "CPA", "CNS", "Lunch", "CC", "ML Lab", "ML Lab"],
    Tuesday: ["CPA", "CNS", "Break", "ML", "STM", "Lunch", "CC", "CRT-SS", "CC"],
    Wednesday: ["CRT-APT", "TPW", "Break", "CPA", "SPM", "Lunch", "STM", "SOFT-SKILLS LAB", "SOFT-SKILLS LAB"],
    Thursday: ["STM", "SPM", "Break", "CNS-LAB2", "CNS-LAB2", "Lunch", "SPM", "CRT-APT", "CC"],
    Friday: ["ML", "STM", "Break", "SPM", "CNS", "Lunch", "SPM", "CNS", "SPORTS"],
    Saturday: ["CNS", "CC", "Break", "ML", "CPA", "Lunch", "ML", "CPA", "LIB"]
  };

  // Function to insert timetable data
  function insertTimetableData(branchName, semesterNumber, sectionName, timetableData) {
    // Get IDs
    db.get('SELECT id FROM branches WHERE name = ?', [branchName], (err, branchRow) => {
      if (err) {
        console.error(err.message);
        return;
      }

      db.get('SELECT id FROM semesters WHERE number = ?', [semesterNumber], (err, semesterRow) => {
        if (err) {
          console.error(err.message);
          return;
        }

        db.get('SELECT id FROM sections WHERE name = ?', [sectionName], (err, sectionRow) => {
          if (err) {
            console.error(err.message);
            return;
          }

          // Get all slots for the appropriate semester type
          const semesterType = semesterNumber === 1 ? 'sem1' : 'default';
          db.all('SELECT id FROM timetable_slots WHERE semester_type = ? ORDER BY id', [semesterType], (err, slotRows) => {
            if (err) {
              console.error(err.message);
              return;
            }

            // Insert timetable data
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            days.forEach(day => {
              const daySubjects = timetableData[day];
              
              daySubjects.forEach((subjectName, index) => {
                const slotId = slotRows[index].id;
                
                // Find subject ID if it's not a break
                if (subjectName !== 'Break' && subjectName !== 'Lunch' && subjectName !== 'tea Break') {
                  db.get('SELECT id FROM subjects WHERE name LIKE ?', [`%${subjectName}%`], (err, subjectRow) => {
                    if (err) {
                      console.error(err.message);
                      return;
                    }
                    
                    const subjectId = subjectRow ? subjectRow.id : null;
                    
                    db.run('INSERT INTO timetables (branch_id, section_id, semester_id, day, slot_id, subject_id) VALUES (?, ?, ?, ?, ?, ?)', 
                      [branchRow.id, sectionRow.id, semesterRow.id, day, slotId, subjectId], (err) => {
                      if (err) {
                        console.error(err.message);
                      }
                    });
                  });
                } else {
                  // Insert break or lunch without subject
                  db.run('INSERT INTO timetables (branch_id, section_id, semester_id, day, slot_id, subject_id) VALUES (?, ?, ?, ?, ?, ?)', 
                    [branchRow.id, sectionRow.id, semesterRow.id, day, slotId, null], (err) => {
                    if (err) {
                      console.error(err.message);
                    }
                  });
                }
              });
            });
          });
        });
      });
    });
  }

  // Insert sample timetable data
  insertTimetableData('CSE', 6, 'A', cse6aTimetable);

  // Insert previous year papers
  const csePapers = [
    { title: 'Data Structures', year: 2022, semester: 3 },
    { title: 'Algorithms', year: 2022, semester: 3 },
    { title: 'Database Management Systems', year: 2022, semester: 4 },
    { title: 'Operating Systems', year: 2022, semester: 4 },
    { title: 'Computer Networks', year: 2021, semester: 5 },
    { title: 'Theory of Computation', year: 2021, semester: 5 },
    { title: 'Machine Learning', year: 2021, semester: 6 },
    { title: 'Cloud Computing', year: 2021, semester: 6 },
    { title: 'Software Engineering', year: 2020, semester: 7 },
    { title: 'Web Technologies', year: 2020, semester: 7 }
  ];

  db.get('SELECT id FROM branches WHERE name = ?', ['CSE'], (err, branchRow) => {
    if (err) {
      console.error(err.message);
      return;
    }

    csePapers.forEach(paper => {
      db.get('SELECT id FROM semesters WHERE number = ?', [paper.semester], (err, semesterRow) => {
        if (err) {
          console.error(err.message);
          return;
        }

        db.run('INSERT INTO previous_year_papers (branch_id, title, year, semester_id) VALUES (?, ?, ?, ?)', 
          [branchRow.id, paper.title, paper.year, semesterRow.id], (err) => {
          if (err) {
            console.error(err.message);
          }
        });
      });
    });
  });

  // Insert syllabus data
  const cseSyllabus = {
    1: {
      title: 'CSE - Semester 1 Syllabus',
      sections: [
        {
          title: 'Mathematics I',
          topics: [
            'Calculus and Linear Algebra',
            'Differential Equations',
            'Vector Calculus'
          ]
        },
        {
          title: 'Engineering Physics',
          topics: [
            'Mechanics',
            'Optics',
            'Thermodynamics'
          ]
        },
        {
          title: 'Basic Electrical Engineering',
          topics: [
            'DC Circuits',
            'AC Circuits',
            'Electrical Machines'
          ]
        }
      ]
    }
  };

  function insertSyllabusData(branchName, semesterNumber, syllabusData) {
    // Get IDs
    db.get('SELECT id FROM branches WHERE name = ?', [branchName], (err, branchRow) => {
      if (err) {
        console.error(err.message);
        return;
      }

      db.get('SELECT id FROM semesters WHERE number = ?', [semesterNumber], (err, semesterRow) => {
        if (err) {
          console.error(err.message);
          return;
        }

        // Insert syllabus
        db.run('INSERT INTO syllabus (branch_id, semester_id, title) VALUES (?, ?, ?)', 
          [branchRow.id, semesterRow.id, syllabusData.title], function(err) {
          if (err) {
            console.error(err.message);
            return;
          }

          const syllabusId = this.lastID;

          // Insert sections and topics
          syllabusData.sections.forEach(section => {
            db.run('INSERT INTO syllabus_sections (syllabus_id, title) VALUES (?, ?)', 
              [syllabusId, section.title], function(err) {
              if (err) {
                console.error(err.message);
                return;
              }

              const sectionId = this.lastID;

              section.topics.forEach(topic => {
                db.run('INSERT INTO syllabus_topics (section_id, topic) VALUES (?, ?)', 
                  [sectionId, topic], (err) => {
                  if (err) {
                    console.error(err.message);
                  }
                });
              });
            });
          });
        });
      });
    });
  }

  // Insert sample syllabus data
  insertSyllabusData('CSE', 1, cseSyllabus[1]);

  console.log('Sample data inserted successfully.');
}

// API Routes

// Get all branches
app.get('/api/branches', (req, res) => {
  db.all('SELECT * FROM branches', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all sections
app.get('/api/sections', (req, res) => {
  db.all('SELECT * FROM sections', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all semesters
app.get('/api/semesters', (req, res) => {
  db.all('SELECT * FROM semesters ORDER BY number', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get timetable slots for a specific semester type
app.get('/api/timetable-slots/:semesterType', (req, res) => {
  const semesterType = req.params.semesterType;
  
  db.all('SELECT * FROM timetable_slots WHERE semester_type = ? ORDER BY id', [semesterType], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get timetable for a specific branch, semester, and section
app.get('/api/timetable/:branch/:semester/:section', (req, res) => {
  const branchName = req.params.branch;
  const semesterNumber = parseInt(req.params.semester);
  const sectionName = req.params.section;
  
  // Get IDs
  db.get('SELECT id FROM branches WHERE name = ?', [branchName], (err, branchRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!branchRow) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }
    
    db.get('SELECT id FROM semesters WHERE number = ?', [semesterNumber], (err, semesterRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!semesterRow) {
        res.status(404).json({ error: 'Semester not found' });
        return;
      }
      
      db.get('SELECT id FROM sections WHERE name = ?', [sectionName], (err, sectionRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (!sectionRow) {
          res.status(404).json({ error: 'Section not found' });
          return;
        }
        
        // Get timetable data
        const query = `
          SELECT t.day, ts.name as slot_name, ts.time_range, s.code, s.name as subject_name, s.faculty
          FROM timetables t
          JOIN timetable_slots ts ON t.slot_id = ts.id
          LEFT JOIN subjects s ON t.subject_id = s.id
          WHERE t.branch_id = ? AND t.semester_id = ? AND t.section_id = ?
          ORDER BY t.day, ts.id
        `;
        
        db.all(query, [branchRow.id, semesterRow.id, sectionRow.id], (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          // Get timetable slots for the semester
          const semesterType = semesterNumber === 1 ? 'sem1' : 'default';
          db.all('SELECT * FROM timetable_slots WHERE semester_type = ? ORDER BY id', [semesterType], (err, slots) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            
            // Format the response
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const timetable = {};
            
            days.forEach(day => {
              timetable[day] = [];
              
              slots.forEach(slot => {
                const entry = rows.find(row => row.day === day && row.slot_name === slot.name);
                
                if (entry) {
                  if (entry.subject_name) {
                    timetable[day].push(entry.subject_name);
                  } else {
                    // For breaks or lunch
                    if (slot.name.toLowerCase().includes('break') || slot.name.toLowerCase().includes('lunch')) {
                      timetable[day].push(slot.name);
                    } else {
                      timetable[day].push('Free');
                    }
                  }
                } else {
                  timetable[day].push('Free');
                }
              });
            });
            
            // Get subject details
            db.all('SELECT code, name, faculty FROM subjects', (err, subjects) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              
              const subjectDetails = {};
              subjects.forEach(subject => {
                subjectDetails[subject.name] = {
                  code: subject.code,
                  name: subject.name,
                  faculty: subject.faculty
                };
              });
              
              res.json({
                timetable,
                subjectDetails,
                slots
              });
            });
          });
        });
      });
    });
  });
});

// Get previous year papers for a branch
app.get('/api/papers/:branch', (req, res) => {
  const branchName = req.params.branch;
  
  db.get('SELECT id FROM branches WHERE name = ?', [branchName], (err, branchRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!branchRow) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }
    
    const query = `
      SELECT p.title, p.year, s.number as semester
      FROM previous_year_papers p
      JOIN semesters s ON p.semester_id = s.id
      WHERE p.branch_id = ?
      ORDER BY s.number, p.year DESC
    `;
    
    db.all(query, [branchRow.id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json(rows);
    });
  });
});

// Get syllabus for a branch and semester
app.get('/api/syllabus/:branch/:semester', (req, res) => {
  const branchName = req.params.branch;
  const semesterNumber = parseInt(req.params.semester);
  
  db.get('SELECT id FROM branches WHERE name = ?', [branchName], (err, branchRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!branchRow) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }
    
    db.get('SELECT id FROM semesters WHERE number = ?', [semesterNumber], (err, semesterRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!semesterRow) {
        res.status(404).json({ error: 'Semester not found' });
        return;
      }
      
      db.get('SELECT * FROM syllabus WHERE branch_id = ? AND semester_id = ?', 
        [branchRow.id, semesterRow.id], (err, syllabusRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (!syllabusRow) {
          res.status(404).json({ error: 'Syllabus not found' });
          return;
        }
        
        db.all('SELECT * FROM syllabus_sections WHERE syllabus_id = ?', [syllabusRow.id], (err, sectionRows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          const sections = [];
          let completedSections = 0;
          
          if (sectionRows.length === 0) {
            res.json({
              title: syllabusRow.title,
              sections
            });
            return;
          }
          
          sectionRows.forEach(sectionRow => {
            db.all('SELECT topic FROM syllabus_topics WHERE section_id = ?', [sectionRow.id], (err, topicRows) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              
              const topics = topicRows.map(topicRow => topicRow.topic);
              
              sections.push({
                title: sectionRow.title,
                topics
              });
              
              completedSections++;
              
              if (completedSections === sectionRows.length) {
                res.json({
                  title: syllabusRow.title,
                  sections
                });
              }
            });
          });
        });
      });
    });
  });
});

// Get all subjects
app.get('/api/subjects', (req, res) => {
  db.all('SELECT * FROM subjects', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});