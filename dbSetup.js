import mysql from 'mysql';

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

  // Check and create tables
  checkAndCreateTables();
});

// Function to check and create tables
function checkAndCreateTables() {
  const checkTablesQuery = `
    SELECT COUNT(*) AS count FROM information_schema.tables 
    WHERE table_schema = 'ninja' AND table_name IN ('employees', 'projects', 'clients', 'projectassignments');
  `;

  db.query(checkTablesQuery, (err, results) => {
    if (err) {
      console.error('Error checking tables:', err);
    
      return;
    }

    const tableCount = results[0].count;

    if (tableCount < 4) {
      createTables();
    } else {
      console.log('All tables exist.');
      // Check if tables are empty
      checkIfTablesAreEmpty();
    }
  });
}

// Function to create tables
function createTables() {
  const tables = {
    employees: `
      CREATE TABLE IF NOT EXISTS Employees (
        EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
        EmployeeName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) UNIQUE NOT NULL,
        HasProjectAssigned BOOLEAN DEFAULT FALSE
      )
    `,
    clients: `
      CREATE TABLE IF NOT EXISTS Clients (
        ClientID INT AUTO_INCREMENT PRIMARY KEY,
        ClientName VARCHAR(255) UNIQUE NOT NULL,
        Status VARCHAR(50),
        Country VARCHAR(100),
        StartDate DATE,
        EndDate DATE,
        NoOfProjects INT DEFAULT 0,
        NoOfEmployees INT DEFAULT 0
      )
    `,
    projects: `
      CREATE TABLE IF NOT EXISTS Projects (
        ProjectID INT AUTO_INCREMENT PRIMARY KEY,
        ProjectName VARCHAR(255) NOT NULL,
        ClientID INT,
        Status VARCHAR(50),
        Category VARCHAR(100),
        FOREIGN KEY (ClientID) REFERENCES Clients(ClientID)
      )
    `,
    projectassignments: `
      CREATE TABLE IF NOT EXISTS ProjectAssignments (
        AssignmentID INT AUTO_INCREMENT PRIMARY KEY,
        ProjectID INT,
        EmployeeID INT,
        Allocation DECIMAL(5, 2),
        Role VARCHAR(100),
        AllocationStartDate DATE,
        AllocationEndDate DATE,
        TimesheetApproval BOOLEAN DEFAULT FALSE,
        BillingRate DECIMAL(10, 2),
        FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID),
        FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
      )
    `,
  };

  for (const table in tables) {
    db.query(tables[table], (err) => {
      if (err) {
        console.error(`Error creating table ${table}:`, err);
        return;
      }
      console.log(`Table ${table} is ready`);
    });
  }

  // Optionally insert some initial data
  checkIfTablesAreEmpty();
}

// Function to check if tables are empty
function checkIfTablesAreEmpty() {
  const checkEmptyQueries = {
    clients: 'SELECT COUNT(*) AS count FROM Clients',
    projects: 'SELECT COUNT(*) AS count FROM Projects',
    employees: 'SELECT COUNT(*) AS count FROM Employees',
    projectassignments: 'SELECT COUNT(*) AS count FROM ProjectAssignments'
  };

  let remainingTables = Object.keys(checkEmptyQueries).length;

  for (const table in checkEmptyQueries) {
    db.query(checkEmptyQueries[table], (err, results) => {
      if (err) {
        console.error(`Error checking if ${table} is empty:`, err);
        
        return;
      }

      const count = results[0].count;

      if (count === 0) {
        insertInitialData(table);
      } else {
        console.log(`${table} table is not empty. Skipping data insertion.`);
      }

      remainingTables--;

      if (remainingTables === 0) {
         // Close the database connection when done
      }
    });
  }
}

