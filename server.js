import express from 'express';
import cors from 'cors';
import mysql from 'mysql'; // Import MySQL
import db from './dbSetup.js';
const app = express();
const port = 8080;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies


app.get('/modal/data', (req, res) => {
  const clientsQuery = `SELECT ClientID, ClientName FROM Clients`;
  const projectsQuery = `SELECT ProjectID, ProjectName, ClientID, ProjectManager FROM Projects`;
  const timeSheetApproversQuery = `
    SELECT DISTINCT EmployeeName AS Name
    FROM Employees
    WHERE EmployeeRole = 'Time Sheet Approver'
    UNION
    SELECT DISTINCT ProjectManager AS Name
    FROM Projects
    WHERE ProjectManager IS NOT NULL
  `;

  db.query(clientsQuery, (err, clients) => {
    if (err) {
      console.error('Error fetching clients:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    db.query(projectsQuery, (err, projects) => {
      if (err) {
        console.error('Error fetching projects:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      db.query(timeSheetApproversQuery, (err, timeSheetApprovers) => {
        if (err) {
          console.error('Error fetching time sheet approvers:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Extract unique time sheet approvers
        const uniqueApprovers = [...new Set(timeSheetApprovers.map(approver => approver.Name))];

        res.json({
          clients,
          projects,
          timeSheetApprovers: uniqueApprovers
        });
      });
    });
  });
});

app.get('/modal/data/:allocationId', (req, res) => {
  const { allocationId } = req.params;

  const allocationDetailsQuery = `
    SELECT a.*, 
           e.EmployeeName, 
           p.ProjectName, 
           c.ClientName
    FROM Allocations a
    JOIN Employees e ON a.EmployeeID = e.EmployeeId
    JOIN Projects p ON a.ProjectID = p.ProjectID
    JOIN Clients c ON a.ClientID = c.ClientID
    WHERE a.AllocationID = ?
  `;

  db.query(allocationDetailsQuery, [allocationId], (err, results) => {
    if (err) {
      console.error('Error fetching allocation details:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    res.json(results[0]);
  });
});
app.put('/allocations/:allocationId', (req, res) => {
  const { allocationId } = req.params;
  const {
    ClientID,
    ProjectID,
    AllocationPercent,
    AllocationStatus,
    AllocationStartDate,
    AllocationEndDate,
    AllocationTimeSheetApprover,
    AllocationBillingRate,
    ModifiedBy,
  } = req.body;

  const updateQuery = `
    UPDATE Allocations SET
      ClientID = ?,
      ProjectID = ?,
      AllocationPercent = ?,
      AllocationStatus = ?,
      AllocationStartDate = ?,
      AllocationEndDate = ?,
      AllocationTimeSheetApprover = ?,
      AllocationBillingRate = ?,
      ModifiedBy = ?,
      ModifiedAt = CURRENT_TIMESTAMP
    WHERE AllocationID = ?
  `;

  db.query(
    updateQuery,
    [
      ClientID,
      ProjectID,
      AllocationPercent,
      AllocationStatus,
      AllocationStartDate,
      AllocationEndDate,
      AllocationTimeSheetApprover,
      AllocationBillingRate,
      ModifiedBy,
      allocationId,
    ],
    (err, result) => {
      if (err) {
        console.error('Error updating allocation:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Allocation not found' });
      }

      res.json({ message: 'Allocation updated successfully' });
    }
  );
});
app.delete('/allocations/:allocationId', (req, res) => {
  const { allocationId } = req.params;

  const deleteQuery = `DELETE FROM Allocations WHERE AllocationID = ?`;

  db.query(deleteQuery, [allocationId], (err, result) => {
    if (err) {
      console.error('Error deleting allocation:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    res.json({ message: 'Allocation deleted successfully' });
  });
})
app.post('/api/allocate', (req, res) => {
  const {
    EmployeeID,
    ClientID,
    ProjectID,
    AllocationStatus,
    AllocationPercent,
    AllocationStartDate,
    AllocationEndDate,
    AllocationTimeSheetApprover,
    AllocationBillingRate,
    ModifiedBy,
  } = req.body;

  console.log('Received data:', req.body); // Log the received data for debugging

  // Validate required fields
  if (
    !EmployeeID ||
    !ClientID ||
    !ProjectID ||
    !AllocationStatus ||
    AllocationPercent === undefined ||
    !AllocationStartDate ||
    !AllocationBillingRate
  ) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  // Validate AllocationStatus
  const validStatuses = ['Client Unallocated', 'Project Unallocated', 'Allocated', 'Closed'];
  if (!validStatuses.includes(AllocationStatus)) {
    return res.status(400).json({ message: 'Invalid AllocationStatus value' });
  }

  // Validate AllocationPercent
  if (AllocationPercent < 0 || AllocationPercent > 100) {
    return res.status(400).json({ message: 'AllocationPercent must be between 0 and 100' });
  }

  // Validate AllocationTimeSheetApprover
  const validTimesheetApprovalValues = ['Rajendra', 'Kiran', 'Shishir'];
  if (!validTimesheetApprovalValues.includes(AllocationTimeSheetApprover)) {
    return res.status(400).json({ message: 'Invalid AllocationTimeSheetApprover value' });
  }

  // Insert into Allocations table
  const insertQuery = `
    INSERT INTO Allocations (
      ClientID,
      ProjectID,
      EmployeeID,
      AllocationStatus,
      AllocationPercent,
      AllocationStartDate,
      AllocationEndDate,
      AllocationTimeSheetApprover,
      AllocationBillingRate,
      ModifiedBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [
      ClientID,
      ProjectID,
      EmployeeID,
      AllocationStatus,
      AllocationPercent,
      AllocationStartDate,
      AllocationEndDate,
      AllocationTimeSheetApprover,
      AllocationBillingRate,
      ModifiedBy,
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting allocation:', err);
        return res.status(500).json({ message: 'Internal Server Error', error: err });
      }

      res.status(201).json({ message: 'Allocation added successfully', AllocationID: result.insertId });
    }
  );
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
  const { filter } = req.query; // 'active', 'closed', or 'all'

  if (!clientId || !projectId) {
    return res.status(400).send('Client ID and Project ID are required');
  }

  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch client and project names
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

    // Define query based on filter
    let allocationQuery = '';
    let queryParams = [];

    switch (filter) {
      case 'active':
        allocationQuery = `
          SELECT a.*, e.EmployeeName, e.EmployeeRole
          FROM Allocations a
          INNER JOIN Employees e ON a.EmployeeID = e.EmployeeID
          WHERE a.ClientID = ? AND a.ProjectID = ?
            AND a.AllocationStatus IN ('Client Unallocated', 'Project Unallocated', 'Allocated')
            AND a.AllocationStartDate <= ?
            AND (a.AllocationEndDate >= ? OR a.AllocationEndDate IS NULL)
        `;
        queryParams = [clientId, projectId, currentDate, currentDate];
        break;
      case 'closed':
        allocationQuery = `
          SELECT a.*, e.EmployeeName, e.EmployeeRole
          FROM Allocations a
          INNER JOIN Employees e ON a.EmployeeID = e.EmployeeID
          WHERE a.ClientID = ? AND a.ProjectID = ?
            AND (a.AllocationStatus = 'Closed' OR a.AllocationEndDate < ?)
        `;
        queryParams = [clientId, projectId, currentDate];
        break;
      case 'all':
        allocationQuery = `
          SELECT a.*, e.EmployeeName, e.EmployeeRole
          FROM Allocations a
          INNER JOIN Employees e ON a.EmployeeID = e.EmployeeID
          WHERE a.ClientID = ? AND a.ProjectID = ?
        `;
        queryParams = [clientId, projectId];
        break;
      default:
        return res.status(400).send('Invalid filter');
    }

    db.query(allocationQuery, queryParams, (allocErr, allocResults) => {
      if (allocErr) {
        console.error('Error fetching allocations:', allocErr);
        return res.status(500).send('Internal Server Error');
      }

      res.json({
        clientName,
        projectName,
        allocations: allocResults
      });
    });
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
