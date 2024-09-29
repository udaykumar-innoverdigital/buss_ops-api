// dbSetup.js
import mysql from 'mysql2/promise';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Akash@2506',
};

const ninjaDb = 'ninja3';
const timesheetDb = 'timesheet3';

async function createConnection() {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
}

async function createDatabases(connection) {
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${ninjaDb}`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${timesheetDb}`);
}

async function createTables(connection) {
  // Ninja DB Tables
  await connection.query(`USE ${ninjaDb}`);
  await connection.query(`
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
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS clients (
      ClientID INT AUTO_INCREMENT PRIMARY KEY,
      ClientName VARCHAR(255) NOT NULL UNIQUE,
      ClientCountry VARCHAR(100) NULL,
      ClientPartner VARCHAR(100) NULL,
      ClientLogo VARCHAR(100) NULL
    )
  `);

  await connection.query(`
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
  `);

  await connection.query(`
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
      FOREIGN KEY (ClientID) REFERENCES clients(ClientID) ON DELETE CASCADE,
      FOREIGN KEY (EmployeeID) REFERENCES employees(EmployeeID) ON DELETE CASCADE
    )
  `);

  // Timesheet DB Tables
  await connection.query(`USE ${timesheetDb}`);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS daily_hours (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      ResourceID varchar(255) DEFAULT NULL,
      ProjectID varchar(255) DEFAULT NULL,
      Date varchar(10) DEFAULT NULL,
      Hours int(11) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS manager (
      ManagerID char(36) PRIMARY KEY,
      Email varchar(255),
      Name varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS project (
      ProjectID char(36) PRIMARY KEY,
      Name varchar(255) NOT NULL,
      StartDate varchar(10) DEFAULT NULL,
      EndDate varchar(10) DEFAULT NULL,
      Status int(11) NOT NULL,
      TotalHours int(11) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS managerprojects (
      ManagerID char(36) NOT NULL,
      ProjectID char(36) NOT NULL,
      PRIMARY KEY (ManagerID, ProjectID),
      FOREIGN KEY (ManagerID) REFERENCES manager(ManagerID),
      FOREIGN KEY (ProjectID) REFERENCES project(ProjectID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS resource (
      ResourceID char(36) PRIMARY KEY,
      Email varchar(255),
      Name varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS resourceprojects (
      ResourceID char(36) NOT NULL,
      ProjectID char(36) NOT NULL,
      Status int(11) NOT NULL,
      TotalHours int(11) NOT NULL,
      PRIMARY KEY (ResourceID, ProjectID),
      FOREIGN KEY (ResourceID) REFERENCES resource(ResourceID),
      FOREIGN KEY (ProjectID) REFERENCES project(ProjectID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS worked_hours (
      ID INT AUTO_INCREMENT PRIMARY KEY,
      ResourceID varchar(255) DEFAULT NULL,
      ProjectID varchar(255) DEFAULT NULL,
      Date date DEFAULT NULL,
      Hours int(11) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
}

// Helper functions (getOrInsertRole, insertClientIfNotExists, etc.) remain the same

async function populateDatabase() {
  const fileName = 'Allocation.xlsx';
  const filePath = path.join(__dirname, fileName);
  console.log(`File path: ${filePath}`);

  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('Failed to read Excel file');
  }

  const connection = await createConnection();

  try {
    await createDatabases(connection);
    await createTables(connection);

    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of data) {
      console.log('Processing row:', JSON.stringify(row, null, 2));

      // Populate Ninja DB
      await connection.query(`USE ${ninjaDb}`);
      
      // Insert client
      // Insert client
      let [clientResult] = await connection.query('INSERT IGNORE INTO clients (ClientName) VALUES (?)', [row['Account']]);
      let clientId = clientResult.insertId;
          
      if (clientId === 0) {
        // If the client already exists, fetch its ID
        [clientResult] = await connection.query('SELECT ClientID FROM clients WHERE ClientName = ?', [row['Account']]);
      
        // Check if any result is returned
        if (clientResult.length > 0 && clientResult[0].ClientID) {
          clientId = clientResult[0].ClientID; // Client exists, assign the ID
        } else {
          console.error('Error: Client not found for Account:', row['Account']);
          continue; // Skip this row if the client is not found
        }
      }


      // Insert employee
      const [employeeResult] = await connection.query(`
        INSERT INTO employees 
        (EmployeeName, EmployeeRole, EmployeeStudio, EmployeeSubStudio, EmployeeLocation, 
        EmployeeJoiningDate, EmployeeEndingDate, EmployeeKekaStatus, EmployeeContractType) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          EmployeeRole = VALUES(EmployeeRole),
          EmployeeStudio = VALUES(EmployeeStudio),
          EmployeeSubStudio = VALUES(EmployeeSubStudio),
          EmployeeLocation = VALUES(EmployeeLocation),
          EmployeeJoiningDate = VALUES(EmployeeJoiningDate),
          EmployeeEndingDate = VALUES(EmployeeEndingDate),
          EmployeeKekaStatus = VALUES(EmployeeKekaStatus),
          EmployeeContractType = VALUES(EmployeeContractType)
      `, [
        row['Keka Resource Name'], row['Role/Title'], row['Studio Name'], row['Sub-Studio Name'],
        row['Location (US/India)'], excelDateToMySQLDate(row['Innover DOJ']), 
        null, row['Keka Status (Active/InActive)'],
        row['Emp Type (FTE/Contractor)']
      ]);

      let employeeId;

      // If the record was inserted, use the returned insertId
      if (employeeResult.insertId) {
        employeeId = employeeResult.insertId;
      } else {
        // If the record was updated, retrieve the employeeId by querying the employees table
        const [existingEmployee] = await connection.query('SELECT EmployeeID FROM employees WHERE EmployeeName = ?', [row['Keka Resource Name']]);

        if (existingEmployee.length > 0) {
          employeeId = existingEmployee[0].EmployeeID;
        } else {
          throw new Error(`Employee ID not found for employee: ${row['Keka Resource Name']}`);
        }
      }

      // Insert project
      // Check if ProjectName is null
      if (!row['Project/SOW Name']) {
        console.log('Skipping row due to missing ProjectName:', JSON.stringify(row));
        continue; // Skip this row and move to the next iteration
      }

      const [projectResult] = await connection.query(`
        INSERT INTO projects 
        (ProjectName, ClientID, ProjectStatus, ProjectCategory, ProjectManager, ProjectStartDate, ProjectEndDate) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        row['Project/SOW Name'], 
        clientId, 
        'Active',
        null,
        row['Project Manager'], 
        null,
        null
      ]);

      const projectId = projectResult.insertId; // Retrieve the newly inserted project ID

      // Insert allocation (now projectId is defined)
      await connection.query(`
        INSERT INTO allocations 
        (ClientID, ProjectID, EmployeeID, AllocationPercentage, AllocationBillingType, 
        AllocationBillingRate, AllocationTimeSheetApprover, AllocationStartDate, AllocationEndDate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientId, 
        projectId,  // Use the retrieved projectId
        employeeId, 
        isNaN(parseFloat(row['% Allocation'])) ? null : parseFloat(row['% Allocation']), // Handle NaN for percentage
        row['Billing Type (T&M / Fix Price)'], 
        isNaN(parseFloat(row['BR (USD/Hr)'])) ? null : parseFloat(row['BR (USD/Hr)']),  // Handle NaN for billing rate
        row['TS Approver'], 
        excelDateToMySQLDate(row['Billing Start Date']) || null,  // Handle date
        excelDateToMySQLDate(row['Billing End Date']) || null     // Handle date
      ]);



      // Populate Timesheet DB
      await connection.query(`USE ${timesheetDb}`);

      // Insert manager
      const managerId = uuidv4();
      await connection.query('INSERT INTO manager (ManagerID, Name, Email) VALUES (?, ?, ?)', 
        [managerId, row['Project Manager'], null]);

      // Insert resource
      const resourceId = uuidv4();
      await connection.query('INSERT INTO resource (ResourceID, Name, Email) VALUES (?, ?, ?)', 
        [resourceId, row['Keka Resource Name'], null]);

      // Insert project
      const timesheetProjectId = uuidv4();
      await connection.query(`
        INSERT INTO project (ProjectID, Name, StartDate, EndDate, Status, TotalHours) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        timesheetProjectId, row['Project/SOW Name'], 
        null, null,
        1, Math.floor(Math.random() * 1000) + 100
      ]);

      // Insert manager projects
      await connection.query('INSERT INTO managerprojects (ManagerID, ProjectID) VALUES (?, ?)', 
        [managerId, timesheetProjectId]);

      // Insert resource projects
      await connection.query(`
        INSERT INTO resourceprojects (ResourceID, ProjectID, Status, TotalHours) 
        VALUES (?, ?, ?, ?)
      `, [resourceId, timesheetProjectId, 1, Math.floor(Math.random() * 500) + 50]);

      // Insert sample daily hours and worked hours
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const hours = Math.floor(Math.random() * 8) + 1;
        const dateString = date.toISOString().split('T')[0];

        await connection.query(`
          INSERT INTO daily_hours (ResourceID, ProjectID, Date, Hours) 
          VALUES (?, ?, ?, ?)
        `, [resourceId, timesheetProjectId, dateString, hours]);

        await connection.query(`
          INSERT INTO worked_hours (ResourceID, ProjectID, Date, Hours) 
          VALUES (?, ?, ?, ?)
        `, [resourceId, timesheetProjectId, dateString, hours]);
      }
    }

    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error in populateDatabase:', error);
  } finally {
    await connection.end();
  }
}

function excelDateToMySQLDate(excelDate) {
  if (!excelDate || typeof excelDate !== 'number') return null;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

// Run the database setup and population
createConnection()
  .then(async (connection) => {
    try {
      await createDatabases(connection);
      await createTables(connection);
      await populateDatabase();
    } catch (error) {
      console.error('Error setting up or populating database:', error);
    } finally {
      await connection.end();
    }
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });