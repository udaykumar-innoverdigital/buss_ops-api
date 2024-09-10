const data = {
    clients: [
      { id: 1, company: 'innover', noOfProjects: 2, status: 'progress', country: 'India', start: '2023-01-01', end: '2024-01-01', noOfEmployees: 50 },
      { id: 2, company: 'walmart', noOfProjects: 3, status: 'completed', country: 'USA', start: '2022-05-15', end: '2023-12-31', noOfEmployees: 100 },
      { id: 3, company: 'infosis', noOfProjects: 1, status: 'progress', country: 'Canada', start: '2023-03-01', end: '2024-03-01', noOfEmployees: 30 },
      { id: 4, company: 'Innovate Inc.', noOfProjects: 4, status: 'not started', country: 'UK', start: '2023-08-01', end: '2024-08-01', noOfEmployees: 75 },
      { id: 5, company: 'FutureTech', noOfProjects: 2, status: 'progress', country: 'Germany', start: '2023-02-01', end: '2024-02-01', noOfEmployees: 60 }
    ],
    projects: [
      { id: 1, clientId: 1, name: 'Project Alpha', employees: [1, 2], status: 'Active', category: 'Development' },
      { id: 2, clientId: 1, name: 'Project Beta', employees: [2, 3], status: 'Completed', category: 'Testing' },
      { id: 3, clientId: 2, name: 'Project Gamma', employees: [3, 4], status: 'Active', category: 'Development' },
      { id: 4, clientId: 2, name: 'Project Delta', employees: [1, 4], status: 'On Hold', category: 'Research' },
      { id: 5, clientId: 2, name: 'Project Epsilon', employees: [2, 5], status: 'Completed', category: 'Maintenance' },
      { id: 6, clientId: 3, name: 'Project Zeta', employees: [1, 5], status: 'Active', category: 'Development' },
      { id: 7, clientId: 4, name: 'Project Eta', employees: [3, 4, 5], status: 'On Hold', category: 'Development' },
      { id: 8, clientId: 4, name: 'Project Theta', employees: [2, 4], status: 'Active', category: 'Testing' },
      { id: 9, clientId: 5, name: 'Project Iota', employees: [1, 3], status: 'Completed', category: 'Research' },
      { id: 10, clientId: 5, name: 'Project Kappa', employees: [2, 5], status: 'Active', category: 'Maintenance' }
    ],
    employees: [
      { id: 1, name: 'syedanwar', role: 'Developer', status: 'Active' },
      { id: 2, name: 'Jane Smith', role: 'Designer', status: 'Active' },
      { id: 3, name: 'Emily Davis', role: 'Project Manager', status: 'Inactive' },
      { id: 4, name: 'Michael Brown', role: 'QA Engineer', status: 'Active' },
      { id: 5, name: 'Sarah Johnson', role: 'Business Analyst', status: 'On Leave' }
    ],
    resourceAllocations: [
      { id: 1, allocation: 'Full-time', client_id: 1, project_id: 1, resource_name: 'syedanwar', percentage_allocation: 100 },
      { id: 2, allocation: 'Part-time', client_id: 1, project_id: 2, resource_name: 'Jane Smith', percentage_allocation: 50 },
      { id: 3, allocation: 'Full-time', client_id: 2, project_id: 3, resource_name: 'Emily Davis', percentage_allocation: 100 },
      { id: 4, allocation: 'Part-time', client_id: 2, project_id: 4, resource_name: 'Michael Brown', percentage_allocation: 75 },
      { id: 5, allocation: 'Full-time', client_id: 2, project_id: 5, resource_name: 'Sarah Johnson', percentage_allocation: 100 },
      { id: 6, allocation: 'Part-time', client_id: 3, project_id: 6, resource_name: 'syedanwar', percentage_allocation: 50 },
      { id: 7, allocation: 'Full-time', client_id: 4, project_id: 7, resource_name: 'Emily Davis', percentage_allocation: 100 },
      { id: 8, allocation: 'Part-time', client_id: 4, project_id: 8, resource_name: 'Michael Brown', percentage_allocation: 25 },
      { id: 9, allocation: 'Full-time', client_id: 5, project_id: 9, resource_name: 'syedanwar', percentage_allocation: 100 },
      { id: 10, allocation: 'Part-time', client_id: 5, project_id: 10, resource_name: 'Jane Smith', percentage_allocation: 50 }
    ]
};

export default data;