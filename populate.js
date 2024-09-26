import express from 'express';
import cors from 'cors';
import db from './dbSetup.js';
import mysql from 'mysql';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Akash@2506',
  database: 'ninja',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function insertRoles(connection) {
  const roles = [
    "Associate Developer",
    "Director",
    "Senior Technical Manager",
    "Timesheet Manager",
    "SVP",
    "Manager",
    "Director - Delivery",
    "Senior Director",
    "Executive Vice President – Business Execution & Transformation",
    "Associate Director - Account Management",
    "Sr. Vice President - Tax & Tech",
    "Full Stack Engineer",
    "Solution Analyst",
  ];

  for (const role of roles) {
    await new Promise((resolve, reject) => {
      const query = 'INSERT IGNORE INTO roles (RoleName) VALUES (?)';
      connection.query(query, [role], (error) => {
        if (error) {
          console.error('Error inserting role:', error);
          return reject(error);
        }
        console.log(`Role "${role}" inserted successfully`);
        resolve();
      });
    });
  }
}

// New function to get or insert a role
async function getOrInsertRole(roleName, connection) {
  const role = await new Promise((resolve, reject) => {
    const query = 'SELECT RoleId FROM roles WHERE RoleName = ?';
    connection.query(query, [roleName], (error, results) => {
      if (error) return reject(error);
      resolve(results[0]);
    });
  });

  if (role) {
    return role.RoleId;
  }

  const result = await new Promise((resolve, reject) => {
    const query = 'INSERT INTO roles (RoleName) VALUES (?)';
    connection.query(query, [roleName], (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });

  return result.insertId;
}

// New function to insert emp_role
async function insertEmpRole(employeeId, roleId, connection) {
  await new Promise((resolve, reject) => {
    const query = 'INSERT INTO emp_role (EmployeeID, RoleId) VALUES (?, ?)';
    connection.query(query, [employeeId, roleId], (error) => {
      if (error) {
        console.error('Error inserting emp_role:', error);
        return reject(error);
      }
      console.log(`emp_role inserted for EmployeeID: ${employeeId}, RoleId: ${roleId}`);
      resolve();
    });
  });
}

// Function to insert a client if it doesn't exist
async function insertClientIfNotExists(clientName, connection) {
  // ... existing logic
  if (!clientName) return null; // Skip if clientName is invalid

  const client = await new Promise((resolve, reject) => {
    const query = 'SELECT ClientID FROM clients WHERE ClientName = ?';
    connection.query(query, [clientName], (error, results) => {
      if (error) return reject(error);
      resolve(results[0]);
    });
  });

  if (client) {
    return client.ClientID; // Client exists, return the ClientID
  }

  const newClient = {
    ClientName: clientName,
  };

  const clientId = await new Promise((resolve, reject) => {
    connection.query('INSERT INTO clients SET ?', newClient, (error, result) => {
      if (error) {
        console.error('Error inserting client:', error); // Log error details
        return reject(error);
      }
      resolve(result.insertId); // Return the newly inserted ClientID
    });
  });

  return clientId; // Return the new ClientID
}

// Function to insert a project if it doesn't exist
async function insertProjectIfNotExists(
  projectName,
  clientId,
  projectStatus,
  projectCategory,
  projectManager,
  projectStartDate,
  projectEndDate,
  connection
) {
  // ... existing logic
  if (!projectName || !clientId) return null; // Skip if projectName or clientId is invalid

  const project = await new Promise((resolve, reject) => {
    const query = 'SELECT ProjectID FROM projects WHERE ProjectName = ?';
    connection.query(query, [projectName], (error, results) => {
      if (error) return reject(error);
      resolve(results[0]);
    });
  });

  if (project) {
    return project.ProjectID;
  }

  const newProject = {
    ProjectName: projectName,
    ClientID: clientId,
    ProjectStatus: projectStatus,
    ProjectCategory: projectCategory,
    ProjectManager: projectManager,
    ProjectStartDate: projectStartDate,
    ProjectEndDate: projectEndDate,
  };

  const projectId = await new Promise((resolve, reject) => {
    connection.query('INSERT INTO projects SET ?', newProject, (error, result) => {
      if (error) {
        console.error('Error inserting project:', error); // Log error details
        return reject(error);
      }
      resolve(result.insertId);
    });
  });

  return projectId;
}


// Function to convert Excel date to MySQL date format
function excelDateToMySQLDate(excelDate) {
  // ... existing logic
  if (!excelDate || typeof excelDate !== 'number') return null; // Ensure the date is a valid number

  const date = new Date((excelDate - 25569) * 86400 * 1000);

  if (isNaN(date.getTime())) {
    console.error('Invalid date value:', excelDate);
    return null;
  }

  return date.toISOString().split('T')[0];
}

// Function to populate the database
export async function populateDatabase() {
  const fileName = 'Allocation.xlsx'; // Your Excel file name
  const filePath = path.join(__dirname, fileName); // Path to the current directory
  console.log(`File path: ${filePath}`);

  let workbook;
  try {
    workbook = XLSX.readFile(filePath); // Read the file from the current directory
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('Failed to read Excel file');
  }

  const connection = await new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      resolve(conn);
    });
  });

  try {

    await insertRoles(connection);

    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of data) {
      console.log('Processing row:', JSON.stringify(row, null, 2));

      const clientName = row['Account'] || null;
      const clientId = await insertClientIfNotExists(clientName, connection);

      if (!clientId) {
        console.log(`Client not inserted for row: ${JSON.stringify(row)}`);
        continue;
      }

      const employee = {
        EmployeeName: row['Keka Resource Name'] || null,
        EmployeeRole: row['Role/Title'] || null,
        EmployeeStudio: row['Studio Name'] || null,
        EmployeeSubStudio: row['Sub-Studio Name'] || null,
        EmployeeLocation: row['Location (US/India)'] || null,
        EmployeeJoiningDate: excelDateToMySQLDate(row['Innover DOJ']) || null,
        EmployeeEndingDate: excelDateToMySQLDate(row['LWD in Org']) || null,
        EmployeeKekaStatus: row['Keka Status (Active/InActive)'] || null,
        EmployeeContractType: row['Emp Type (FTE/Contractor)'] || null,
      };

      console.log('Inserting Employee:', employee);
      const employeeId = await new Promise((resolve, reject) => {
        connection.query('INSERT INTO employees SET ?', employee, (error, employeeResult) => {
          if (error) {
            console.error('Error inserting employee:', error);
            return reject(error);
          }
          resolve(employeeResult.insertId);
        });
      });

      if (employee.EmployeeRole) {
        const roleId = await getOrInsertRole(employee.EmployeeRole, connection);
        await insertEmpRole(employeeId, roleId, connection);
      }

      const projectName = row['Project/SOW Name'] || null;

      console.log('Checking and inserting Project:', projectName);
      
      const projectStatus = row['Project Status'] || null;
      const projectCategory = row['Project Category'] || null;
      const projectManager = row['Project Manager'] || null;
      const projectStartDate = excelDateToMySQLDate(row['Project Start Date']) || null;
      const projectEndDate = excelDateToMySQLDate(row['Project End Date']) || null;

      const projectId = await insertProjectIfNotExists(
        projectName,
        clientId,
        projectStatus,
        projectCategory,
        projectManager,
        projectStartDate,
        projectEndDate,
        connection
      );

      // Skip the row if the projectId is null
      if (projectId === null) {
        console.log('Skipping row due to missing project name or invalid clientId');
        continue;
      }

      const allocation = {
        ProjectID: projectId,
        EmployeeID: employeeId,
        ClientID: clientId,
        AllocationPercentage: row['% Allocation'] ? parseFloat(row['% Allocation']) : null,
        AllocationBillingType: row['Billing Type (T&M / Fix Price)'] || null,
        AllocationBillingRate: row['BR (USD/Hr)'] ? parseFloat(row['BR (USD/Hr)']) : null,
        AllocationTimeSheetApprover: row['TS Approver'] || null,
        AllocationStartDate: excelDateToMySQLDate(row['Billing Start Date']),
        AllocationEndDate: excelDateToMySQLDate(row['Billing End Date']),
      };

      console.log('Inserting Project Allocation:', allocation);
      await new Promise((resolve, reject) => {
        connection.query('INSERT INTO allocations SET ?', allocation, (error) => {
          if (error) {
            console.error('Error inserting project allocations:', error);
            return reject(error);
          }
          resolve();
        });
      });

    }
    console.log('Database populated successfully');
    }  
   finally {
    connection.release(); // Release the connection back to the pool
  }
}