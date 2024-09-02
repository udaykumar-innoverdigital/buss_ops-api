// Sample data (replace with actual data source like a database)
const staticEmployees = [
    { id: 1, name: 'Amit Sharma', position: 'Software Engineer', department: 'Engineering' },
    { id: 2, name: 'Priya Patel', position: 'Product Manager', department: 'Product' },
    { id: 3, name: 'Ravi Kumar', position: 'Data Scientist', department: 'Analytics' },
    { id: 4, name: 'Neha Singh', position: 'UI/UX Designer', department: 'Design' },
    { id: 5, name: 'Rohit Gupta', position: 'Business Analyst', department: 'Business' },
    { id: 6, name: 'Sneha Reddy', position: 'Marketing Specialist', department: 'Marketing' },
    { id: 7, name: 'Vikram Desai', position: 'System Administrator', department: 'IT' },
    { id: 8, name: 'Anjali Mehta', position: 'HR Manager', department: 'Human Resources' },
    { id: 9, name: 'Karan Kapoor', position: 'Full Stack Developer', department: 'Engineering' },
    { id: 10, name: 'Ishita Bhatia', position: 'Sales Executive', department: 'Sales' }
];

const staticClients = [
    { id: 1, name: 'Tech Solutions Ltd.', industry: 'Software', contact: 'tech@solutions.com' },
    { id: 2, name: 'Green Energy Inc.', industry: 'Energy', contact: 'info@greenenergy.com' },
    { id: 3, name: 'HealthCare Plus', industry: 'Healthcare', contact: 'contact@healthcareplus.com' }
];

const staticProjects = [
    { id: 1, name: 'Project Alpha', clientId: 1, status: 'Ongoing' },
    { id: 2, name: 'Project Beta', clientId: 2, status: 'Completed' },
    { id: 3, name: 'Project Gamma', clientId: 3, status: 'Ongoing' }
];

const staticAllocations = [
    { projectId: 1, employeeId: 1 },
    { projectId: 1, employeeId: 9 },
    { projectId: 2, employeeId: 5 },
    { projectId: 3, employeeId: 3 },
    { projectId: 3, employeeId: 4 }
];

  
const getAllEmployees = () => {
    return staticEmployees;
};

const getEmployeeByName = (name) => {
    return staticEmployees.find(emp => emp.name === name);
};

const getAllClients = () => {
    return staticClients;
};

const getClientById = (id) => {
    return staticClients.find(client => client.id === id);
};

const getAllProjects = () => {
    return staticProjects;
};

const getProjectById = (id) => {
    return staticProjects.find(project => project.id === id);
};

const getProjectAllocations = (projectId) => {
    return staticAllocations.filter(allocation => allocation.projectId === projectId);
};

const getEmployeeAllocations = (employeeId) => {
    return staticAllocations.filter(allocation => allocation.employeeId === employeeId);
};

const generateAllocationReport = () => {
    return staticProjects.map(project => ({
        project: getProjectById(project.id).name,
        allocations: getProjectAllocations(project.id).map(allocation => {
            const employee = getEmployeeById(allocation.employeeId);
            return employee ? employee.name : 'Unknown';
        })
    }));
};

const generateBenchReport = () => {
    const allocatedEmployees = staticAllocations.map(allocation => allocation.employeeId);
    return staticEmployees.filter(employee => !allocatedEmployees.includes(employee.id));
};

const getEmployeeById = (id) => {
    return staticEmployees.find(emp => emp.id === id);
};

export default {
    getAllEmployees,
    getEmployeeByName,
    getAllClients,
    getClientById,
    getAllProjects,
    getProjectById,
    getProjectAllocations,
    getEmployeeAllocations,
    generateAllocationReport,
    generateBenchReport
};
