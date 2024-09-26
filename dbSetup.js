import mysql from 'mysql';

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Akash@2506', // Use your actual credentials
  database: 'ninja',
});

// Connect to the database
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
  const requiredTables = ['employees', 'clients', 'projects', 'allocations'];
  // Use correct query to check for existing tables
  const checkTablesQuery = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'ninja'
      AND table_name IN (?)
  `;

  db.query(checkTablesQuery, [requiredTables], (err, results) => {
    if (err) {
      console.error('Error checking tables:', err);
      return;
    }
    const existingTables = results.map(row => row.TABLE_NAME.toLowerCase());
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      createTables(missingTables);
    } else {
      console.log('All tables exist.');
      db.end(); // Close connection when done
    }
  });
}
// Function to create tables
function createTables(tables) {
  const tableDefinitions = {
    employees: `
      CREATE TABLE IF NOT EXISTS employees (
        EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
        EmployeeName VARCHAR(255),
        EmployeeRole VARCHAR(255),
        EmployeeEmail VARCHAR(255) NULL,
        EmployeeStudio VARCHAR(255),
        EmployeeSubStudio VARCHAR(255),
        EmployeeLocation VARCHAR(255),
        EmployeeJoiningDate DATE,
        EmployeeEndingDate DATE,
        EmployeeSkills TEXT,
        EmployeeKekaStatus VARCHAR(255),
        EmployeeContractType VARCHAR(255),
        EmployeeTYOE INT NULL,
        EmployeePhotoDetails VARCHAR(255) NULL
      )
    `,
    clients: `
      CREATE TABLE IF NOT EXISTS clients (
        ClientID INT AUTO_INCREMENT PRIMARY KEY,
        ClientName VARCHAR(255) NOT NULL UNIQUE,
        ClientCountry VARCHAR(100) NULL,
        ClientPartner VARCHAR(100) NULL,
        ClientLogo VARCHAR(100) NULL
      )
    `,
    projects: `
      CREATE TABLE IF NOT EXISTS projects (
        ProjectID INT AUTO_INCREMENT PRIMARY KEY,
        ProjectName VARCHAR(255) NOT NULL,
        ClientID INT,
        ProjectStatus VARCHAR(50),
        ProjectCategory VARCHAR(100),
        ProjectManager VARCHAR(100),
        ProjectStartDate DATE,
        ProjectEndDate DATE,
        FOREIGN KEY (ClientID) REFERENCES clients(ClientID) ON DELETE CASCADE
      )
    `,
    allocations: `
      CREATE TABLE IF NOT EXISTS allocations (
        AllocationID INT AUTO_INCREMENT PRIMARY KEY,
        ClientID INT NOT NULL,
        ProjectID INT NOT NULL,
        EmployeeID INT NOT NULL,
        AllocationStatus VARCHAR(100) NULL,
        AllocationPercentage DECIMAL(5,2),
        AllocationBillingType VARCHAR(100),
        AllocationBilledCheck VARCHAR(100) NULL,
        AllocationBillingRate DECIMAL(10, 2),
        AllocationTimeSheetApprover VARCHAR(100),
        AllocationStartDate DATE,
        AllocationEndDate DATE,
        ModifiedBy VARCHAR(100) NULL,
        ModifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ProjectID) REFERENCES projects(ProjectID) ON DELETE CASCADE,
        FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE,
        FOREIGN KEY (EmployeeID) REFERENCES employees(EmployeeID) ON DELETE CASCADE
       )
    `,
  };

  tables.forEach(table => {
    db.query(tableDefinitions[table], (err) => {
      if (err) {
        console.error(`Error creating table ${table}:`, err);
      } else {
        console.log(`Table ${table} created successfully.`);
      }
    });
  });
}

export default db;