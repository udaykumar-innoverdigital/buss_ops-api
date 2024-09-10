import express from 'express';
import cors from 'cors';
import mysql from 'mysql'; // Import MySQL

const app = express();
const port = 5000;

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'syedanwar@2002',
  database: 'ninja',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit process with error code
  }
  console.log('Database connected');
});

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// API endpoint to get employees with zero allocation
app.get('/employees/todo', (req, res) => {
  const query = `
    SELECT e.EmployeeID, e.EmployeeName, e.Email, COALESCE(pa.Allocation, 0) AS Allocation
    FROM Employees e
    LEFT JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    WHERE e.HasProjectAssigned = 0
    GROUP BY e.EmployeeID, e.EmployeeName, e.Email
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});
app.get('/employees/drafts', (req, res) => {
  const query = `
    SELECT e.EmployeeID, e.EmployeeName, e.Email, 
           COALESCE(SUM(pa.Allocation), 0) AS Allocation
    FROM Employees e
    LEFT JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    WHERE pa.Allocation IS NOT NULL AND pa.Allocation > 0
    GROUP BY e.EmployeeID, e.EmployeeName, e.Email
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Handle case where no employees are found
    if (results.length === 0) {
      return res.status(404).send('No employees with allocations found');
    }

    res.json(results);
  });
});

app.put('/api/allocate', (req, res) => {
  const {
    EmployeeID,
    ClientName,
    ProjectName,
    Allocation,
    Role,
    AllocationStartDate,
    AllocationEndDate,
    TimesheetApproval, // New field
    BillingRate        // New field
  } = req.body;
console.log(AllocationEndDate)
  // Validate required fields
  if (!EmployeeID || !ClientName || !ProjectName || Allocation === undefined || !AllocationStartDate || !AllocationEndDate || TimesheetApproval === undefined || BillingRate === undefined) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: 'Transaction error', error: err });
    }

    // Retrieve ClientID
    db.query(
      'SELECT ClientID FROM clients WHERE ClientName = ?',
      [ClientName],
      (err, clientRows) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ message: 'Database query error', error: err }));
        }

        if (clientRows.length === 0) {
          return db.rollback(() => res.status(404).json({ message: 'Client not found' }));
        }
        const clientID = clientRows[0].ClientID;

        // Retrieve ProjectID
        db.query(
          'SELECT ProjectID FROM projects WHERE ProjectName = ? AND ClientID = ?',
          [ProjectName, clientID],
          (err, projectRows) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ message: 'Database query error', error: err }));
            }

            if (projectRows.length === 0) {
              return db.rollback(() => res.status(404).json({ message: 'Project not found' }));
            }
            const projectID = projectRows[0].ProjectID;

            // Check if the assignment already exists
            db.query(
              'SELECT * FROM projectassignments WHERE ProjectID = ? AND EmployeeID = ?',
              [projectID, EmployeeID],
              (err, assignmentRows) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ message: 'Query error', error: err }));
                }

                if (assignmentRows.length > 0) {
                  // Update existing assignment
                  db.query(
                    'UPDATE projectassignments SET Allocation = ?, Role = ?, AllocationStartDate = ?, AllocationEndDate = ?, TimesheetApproval = ?, BillingRate = ? WHERE ProjectID = ? AND EmployeeID = ?',
                    [Allocation, Role, AllocationStartDate, AllocationEndDate, TimesheetApproval, BillingRate, projectID, EmployeeID],
                    (err) => {
                      if (err) {
                        return db.rollback(() => res.status(500).json({ message: 'Update error', error: err }));
                      }

                      // Commit transaction
                      db.commit((err) => {
                        if (err) {
                          return db.rollback(() => res.status(500).json({ message: 'Commit error', error: err }));
                        }

                        res.status(200).json({ message: 'Allocation updated successfully' });
                      });
                    }
                  );
                } else {
                  // Insert new assignment
                  db.query(
                    'INSERT INTO projectassignments (ProjectID, EmployeeID, Allocation, Role, AllocationStartDate, AllocationEndDate, TimesheetApproval, BillingRate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [projectID, EmployeeID, Allocation, Role, AllocationStartDate, AllocationEndDate, TimesheetApproval, BillingRate],
                    (err) => {
                      if (err) {
                        return db.rollback(() => res.status(500).json({ message: 'Insert error', error: err }));
                      }

                      // Update employee status
                      db.query(
                        'UPDATE employees SET HasProjectAssigned = 1 WHERE EmployeeID = ?',
                        [EmployeeID],
                        (err) => {
                          if (err) {
                            return db.rollback(() => res.status(500).json({ message: 'Update error', error: err }));
                          }

                          // Commit transaction
                          db.commit((err) => {
                            if (err) {
                              return db.rollback(() => res.status(500).json({ message: 'Commit error', error: err }));
                            }

                            res.status(200).json({ message: 'Allocation added successfully' });
                          });
                        }
                      );
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  });
});

