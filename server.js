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
    SELECT e.EmployeeID, e.EmployeeName,e.Email, pa.Allocation
    FROM Employees e
    JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    WHERE pa.Allocation = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});

// API endpoint to get employees with positive allocation
app.get('/employees/drafts', (req, res) => {
  const query = `
    SELECT e.EmployeeID, e.EmployeeName,e.Email, pa.Allocation
    FROM Employees e
    JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    WHERE pa.Allocation > 0.00
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});
app.get('/employees', (req, res) => {
  const query = `
    SELECT e.EmployeeID, e.EmployeeName,e.Email, pa.Allocation
    FROM Employees e
    JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
   
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
        c.startDate,
        c.endDate,
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