// Function to insert initial data
function insertInitialData(table) {
  const queries = {
    clients: `
      INSERT INTO Clients (ClientID, ClientName, NoOfProjects, Status, Country, StartDate, EndDate, NoOfEmployees) VALUES
      (1, 'White Cap', 3, 'progress', 'India', '2024-01-01', '2024-12-31', 100),
      (2, 'Frontier', 2, 'completed', 'India', '2024-03-01', '2024-09-30', 80),
      (3, 'BlueLinx', 4, 'not started', 'India', '2024-06-01', NULL, 90);
    `,
    projects: `
      INSERT INTO Projects (ProjectID, ClientID, ProjectName, Status, Category) VALUES
      (1, 1, 'Enterprise Resource Planning', 'Active', 'ERP'),
      (2, 1, 'Customer Relationship Management', 'Completed', 'CRM'),
      (3, 1, 'Human Resource Management System', 'On Hold', 'HRM'),
      (4, 2, 'Data Analytics Platform', 'Completed', 'Data Analytics'),
      (5, 2, 'E-Commerce Portal', 'Active', 'E-Commerce'),
      (6, 3, 'Supply Chain Management', 'Active', 'Supply Chain'),
      (7, 3, 'Digital Transformation', 'Active', 'Digital Transformation'),
      (8, 3, 'IT Infrastructure Upgrade', 'Active', 'Infrastructure'),
      (9, 3, 'Cybersecurity Enhancement', 'Active', 'Security');
    `,
    employees: `
      INSERT INTO Employees (EmployeeID, EmployeeName, Role, Status, Email, HasProjectAssigned) VALUES
      (1, 'Amit Kumar', 'Software Engineer', 'Active', 'amit.kumar@example.com', 1),
      (2, 'Sita Sharma', 'Systems Analyst', 'Active', 'sita.sharma@example.com', 1),
      (3, 'Raj Patel', 'UI/UX Designer', 'Inactive', 'raj.patel@example.com', 1),
      (4, 'Neha Gupta', 'Project Manager', 'Active', 'neha.gupta@example.com', 1),
      (5, 'Ravi Singh', 'Quality Assurance', 'On Leave', 'ravi.singh@example.com', 1),
      (16, 'Alice Johnson', 'Software Engineer', 'Active', 'alice.johnson@example.com', 1),
      (17, 'Bob Smith', 'Project Manager', 'On Leave', 'bob.smith@example.com', 1),
      (18, 'Charlie Brown', 'UX Designer', 'Active', 'charlie.brown@example.com', 0),
      (19, 'Diana Prince', 'Database Administrator', 'Inactive', 'diana.prince@example.com', 0),
      (20, 'Edward Elric', 'Systems Analyst', 'Active', 'edward.elric@example.com', 0),
      (21, 'Fiona Apple', 'Web Developer', 'Active', 'fiona.apple@example.com', 0),
      (22, 'George Martin', 'Network Engineer', 'Active', 'george.martin@example.com', 0),
      (23, 'Hannah Montana', 'Product Owner', 'On Leave', 'hannah.montana@example.com', 0),
      (24, 'Isaac Newton', 'Data Scientist', 'Active', 'isaac.newton@example.com', 0),
      (25, 'Jane Austen', 'Technical Writer', 'Inactive', 'jane.austen@example.com', 0);
    `,
    projectassignments: `
      INSERT INTO ProjectAssignments (ProjectID, EmployeeID, Allocation, Role, AllocationStartDate, AllocationEndDate, TimesheetApproval, BillingRate) VALUES
      (1, 1, 30.00, 'Active', NULL, NULL, NULL, NULL),
      (1, 2, 20.00, 'Systems Analyst', NULL, NULL, NULL, NULL),
      (2, 2, 10.00, 'Lead Systems Analyst', NULL, NULL, NULL, NULL),
      (5, 1, 10.00, 'Software Engineer', NULL, NULL, NULL, NULL),
      (5, 2, 10.00, 'Systems Analyst', NULL, NULL, NULL, NULL),
      (8, 4, 10.00, 'Project Manager', NULL, NULL, NULL, NULL),
      (9, 5, 10.00, 'Quality Assurance', NULL, NULL, NULL, NULL),
      (1, 5, 10.00, 'Developer', '2002-01-31', '2002-02-21', NULL, NULL),
      (1, 3, 10.00, 'Developer', '2002-01-31', '2002-02-21', NULL, NULL),
      (6, 1, 10.00, 'Allocated', '2024-09-03', '2024-09-19', 'Pending', 100.00),
      (7, 16, 10.00, 'Allocated', '2024-09-12', '2024-09-12', 'Pending', 100.00),
      (4, 16, 10.00, 'Allocated', '2024-09-12', '2024-09-19', 'Pending', 12.00);
    `,
  };

  db.query(queries[table], (err) => {
    if (err) {
      console.error(`Error inserting initial data into ${table}:`, err);
    } else {
      console.log(`Initial data inserted into ${table}`);
    }
  });
}

export default db;