app.get('/employees', (req, res) => {
  const query = `
    SELECT e.EmployeeID, e.EmployeeName, e.Email, COALESCE(SUM(pa.Allocation), 0) AS Allocation
    FROM Employees e
    LEFT JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    GROUP BY e.EmployeeID, e.EmployeeName, e.Email,Allocation
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});

app.get('/clients', (req, res) => {
  const query = `
    SELECT ClientID, ClientName, Status, Country, StartDate, EndDate, NoOfProjects, NoOfEmployees
    FROM Clients
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});

app.get('/client/:clientId/projects', (req, res) => {
  const clientId = req.params.clientId;

  // Query to get all projects for a specific client
  const query = `
    SELECT ProjectID, ProjectName, Status, Category
    FROM Projects
    WHERE ClientID = ?
  `;

  db.query(query, [clientId], (err, projects) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    if (projects.length === 0) {
      return res.status(404).send('No projects found for this client');
    }

    res.json(projects);
  });
});
app.get('/client/:clientname/allprojects', (req, res) => {
  const encodedclientName = req.params.clientname;
  const ClientName = decodeURIComponent(encodedclientName); // Decode the URL-encoded project name
  console.log(ClientName);
  // First, query the Client table to get the ClientID
  const getClientIDQuery = `
    SELECT ClientID
    FROM Clients
    WHERE ClientName = ?
  `;

  db.query(getClientIDQuery, [ClientName], (err, results) => {
    if (err) {
      console.error('Error executing query to get ClientID:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Client not found');
    }

    const clientId = results[0].ClientID;

    // Now, query the Projects table to get projects for this ClientID
    const getProjectsQuery = `
      SELECT ProjectID, ProjectName, Status, Category
      FROM Projects
      WHERE ClientID = ?
    `;

    db.query(getProjectsQuery, [clientId], (err, projects) => {
      if (err) {
        console.error('Error executing query to get projects:', err);
        return res.status(500).send('Internal Server Error');
      }
      
      if (projects.length === 0) {
        return res.status(404).send('No projects found for this client');
      }

      res.json(projects);
    });
  });
});
// API endpoint to get employees working on a specific project by project name
app.get('/project/:name/employees', (req, res) => {
  // Extract the project name from the URL parameter
  const encodedProjectName = req.params.name;
  const projectName = decodeURIComponent(encodedProjectName); // Decode the URL-encoded project name
  console.log(projectName);
  // SQL query to search by project name
  const query = `
    SELECT e.EmployeeID,e.Role,e.EmployeeName, e.Email, pa.Allocation
    FROM Employees e
    JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    JOIN Projects p ON pa.ProjectID = p.ProjectID
    WHERE p.ProjectName = ?
  `;

  db.query(query, [projectName], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});



app.get('/detailed-view/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;

  if (!employeeId) {
    return res.status(400).send('Employee ID is required');
  }

  const query = `
    SELECT 
        e.EmployeeName,
        e.EmployeeID,
        c.ClientName,
        p.ProjectName,
        pa.Allocation,
        p.Status AS ProjectStatus,
        pa.AllocationStartDate,
        pa.AllocationEndDate,
        'View Details' AS Actions
    FROM Employees e
    JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    JOIN Projects p ON pa.ProjectID = p.ProjectID
    JOIN Clients c ON p.ClientID = c.ClientID
    WHERE e.EmployeeID = ?
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});

// API to update allocation data
app.put('/form/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const { clientId, status, allocation } = req.body;

  // Validate request body
  if (clientId === undefined || status === undefined || allocation === undefined) {
    return res.status(400).send('All fields are required');
  }

  if (isNaN(allocation)) {
    return res.status(400).send('Invalid allocation percentage');
  }

  const validStatuses = ['allocated', 'unallocated'];
  if (!validStatuses.includes(status)) {
    return res.status(400).send('Invalid status');
  }

  // Update ProjectAssignments table
  const updateQuery = `
    UPDATE ProjectAssignments
    SET Allocation = ?, Role = ?
    WHERE EmployeeID = ? AND ProjectID IN (SELECT ProjectID FROM Projects WHERE ClientID = ?)
  `;

  db.query(updateQuery, [allocation, status, employeeId, clientId], (err, result) => {
    if (err) {
      console.error('Error executing update query:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('No project assignment found for this employee and client');
    }

    res.status(200).send('Allocation updated successfully');
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
