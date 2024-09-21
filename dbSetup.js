import mysql from 'mysql';

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Innover@2024',
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
  const checkTablesQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'ninja' AND table_name IN ('Employees', 'Projects', 'Clients', 'Allocations');
  `;

  db.query(checkTablesQuery, (err, results) => {
    if (err) {
      console.error('Error checking tables:', err);
      return;
    }

    const existingTables = results.map(row => row.TABLE_NAME);
    const requiredTables = ['Employees', 'Clients', 'Projects', 'Allocations'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      createTables(missingTables);
    } else {
      console.log('All tables exist.');
      // Check if tables are empty
      checkIfTablesAreEmpty();
    }
  });
}

// Function to create tables
function createTables(tables) {
  const tableDefinitions = {
    Employees: `
      CREATE TABLE IF NOT EXISTS Employees (
        EmployeeId VARCHAR(10) PRIMARY KEY,
        EmployeeName VARCHAR(255) NOT NULL,
        EmployeeRole VARCHAR(255),
        EmployeeEmail VARCHAR(255) UNIQUE NOT NULL,
        EmployeeStudio VARCHAR(255),
        EmployeeSubStudio VARCHAR(255),
        EmployeeLocation VARCHAR(255),
        EmployeeJoiningDate DATE NOT NULL,
        EmployeeEndingDate DATE,
        EmployeeSkills TEXT,
        EmployeeKekaStatus VARCHAR(255),
        EmployeeTYOE INT,
        EmployeePhotoDetails VARCHAR(255)
      )
    `,
    Clients: `
      CREATE TABLE IF NOT EXISTS Clients (
        ClientID INT AUTO_INCREMENT PRIMARY KEY,
        ClientName VARCHAR(255) UNIQUE NOT NULL,
        ClientCountry VARCHAR(100),
        ClientPartner VARCHAR(100),
        ClientLogo VARCHAR(100)
      )
    `,
    Projects: `
      CREATE TABLE IF NOT EXISTS Projects (
        ProjectID INT AUTO_INCREMENT PRIMARY KEY,
        ProjectName VARCHAR(255) NOT NULL,
        ClientID INT,
        ProjectStatus VARCHAR(50),
        ProjectCategory VARCHAR(100),
        ProjectManager VARCHAR(100),
        ProjectStartDate DATE NOT NULL,
        ProjectEndDate DATE,
        FOREIGN KEY (ClientID) REFERENCES Clients(ClientID)
      )
    `,
    Allocations: `
      CREATE TABLE IF NOT EXISTS Allocations (
        AllocationID INT AUTO_INCREMENT PRIMARY KEY,
        ClientID INT,
        ProjectID INT,
        EmployeeID VARCHAR(10),
        AllocationStatus ENUM('Client Unallocated', 'Project Unallocated', 'Allocated', 'Closed') NOT NULL,
        AllocationPercent INT NOT NULL CHECK (AllocationPercent BETWEEN 0 AND 100),
        AllocationBillingRate DECIMAL(10, 2),
        AllocationTimeSheetApprover ENUM('Rajendra', 'Kiran', 'Shishir') DEFAULT 'Rajendra',
        AllocationStartDate DATE NOT NULL,
        AllocationEndDate DATE,
        ModifiedBy VARCHAR(100),
        ModifiedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID),
        FOREIGN KEY (ClientID) REFERENCES Clients(ClientID),
        FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeId)
      )
    `,
  };

  tables.forEach((table) => {
    const createQuery = tableDefinitions[table];
    if (createQuery) {
      db.query(createQuery, (err) => {
        if (err) {
          console.error(`Error creating table ${table}:`, err);
          return;
        }
        console.log(`Table ${table} is ready`);

        // After creating all tables, check if they are empty
        if (tables.indexOf(table) === tables.length - 1) {
          checkIfTablesAreEmpty();
        }
      });
    } else {
      console.warn(`No definition found for table ${table}`);
    }
  });
}

// Function to check if tables are empty
function checkIfTablesAreEmpty() {
  const checkEmptyQueries = {
    Clients: 'SELECT COUNT(*) AS count FROM Clients',
    Projects: 'SELECT COUNT(*) AS count FROM Projects',
    Employees: 'SELECT COUNT(*) AS count FROM Employees',
  };

  let remainingTables = Object.keys(checkEmptyQueries).length;

  for (const table in checkEmptyQueries) {
    db.query(checkEmptyQueries[table], (err, results) => {
      if (err) {
        console.error(`Error checking if ${table} is empty:`, err);
        remainingTables--;
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
        // Initial setup complete. Connection remains open.
        console.log('Initial database setup complete. Connection remains open.');
      }
    });
  }
}

// Function to insert initial data
function insertInitialData(table) {
  const queries = {
    Clients: `
      INSERT INTO Clients (ClientName, ClientCountry, ClientPartner, ClientLogo) VALUES
        ('Innover Digital.', 'USA', 'Rajendra', 'https://example.com/logos/tech_innovators.png'),
        ('Global Finance Corp.', 'Canada', 'Sudir', 'https://example.com/logos/global_finance.png'),
        ('HealthPlus Solutions', 'India', 'Stalin', 'https://example.com/logos/healthplus.png'),
        ('EcoGreen Enterprises', 'Germany', 'Jai', 'https://example.com/logos/ecogreen.png'),
        ('NextGen Media', 'Australia', 'Shetty', 'https://example.com/logos/nextgen_media.png'),
        ('Alpha Manufacturing', 'China', 'Nancy', 'https://example.com/logos/alpha_manufacturing.png'),
        ('Bright Future Education', 'UK', 'Paul', 'https://example.com/logos/bright_future.png'),
        ('Urban Developers', 'Singapore', 'Walker', 'https://example.com/logos/urban_developers.png'),
        ('Solaris Energy', 'Netherlands', 'Vin', 'https://example.com/logos/solaris_energy.png'),
        ('MediCare Partners', 'France', 'Diesel', 'https://example.com/logos/medicare_partners.png');

    `,
    Projects: `
      INSERT INTO Projects (ProjectName, ClientID, ProjectStatus, ProjectCategory, ProjectManager, ProjectStartDate, ProjectEndDate) VALUES
        ('Project Alpha', 1, 'Completed', 'Software Development', 'John Doe', '2024-01-15', '2025-08-01'),
        ('Project Beta', 2, 'In Progress', 'IT Consulting', 'Jane Smith', '2024-03-01', NULL),
        ('Project Gamma', 3, 'On Hold', 'Cloud Solutions', 'John Doe', '2024-05-20', NULL),
        ('Project Delta', 1, 'In Progress', 'Mobile App Development', 'Sarah Connor', '2024-07-10', NULL),
        ('Project Epsilon', 4, 'Completed', 'Security Solutions', 'James Bond', '2021-11-01', '2022-03-15'),
        ('Project Zeta', 1, 'Completed', 'Software Development', 'John Doe', '2022-01-15', '2022-08-01'),
        ('Project Omni', 2, 'In Progress', 'IT Consulting', 'Jane Smith', '2024-03-01', NULL),
        ('Project Galaxy', 3, 'On Hold', 'Cloud Solutions', 'John Doe', '2024-05-20', NULL),
        ('Project Star', 1, 'In Progress', 'Mobile App Development', 'Sarah Connor', '2024-07-10', NULL),
        ('Project Peanuts', 4, 'Completed', 'Security Solutions', 'James Bond', '2021-11-01', '2022-03-15');

    `,
    Employees: `
      INSERT INTO Employees (EmployeeId, EmployeeName, EmployeeRole, EmployeeEmail, EmployeeStudio, EmployeeSubStudio, EmployeeLocation, EmployeeJoiningDate, EmployeeEndingDate, EmployeeSkills, EmployeeKekaStatus, EmployeeTYOE, EmployeePhotoDetails) VALUES
        ('INN001', 'Alice Johnson', 'Data Analyst', 'alice.johnson@example.com', 'Data & Insights', 'Advanced Analytics', 'USA', '2018-06-15', NULL, 'Python, SQL, Tableau', 'Active', 6, 'https://example.com/photos/alice_johnson.jpg'),
        ('INN002', 'Bob Smith', 'Software Engineer', 'bob.smith@example.com', 'Digital Operations', 'Software Engineering', 'India', '2020-01-10', NULL, 'Java, Spring Boot, AWS', 'Active', 4, 'https://example.com/photos/bob_smith.jpg'),
        ('INN003', 'Charlie Davis', 'Data Engineer', 'charlie.davis@example.com', 'Data & Insights', 'Data Engineering', 'Canada', '2016-09-25', '2023-12-31', 'Scala, Hadoop, Kafka', 'Not-Active', 7, 'https://example.com/photos/charlie_davis.jpg'),
        ('INN004', 'Diana Prince', 'UX Designer', 'diana.prince@example.com', 'Digital Experiences', 'Digital Ops', 'USA', '2019-03-05', NULL, 'Adobe XD, Sketch, User Research', 'Active', 5, 'https://example.com/photos/diana_prince.jpg'),
        ('INN005', 'Ethan Hunt', 'Project Manager', 'ethan.hunt@example.com', 'Digital Operations', 'Digital Ops', 'India', '2015-11-20', '2022-08-15', 'Agile, Scrum, Leadership', 'Not-Active', 10, 'https://example.com/photos/ethan_hunt.jpg'),
        ('INN006', 'Fiona Gallagher', 'Business Analyst', 'fiona.gallagher@example.com', 'Data & Insights', 'Advanced Analytics', 'Canada', '2021-07-30', NULL, 'Excel, SQL, Power BI', 'Active', 3, 'https://example.com/photos/fiona_gallagher.jpg'),
        ('INN007', 'George Martin', 'Senior Software Engineer', 'george.martin@example.com', 'Digital Operations', 'Software Engineering', 'USA', '2012-04-18', NULL, 'C++, Python, DevOps', 'Active', 12, 'https://example.com/photos/george_martin.jpg'),
        ('INN008', 'Hannah Lee', 'Data Scientist', 'hannah.lee@example.com', 'Data & Insights', 'Advanced Analytics', 'India', '2017-02-22', NULL, 'Machine Learning, R, Python', 'Active', 5, 'https://example.com/photos/hannah_lee.jpg'),
        ('INN009', 'Ian Wright', 'Frontend Developer', 'ian.wright@example.com', 'Digital Experiences', 'Software Engineering', 'Canada', '2023-05-01', NULL, 'JavaScript, React, CSS', 'Active', 2, 'https://example.com/photos/ian_wright.jpg'),
        ('INN010', 'Jasmine Patel', 'Data Engineer', 'jasmine.patel@example.com', 'Data & Insights', 'Data Engineering', 'USA', '2014-10-12', '2021-07-30', 'ETL, SQL, AWS', 'Not-Active', 8, 'https://example.com/photos/jasmine_patel.jpg'),
        ('INN011', 'Kevin Black', 'DevOps Engineer', 'kevin.black@example.com', 'Digital Operations', 'Software Engineering', 'USA', '2019-10-15', NULL, 'Docker, Kubernetes, CI/CD', 'Active', 4, 'https://example.com/photos/kevin_black.jpg'),
        ('INN012', 'Lily White', 'Data Analyst', 'lily.white@example.com', 'Data & Insights', 'Advanced Analytics', 'Canada', '2020-06-18', NULL, 'Python, SQL, Tableau', 'Active', 3, 'https://example.com/photos/lily_white.jpg'),
        ('INN013', 'Michael Green', 'Backend Developer', 'michael.green@example.com', 'Digital Operations', 'Software Engineering', 'India', '2016-04-21', NULL, 'Java, SQL, AWS', 'Active', 8, 'https://example.com/photos/michael_green.jpg'),
        ('INN014', 'Nancy Hall', 'UX Designer', 'nancy.hall@example.com', 'Digital Experiences', 'Design', 'USA', '2021-08-10', NULL, 'Sketch, Figma, Adobe XD', 'Active', 2, 'https://example.com/photos/nancy_hall.jpg'),
        ('INN015', 'Oscar Perry', 'Data Scientist', 'oscar.perry@example.com', 'Data & Insights', 'Advanced Analytics', 'India', '2018-11-02', NULL, 'Python, R, SQL', 'Active', 5, 'https://example.com/photos/oscar_perry.jpg'),
        ('INN016', 'Paula Kim', 'Frontend Developer', 'paula.kim@example.com', 'Digital Experiences', 'Software Engineering', 'Canada', '2019-02-20', NULL, 'JavaScript, React, HTML/CSS', 'Active', 4, 'https://example.com/photos/paula_kim.jpg'),
        ('INN017', 'Quincy Adams', 'Product Manager', 'quincy.adams@example.com', 'Digital Operations', 'Digital Ops', 'USA', '2015-09-10', '2023-06-30', 'Agile, Scrum, Leadership', 'Not-Active', 8, 'https://example.com/photos/quincy_adams.jpg'),
        ('INN018', 'Rachel King', 'Business Analyst', 'rachel.king@example.com', 'Data & Insights', 'Advanced Analytics', 'India', '2022-01-05', NULL, 'Excel, SQL, Power BI', 'Active', 2, 'https://example.com/photos/rachel_king.jpg'),
        ('INN019', 'Steven Bell', 'Software Engineer', 'steven.bell@example.com', 'Digital Operations', 'Software Engineering', 'USA', '2017-10-25', NULL, 'Java, Spring Boot, SQL', 'Active', 6, 'https://example.com/photos/steven_bell.jpg'),
        ('INN020', 'Tina Moore', 'Data Analyst', 'tina.moore@example.com', 'Data & Insights', 'Data Engineering', 'Canada', '2016-12-05', '2022-03-01', 'Python, Tableau, SQL', 'Not-Active', 5, 'https://example.com/photos/tina_moore.jpg'),
        ('INN021', 'Uma Harris', 'Cloud Engineer', 'uma.harris@example.com', 'Digital Operations', 'Software Engineering', 'India', '2018-03-14', NULL, 'AWS, GCP, Terraform', 'Active', 5, 'https://example.com/photos/uma_harris.jpg'),
        ('INN022', 'Victor Lee', 'Machine Learning Engineer', 'victor.lee@example.com', 'Data & Insights', 'Advanced Analytics', 'USA', '2020-08-09', NULL, 'Python, TensorFlow, SQL', 'Active', 3, 'https://example.com/photos/victor_lee.jpg'),
        ('INN023', 'Wendy Scott', 'Project Coordinator', 'wendy.scott@example.com', 'Digital Operations', 'Digital Ops', 'Canada', '2014-07-17', '2021-12-31', 'Agile, Project Management', 'Not-Active', 7, 'https://example.com/photos/wendy_scott.jpg'),
        ('INN024', 'Xavier Young', 'Security Analyst', 'xavier.young@example.com', 'Digital Operations', 'Security', 'India', '2021-05-25', NULL, 'Cybersecurity, Linux, Python', 'Active', 3, 'https://example.com/photos/xavier_young.jpg'),
        ('INN025', 'Yara Blake', 'UX Researcher', 'yara.blake@example.com', 'Digital Experiences', 'Design', 'USA', '2019-11-13', NULL, 'User Research, Interviews, Figma', 'Active', 4, 'https://example.com/photos/yara_blake.jpg'),
        ('INN026', 'Zane Carter', 'Data Engineer', 'zane.carter@example.com', 'Data & Insights', 'Data Engineering', 'Canada', '2017-09-01', NULL, 'Python, SQL, Airflow', 'Active', 5, 'https://example.com/photos/zane_carter.jpg'),
        ('INN027', 'Amelia Walker', 'Business Intelligence Developer', 'amelia.walker@example.com', 'Data & Insights', 'Advanced Analytics', 'India', '2015-06-30', NULL, 'Power BI, Tableau, SQL', 'Active', 8, 'https://example.com/photos/amelia_walker.jpg'),
        ('INN028', 'Brandon Wright', 'DevOps Engineer', 'brandon.wright@example.com', 'Digital Operations', 'Software Engineering', 'USA', '2022-02-14', NULL, 'AWS, Docker, Jenkins', 'Active', 2, 'https://example.com/photos/brandon_wright.jpg'),
        ('INN029', 'Clara Hall', 'Data Scientist', 'clara.hall@example.com', 'Data & Insights', 'Advanced Analytics', 'Canada', '2020-07-28', NULL, 'Python, SQL, R', 'Active', 4, 'https://example.com/photos/clara_hall.jpg'),
        ('INN030', 'Daniel Evans', 'Software Engineer', 'daniel.evans@example.com', 'Digital Operations', 'Software Engineering', 'India', '2013-05-09', NULL, 'Java, Spring Boot, SQL', 'Active', 10, 'https://example.com/photos/daniel_evans.jpg'),
        ('INN031', 'Eva Carter', 'UX Designer', 'eva.carter@example.com', 'Digital Experiences', 'Design', 'USA', '2019-09-20', NULL, 'Sketch, Figma, Adobe XD', 'Active', 4, 'https://example.com/photos/eva_carter.jpg'),
        ('INN032', 'Frank Johnson', 'Software Architect', 'frank.johnson@example.com', 'Digital Operations', 'Software Engineering', 'Canada', '2010-03-12', NULL, 'Java, Microservices, AWS', 'Active', 14, 'https://example.com/photos/frank_johnson.jpg'),
        ('INN033', 'Grace Lee', 'Data Engineer', 'grace.lee@example.com', 'Data & Insights', 'Data Engineering', 'India', '2017-11-29', NULL, 'Python, Airflow, SQL', 'Active', 6, 'https://example.com/photos/grace_lee.jpg'),
        ('INN034', 'Henry Collins', 'Cloud Engineer', 'henry.collins@example.com', 'Digital Operations', 'Software Engineering', 'USA', '2018-12-03', NULL, 'AWS, Terraform, GCP', 'Active', 5, 'https://example.com/photos/henry_collins.jpg'),
        ('INN035', 'Isla Young', 'Project Manager', 'isla.young@example.com', 'Digital Operations', 'Digital Ops', 'Canada', '2015-01-22', '2021-09-15', 'Scrum, Agile, Leadership', 'Not-Active', 6, 'https://example.com/photos/isla_young.jpg');
    `,
  };

  const insertQuery = queries[table];
  if (insertQuery) {
    db.query(insertQuery, (err) => {
      if (err) {
        console.error(`Error inserting initial data into ${table}:`, err);
      } else {
        console.log(`Initial data inserted into ${table}`);
      }
    });
  } else {
    console.warn(`No initial data defined for table ${table}`);
  }
}

// Function to gracefully close the database connection
function gracefulShutdown() {
  console.log('\nGracefully shutting down from SIGINT/SIGTERM or application exit.');

  db.end((err) => {
    if (err) {
      console.error('Error during database disconnection:', err);
      process.exit(1); // Exit with failure
    }
    console.log('Database connection closed.');
    process.exit(0); // Exit without error
  });
}

// Listen for termination signals (e.g., Ctrl+C)
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Optional: Handle unexpected errors and attempt to close the connection
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

export default db;
