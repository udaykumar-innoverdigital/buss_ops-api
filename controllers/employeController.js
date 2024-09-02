import dataService from '../services/employeeService.js';

// Employee Controllers
const getAllEmployees = async (req, res) => {
    try {
        const employees = dataService.getAllEmployees();
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'An error occurred while fetching employees.' });
    }
};

const getEmployeeByName = async (req, res) => {
    const { name } = req.params;
    try {
        const employee = dataService.getEmployeeByName(name);
        if (employee) {
            res.status(200).json(employee);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error fetching employee by name:', error);
        res.status(500).json({ error: 'An error occurred while fetching employee details.' });
    }
};

const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = dataService.getEmployeeById(parseInt(id));
        if (employee) {
            res.status(200).json(employee);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.status(500).json({ error: 'An error occurred while fetching employee details.' });
    }
};

// Client Controllers
const getAllClients = async (req, res) => {
    try {
        const clients = dataService.getAllClients();
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'An error occurred while fetching clients.' });
    }
};

const getClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const client = dataService.getClientById(parseInt(id));
        if (client) {
            res.status(200).json(client);
        } else {
            res.status(404).json({ error: 'Client not found' });
        }
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        res.status(500).json({ error: 'An error occurred while fetching client details.' });
    }
};

// Project Controllers
const getAllProjects = async (req, res) => {
    try {
        const projects = dataService.getAllProjects();
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'An error occurred while fetching projects.' });
    }
};

const getProjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const project = dataService.getProjectById(parseInt(id));
        if (project) {
            res.status(200).json(project);
        } else {
            res.status(404).json({ error: 'Project not found' });
        }
    } catch (error) {
        console.error('Error fetching project by ID:', error);
        res.status(500).json({ error: 'An error occurred while fetching project details.' });
    }
};

// Allocation Controllers
const getProjectAllocations = async (req, res) => {
    const { projectId } = req.params;
    try {
        const allocations = dataService.getProjectAllocations(parseInt(projectId));
        res.status(200).json(allocations);
    } catch (error) {
        console.error('Error fetching project allocations:', error);
        res.status(500).json({ error: 'An error occurred while fetching project allocations.' });
    }
};

const getEmployeeAllocations = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const allocations = dataService.getEmployeeAllocations(parseInt(employeeId));
        res.status(200).json(allocations);
    } catch (error) {
        console.error('Error fetching employee allocations:', error);
        res.status(500).json({ error: 'An error occurred while fetching employee allocations.' });
    }
};

// Report Controllers
const generateAllocationReport = async (req, res) => {
    try {
        const report = dataService.generateAllocationReport();
        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating allocation report:', error);
        res.status(500).json({ error: 'An error occurred while generating the allocation report.' });
    }
};

const generateBenchReport = async (req, res) => {
    try {
        const report = dataService.generateBenchReport();
        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating bench report:', error);
        res.status(500).json({ error: 'An error occurred while generating the bench report.' });
    }
};

export default {
    getAllEmployees,
    getEmployeeByName,
    getEmployeeById,
    getAllClients,
    getClientById,
    getAllProjects,
    getProjectById,
    getProjectAllocations,
    getEmployeeAllocations,
    generateAllocationReport,
    generateBenchReport
};
