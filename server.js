import express from 'express';
import cors from 'cors';
import mysql from 'mysql'; // Import MySQL
import db from './dbSetup.js';
const app = express();
const port = 8080;

// MySQL database connection


// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies


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

  console.log('Received data:', req.body); // Log the received data

  // Update valid TimesheetApproval values to the new allowed values
  const validTimesheetApprovalValues = ['Rajendra', 'Kiran', 'Sishir']; // Updated values

  // Validate required fields
  if (!EmployeeID || !ClientName || !ProjectName || Allocation === undefined || !AllocationStartDate || !AllocationEndDate || TimesheetApproval === undefined || BillingRate === undefined) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  // Validate TimesheetApproval value
  if (!validTimesheetApprovalValues.includes(TimesheetApproval)) {
    return res.status(400).json({ message: 'Invalid TimesheetApproval value' });
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ message: 'Transaction error', error: err });
    }

    // Retrieve ClientID
    db.query(
      'SELECT ClientID FROM clients WHERE ClientName = ?',
      [ClientName],
      (err, clientRows) => {
        if (err) {
          console.error('Error retrieving ClientID:', err);
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
              console.error('Error retrieving ProjectID:', err);
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
                  console.error('Error checking existing assignment:', err);
                  return db.rollback(() => res.status(500).json({ message: 'Query error', error: err }));
                }

                if (assignmentRows.length > 0) {
                  // Update existing assignment
                  db.query(
                    'UPDATE projectassignments SET Allocation = ?, Role = ?, AllocationStartDate = ?, AllocationEndDate = ?, TimesheetApproval = ?, BillingRate = ? WHERE ProjectID = ? AND EmployeeID = ?',
                    [Allocation, Role, AllocationStartDate, AllocationEndDate, TimesheetApproval, BillingRate, projectID, EmployeeID],
                    (err) => {
                      if (err) {
                        console.error('Error updating assignment:', err);
                        return db.rollback(() => res.status(500).json({ message: 'Update error', error: err }));
                      }

                      // Commit transaction
                      db.commit((err) => {
                        if (err) {
                          console.error('Error committing transaction:', err);
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
                        console.error('Error inserting new assignment:', err); // Log the error
                        console.log('Failed data:', { projectID, EmployeeID, Allocation, Role, AllocationStartDate, AllocationEndDate, TimesheetApproval, BillingRate }); // Log the failed data
                        return db.rollback(() => res.status(500).json({ message: 'Insert error', error: err }));
                      }

                      // Update employee status
                      db.query(
                        'UPDATE employees SET HasProjectAssigned = 1 WHERE EmployeeID = ?',
                        [EmployeeID],
                        (err) => {
                          if (err) {
                            console.error('Error updating employee status:', err);
                            return db.rollback(() => res.status(500).json({ message: 'Update error', error: err }));
                          }

                          // Commit transaction
                          db.commit((err) => {
                            if (err) {
                              console.error('Error committing transaction:', err);
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

// Done
app.get('/employees', (req, res) => {
  const query = `
    SELECT
      e.EmployeeId AS EmployeeID,
      e.EmployeeName,
      e.EmployeeRole,
      e.EmployeeContractType,
      GROUP_CONCAT(DISTINCT p.ProjectName SEPARATOR ', ') AS Projects,
      COALESCE(SUM(a.AllocationPercent), 0) AS Current_Allocation
    FROM
      Employees e
    LEFT JOIN
      Allocations a ON e.EmployeeId = a.EmployeeID
        AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
        AND CURRENT_DATE() BETWEEN a.AllocationStartDate AND a.AllocationEndDate
    LEFT JOIN
      Projects p ON a.ProjectID = p.ProjectID
    WHERE
      e.EmployeeKekaStatus = 'Active'
    GROUP BY
      e.EmployeeId, e.EmployeeName, e.EmployeeRole, e.EmployeeContractType
    ORDER BY
      e.EmployeeName ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Transform the results to handle cases where Projects might be NULL
    const formattedResults = results.map(employee => ({
      EmployeeID: employee.EmployeeID,
      EmployeeName: employee.EmployeeName,
      EmployeeRole: employee.EmployeeRole,
      EmployeeContractType: employee.EmployeeContractType,
      Projects: employee.Projects ? employee.Projects.split(', ').filter(p => p) : [],
      Current_Allocation: employee.Current_Allocation
    }));

    res.json(formattedResults);
  });
});
// Done
app.get('/employees/unallocated', (req, res) => {
  const query = `
    SELECT
      e.EmployeeId AS EmployeeID,
      e.EmployeeName,
      e.EmployeeRole,
      e.EmployeeContractType,
      GROUP_CONCAT(DISTINCT p.ProjectName SEPARATOR ', ') AS Projects,
      COALESCE(SUM(a.AllocationPercent), 0) AS Current_Allocation
    FROM
      Employees e
    LEFT JOIN
      Allocations a ON e.EmployeeId = a.EmployeeID
        AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
        AND CURRENT_DATE() BETWEEN a.AllocationStartDate AND a.AllocationEndDate
    LEFT JOIN
      Projects p ON a.ProjectID = p.ProjectID
    WHERE
      e.EmployeeKekaStatus = 'Active'
    GROUP BY
      e.EmployeeId, e.EmployeeName, e.EmployeeRole, e.EmployeeContractType
    HAVING
      Projects IS NULL AND Current_Allocation = 0
    ORDER BY
      e.EmployeeName ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing unallocated query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Since Projects is NULL and Current_Allocation is 0, Projects array should be empty
    const formattedResults = results.map(employee => ({
      EmployeeID: employee.EmployeeID,
      EmployeeName: employee.EmployeeName,
      EmployeeRole: employee.EmployeeRole,
      EmployeeContractType: employee.EmployeeContractType,
      Projects: [], // Explicitly setting to empty array as Projects is NULL
      Current_Allocation: 0
    }));

    res.json(formattedResults);
  });
});
// Done
app.get('/employees/draft', (req, res) => {
  const query = `
    SELECT
      e.EmployeeId AS EmployeeID,
      e.EmployeeName,
      e.EmployeeRole,
      e.EmployeeContractType,
      GROUP_CONCAT(DISTINCT p.ProjectName SEPARATOR ', ') AS Projects,
      COALESCE(SUM(a.AllocationPercent), 0) AS Current_Allocation
    FROM
      Employees e
    LEFT JOIN
      Allocations a ON e.EmployeeId = a.EmployeeID
        AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
        AND CURRENT_DATE() BETWEEN a.AllocationStartDate AND a.AllocationEndDate
    LEFT JOIN
      Projects p ON a.ProjectID = p.ProjectID
    WHERE
      e.EmployeeKekaStatus = 'Active'
    GROUP BY
      e.EmployeeId, e.EmployeeName, e.EmployeeRole, e.EmployeeContractType
    HAVING
      Current_Allocation > 0 AND Current_Allocation < 100
    ORDER BY
      e.EmployeeName ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing draft query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Transform the results
    const formattedResults = results.map(employee => ({
      EmployeeID: employee.EmployeeID,
      EmployeeName: employee.EmployeeName,
      EmployeeRole: employee.EmployeeRole,
      EmployeeContractType: employee.EmployeeContractType,
      Projects: employee.Projects ? employee.Projects.split(', ').filter(p => p) : [],
      Current_Allocation: employee.Current_Allocation
    }));

    res.json(formattedResults);
  });
});
// Done
app.get('/employees/allocated', (req, res) => {
  const query = `
    SELECT
      e.EmployeeId AS EmployeeID,
      e.EmployeeName,
      e.EmployeeRole,
      e.EmployeeContractType,
      GROUP_CONCAT(DISTINCT p.ProjectName SEPARATOR ', ') AS Projects,
      COALESCE(SUM(a.AllocationPercent), 0) AS Current_Allocation
    FROM
      Employees e
    LEFT JOIN
      Allocations a ON e.EmployeeId = a.EmployeeID
        AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
        AND CURRENT_DATE() BETWEEN a.AllocationStartDate AND a.AllocationEndDate
    LEFT JOIN
      Projects p ON a.ProjectID = p.ProjectID
    WHERE
      e.EmployeeKekaStatus = 'Active'
      AND a.ClientID != 1  -- Exclude allocations with ClientID = 1
    GROUP BY
      e.EmployeeId, e.EmployeeName, e.EmployeeRole, e.EmployeeContractType
    HAVING
      Current_Allocation = 100
    ORDER BY
      e.EmployeeName ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing fully allocated query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Since Current_Allocation is 100, Projects should contain all allocated projects
    const formattedResults = results.map(employee => ({
      EmployeeID: employee.EmployeeID,
      EmployeeName: employee.EmployeeName,
      EmployeeRole: employee.EmployeeRole,
      EmployeeContractType: employee.EmployeeContractType,
      Projects: employee.Projects ? employee.Projects.split(', ').filter(p => p) : [],
      Current_Allocation: employee.Current_Allocation
    }));

    res.json(formattedResults);
  });
});
// Done
app.get('/employees/bench', (req, res) => {
  const query = `
    SELECT
      e.EmployeeId AS EmployeeID,
      e.EmployeeName,
      e.EmployeeRole,
      e.EmployeeContractType,
      GROUP_CONCAT(DISTINCT p.ProjectName SEPARATOR ', ') AS Projects,
      COALESCE(SUM(a.AllocationPercent), 0) AS Current_Allocation
    FROM
      Employees e
    LEFT JOIN
      Allocations a ON e.EmployeeId = a.EmployeeID
        AND a.ClientID = 1
        AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
        AND CURRENT_DATE() BETWEEN a.AllocationStartDate AND a.AllocationEndDate
    LEFT JOIN
      Projects p ON a.ProjectID = p.ProjectID
    WHERE
      e.EmployeeKekaStatus = 'Active'
    GROUP BY
      e.EmployeeId, e.EmployeeName, e.EmployeeRole, e.EmployeeContractType
    HAVING
      Current_Allocation > 0
    ORDER BY
      e.EmployeeName ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing bench query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Format the results
    const formattedResults = results.map(employee => ({
      EmployeeID: employee.EmployeeID,
      EmployeeName: employee.EmployeeName,
      EmployeeRole: employee.EmployeeRole,
      EmployeeContractType: employee.EmployeeContractType,
      Projects: employee.Projects ? employee.Projects.split(', ').filter(p => p) : [],
      Current_Allocation: employee.Current_Allocation
    }));

    res.json(formattedResults);
  });
});
// Done
app.get('/clients', (req, res) => {
  const query = `
    SELECT 
      c.ClientID, 
      c.ClientName, 
      c.ClientCountry, 
      c.ClientLogo,
      c.ClientPartner,
      COUNT(DISTINCT p.ProjectID) AS NoOfProjects,
      COUNT(DISTINCT a.EmployeeID) AS Headcount
    FROM 
      Clients c
    LEFT JOIN 
      Allocations a ON c.ClientID = a.ClientID
        AND a.AllocationStartDate <= CURRENT_DATE()
        AND (a.AllocationEndDate >= CURRENT_DATE() OR a.AllocationEndDate IS NULL)
    LEFT JOIN 
      Projects p ON c.ClientID = p.ClientID
    LEFT JOIN 
      Employees e ON a.EmployeeID = e.EmployeeId
    GROUP BY 
      c.ClientID, c.ClientName, c.ClientCountry, c.ClientPartner, c.ClientLogo
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Done
app.get('/client/:clientId/projects', (req, res) => {
  const clientId = req.params.clientId;
  const currentDate = new Date().toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format

  const query = `
    SELECT 
      p.ProjectID, 
      p.ProjectName, 
      p.ProjectStatus, 
      p.ProjectCategory, 
      p.ProjectManager, 
      p.ProjectStartDate, 
      p.ProjectEndDate,
      c.ClientName,
      COUNT(DISTINCT a.EmployeeID) AS Headcount
    FROM 
      Projects p
    JOIN 
      Clients c ON p.ClientID = c.ClientID
    LEFT JOIN 
      Allocations a ON p.ProjectID = a.ProjectID
        AND a.AllocationStartDate <= ?
        AND (a.AllocationEndDate >= ? OR a.AllocationEndDate IS NULL)
    WHERE 
      p.ClientID = ?
    GROUP BY 
      p.ProjectID, p.ProjectName, p.ProjectStatus, p.ProjectCategory, p.ProjectManager, p.ProjectStartDate, p.ProjectEndDate, c.ClientName
  `;

  db.query(query, [currentDate, currentDate, clientId], (err, projects) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found for this client' });
    }

    res.json(projects);
  });
});

// Done
app.get('/employee-details/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;

  if (!employeeId) {
    return res.status(400).send('Employee ID is required');
  }

  const query = `
    SELECT 
      EmployeeId,
      EmployeeName,
      EmployeeRole,
      EmployeeEmail,
      EmployeeStudio,
      EmployeeSubStudio,
      EmployeeLocation,
      EmployeeJoiningDate,
      EmployeeEndingDate,
      EmployeeSkills,
      EmployeeKekaStatus,
      EmployeeTYOE,
      EmployeePhotoDetails,
      EmployeeContractType
    FROM Employees
    WHERE EmployeeId = ?
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    if (results.length === 0) {
      return res.status(404).send('Employee not found');
    }
    
    res.json(results[0]); // Send the first (and should be only) result
  });
});

// Done
app.get('/employee-details/:employeeId/allocations', (req, res) => {
  const employeeId = req.params.employeeId;
  const filter = req.query.filter ? req.query.filter.toLowerCase() : 'all'; // Default to 'all' if not provided

  // Validate that Employee ID is provided
  if (!employeeId) {
    return res.status(400).send('Employee ID is required');
  }

  // Base query to retrieve allocations for the specified EmployeeID with ClientName and ProjectName
  let allocationsQuery = `
    SELECT 
      a.AllocationID, 
      a.ClientID, 
      c.ClientName,
      a.ProjectID, 
      p.ProjectName,
      a.AllocationStatus, 
      a.AllocationPercent, 
      a.AllocationBillingType, 
      a.AllocationBilledCheck, 
      a.AllocationBillingRate, 
      a.AllocationTimeSheetApprover, 
      a.AllocationStartDate, 
      a.AllocationEndDate, 
      a.ModifiedBy, 
      a.ModifiedAt
    FROM Allocations a
    LEFT JOIN Clients c ON a.ClientID = c.ClientID
    LEFT JOIN Projects p ON a.ProjectID = p.ProjectID
    WHERE a.EmployeeID = ?
  `;

  // Modify the query based on the filter
  if (filter === 'active') {
    allocationsQuery += `
      AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
      AND CURRENT_DATE() >= a.AllocationStartDate
      AND (a.AllocationEndDate IS NULL OR CURRENT_DATE() <= a.AllocationEndDate)
    `;
  } else if (filter === 'closed') {
    allocationsQuery += `
      AND (a.AllocationStatus = 'Closed' OR CURRENT_DATE() > a.AllocationEndDate)
    `;
  } // 'all' requires no additional filtering

  // Execute the allocations query
  db.query(allocationsQuery, [employeeId], (err, allocationsResults) => {
    if (err) {
      console.error('Error executing allocations query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Query to compute the current allocation percentage (always based on active allocations)
    const currentAllocationQuery = `
      SELECT 
        COALESCE(SUM(a.AllocationPercent), 0) AS Current_Allocation
      FROM Allocations a
      WHERE a.EmployeeID = ?
        AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
        AND CURRENT_DATE() >= a.AllocationStartDate
        AND (a.AllocationEndDate IS NULL OR CURRENT_DATE() <= a.AllocationEndDate)
    `;

    // Execute the current allocation query
    db.query(currentAllocationQuery, [employeeId], (err, currentAllocationResults) => {
      if (err) {
        console.error('Error executing current allocation query:', err);
        return res.status(500).send('Internal Server Error');
      }

      // Extract the current allocation percentage
      const currentAllocation = currentAllocationResults[0].Current_Allocation;

      // Respond with both allocations and current allocation percentage
      res.json({
        allocations: allocationsResults,
        currentAllocation: currentAllocation
      });
    });
  });
});
//Done
app.get('/project-details/:clientId/:projectId', (req, res) => {
  const { clientId, projectId } = req.params;
  const filter = req.query.filter ? req.query.filter.toLowerCase() : 'all';

  if (!clientId || !projectId) {
    return res.status(400).send('Client ID and Project ID are required');
  }

  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Base query with JOINs to get ClientName and ProjectName
  let query = `
    SELECT 
      c.ClientName,
      p.ProjectName,
      e.EmployeeID,
      e.EmployeeName,
      e.EmployeeRole,
      e.EmployeeContractType,
      a.AllocationStatus,
      a.AllocationPercent,
      a.AllocationBillingType,
      a.AllocationBilledCheck,
      a.AllocationBillingRate,
      a.AllocationTimeSheetApprover,
      a.AllocationStartDate,
      a.AllocationEndDate,
      a.ModifiedBy,
      a.ModifiedAt
    FROM Allocations a
    INNER JOIN Employees e ON a.EmployeeID = e.EmployeeID
    INNER JOIN Clients c ON a.ClientID = c.ClientID
    INNER JOIN Projects p ON a.ProjectID = p.ProjectID
    WHERE a.ClientID = ? AND a.ProjectID = ?
  `;

  const queryParams = [clientId, projectId];

  // Modify the query based on the filter
  if (filter === 'active') {
    query += `
      AND (
        a.AllocationStatus IN (?, ?, ?)
        AND a.AllocationStartDate <= ?
        AND (a.AllocationEndDate >= ? OR a.AllocationEndDate IS NULL)
      )
    `;
    queryParams.push('Client Unallocated', 'Project Unallocated', 'Allocated', currentDate, currentDate);
  } else if (filter === 'closed') {
    query += `
      AND (
        a.AllocationStatus = ?
        OR a.AllocationEndDate < ?
      )
    `;
    queryParams.push('Closed', currentDate);
  }
  // 'all' requires no additional filtering

  // Optional: Log the query and parameters for debugging
  console.log('Executing Query:', query);
  console.log('With Parameters:', queryParams);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching project details:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      // Instead of 404, return 200 with empty allocations
      // Optionally, fetch ClientName and ProjectName separately if needed
      // For simplicity, returning empty allocations with placeholder names

      // To fetch ClientName and ProjectName even if allocations are empty
      const nameQuery = `
        SELECT c.ClientName, p.ProjectName
        FROM Clients c
        INNER JOIN Projects p ON c.ClientID = p.ClientID
        WHERE c.ClientID = ? AND p.ProjectID = ?
        LIMIT 1
      `;
      db.query(nameQuery, [clientId, projectId], (nameErr, nameResults) => {
        if (nameErr) {
          console.error('Error fetching client/project names:', nameErr);
          return res.status(500).send('Internal Server Error');
        }

        if (nameResults.length === 0) {
          return res.status(404).send('Project not found');
        }

        const clientName = nameResults[0].ClientName;
        const projectName = nameResults[0].ProjectName;

        res.json({
          clientName,
          projectName,
          allocations: [] // Empty allocations
        });
      });

      return;
    }

    const clientName = results[0].ClientName;
    const projectName = results[0].ProjectName;
    const allocations = results.map(row => ({
      EmployeeID: row.EmployeeID,
      EmployeeName: row.EmployeeName,
      EmployeeRole: row.EmployeeRole,
      EmployeeContractType: row.EmployeeContractType,
      AllocationStatus: row.AllocationStatus,
      AllocationPercent: row.AllocationPercent,
      AllocationBillingType: row.AllocationBillingType,
      AllocationBilledCheck: row.AllocationBilledCheck,
      AllocationBillingRate: row.AllocationBillingRate,
      AllocationTimeSheetApprover: row.AllocationTimeSheetApprover,
      AllocationStartDate: row.AllocationStartDate,
      AllocationEndDate: row.AllocationEndDate,
      ModifiedBy: row.ModifiedBy,
      ModifiedAt: row.ModifiedAt
    }));

    res.json({
      clientName,
      projectName,
      allocations
    });
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








app.post('/project/allocate-resource', (req, res) => {
  console.log(req.body);
  const { employeeName, projectName, Allocation } = req.body;

  if (!employeeName || !projectName || !Allocation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const formattedProjectName = projectName.replace(/-/g, ' ');

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Transaction error', error: err });
    }

    // Check if the EmployeeID exists
    db.query('SELECT EmployeeID FROM employees WHERE EmployeeName = ?', [employeeName], (err, employeeResults) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
      }

      if (employeeResults.length === 0) {
        return db.rollback(() => res.status(404).json({ error: 'Employee not found' }));
      }
      const employeeID = employeeResults[0].EmployeeID;

      // Check if the ProjectID exists
      db.query('SELECT ProjectID FROM projects WHERE ProjectName = ?', [formattedProjectName], (err, projectResults) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
        }

        if (projectResults.length === 0) {
          return db.rollback(() => res.status(404).json({ error: 'Project not found' }));
        }
        const projectID = projectResults[0].ProjectID;

        // Check if the assignment already exists
        db.query('SELECT * FROM projectassignments WHERE ProjectID = ? AND EmployeeID = ?', [projectID, employeeID], (err, assignmentResults) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
          }

          if (assignmentResults.length > 0) {
            // Update existing assignment (if needed)
            db.query(
              'UPDATE projectassignments SET Allocation = ? WHERE ProjectID = ? AND EmployeeID = ?',
              [Allocation, projectID, employeeID],
              (err) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => res.status(500).json({ error: 'Commit error', error: err }));
                  }

                  res.status(200).json({ message: 'Allocation updated successfully' });
                });
              }
            );
          } else {
            // Insert new assignment
            db.query(
              'INSERT INTO projectassignments (ProjectID, EmployeeID, Allocation) VALUES (?, ?, ?)',
              [projectID, employeeID, Allocation],
              (err) => {
                if (err) {
                  // Handle duplicate entry error specifically
                  if (err.code === 'ER_DUP_ENTRY') {
                    return db.rollback(() => res.status(409).json({ error: 'Duplicate entry for allocation' }));
                  }

                  return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => res.status(500).json({ error: 'Commit error', error: err }));
                  }

                  res.status(201).json({ message: 'Resource allocated successfully' });
                });
              }
            );
          }
        });
      });
    });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


app.get('/employees/client/innover', (req, res) => {
  // SQL query to get employees who are only working for projects of client "Innover"
  const query = `
    SELECT e.EmployeeID, e.EmployeeName, e.Email, GROUP_CONCAT(DISTINCT p.ProjectName) AS ProjectNames, SUM(pa.Allocation) AS Allocation
    FROM Employees e
    JOIN ProjectAssignments pa ON e.EmployeeID = pa.EmployeeID
    JOIN Projects p ON pa.ProjectID = p.ProjectID
    JOIN Clients c ON p.ClientID = c.ClientID
    GROUP BY e.EmployeeID, e.EmployeeName, e.Email
    HAVING COUNT(DISTINCT c.ClientID) = 1 AND MIN(c.ClientName) = 'Innover';
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    if (results.length === 0) {
      return res.status(404).send('No employees found for the client "Innover"');
    }
    res.json(results);
  });
});


app.post('/project/allocate-resource', (req, res) => {
  console.log(req.body);
  const { employeeName, projectName, Allocation } = req.body;
 
  if (!employeeName || !projectName || !Allocation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
 
  const formattedProjectName = projectName.replace(/-/g, ' ');
 
  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Transaction error', error: err });
    }
 
    // Check if the EmployeeID exists
    db.query('SELECT EmployeeID FROM employees WHERE EmployeeName = ?', [employeeName], (err, employeeResults) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
      }
 
      if (employeeResults.length === 0) {
        return db.rollback(() => res.status(404).json({ error: 'Employee not found' }));
      }
      const employeeID = employeeResults[0].EmployeeID;
 
      // Check if the ProjectID exists
      db.query('SELECT ProjectID FROM projects WHERE ProjectName = ?', [formattedProjectName], (err, projectResults) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
        }
 
        if (projectResults.length === 0) {
          return db.rollback(() => res.status(404).json({ error: 'Project not found' }));
        }
        const projectID = projectResults[0].ProjectID;
 
        // Check if the assignment already exists
        db.query('SELECT * FROM projectassignments WHERE ProjectID = ? AND EmployeeID = ?', [projectID, employeeID], (err, assignmentResults) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
          }
 
          if (assignmentResults.length > 0) {
            // Update existing assignment (if needed)
            db.query(
              'UPDATE projectassignments SET Allocation = ? WHERE ProjectID = ? AND EmployeeID = ?',
              [Allocation, projectID, employeeID],
              (err) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
                }
 
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => res.status(500).json({ error: 'Commit error', error: err }));
                  }
 
                  res.status(200).json({ message: 'Allocation updated successfully' });
                });
              }
            );
          } else {
            // Insert new assignment
            db.query(
              'INSERT INTO projectassignments (ProjectID, EmployeeID, Allocation) VALUES (?, ?, ?)',
              [projectID, employeeID, Allocation],
              (err) => {
                if (err) {
                  // Handle duplicate entry error specifically
                  if (err.code === 'ER_DUP_ENTRY') {
                    return db.rollback(() => res.status(409).json({ error: 'Duplicate entry for allocation' }));
                  }
 
                  return db.rollback(() => res.status(500).json({ error: 'Database query error', error: err }));
                }
 
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => res.status(500).json({ error: 'Commit error', error: err }));
                  }
 
                  res.status(201).json({ message: 'Resource allocated successfully' });
                });
              }
            );
          }
        });
      });
    });
  });
});