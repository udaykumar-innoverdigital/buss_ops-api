import dataService from '../services/NinjaService.js';
/**
 * Handle POST request to add a new resource allocation.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function addResourceAllocation(req, res) {
    const newAllocation = req.body;

    if (!newAllocation) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const updatedData = resourceService.addResourceAllocation(newAllocation);
        return res.status(201).json(updatedData);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to add resource allocation' });
    }
}
// const addResourceAllocation=(req,res)=>{
//     try {
//         const newAllocation = req.body;

//         // Basic validation
//         if (!newAllocation.resourceName || !newAllocation.allocation || !newAllocation.clientName || !newAllocation.clientProject || newAllocation.percentageAllocation === undefined) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         // Call the data service to add the new resource allocation
//         const updatedAllocations = dataService.addResourceAllocation(newAllocation);

//         // Respond with the updated list of allocations or the new allocation
//         res.status(201).json(updatedAllocations);
//     } catch (error) {
//         // Handle errors and respond with a server error status code
//         console.error('Error adding resource allocation:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// }
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
const getAllAllocations = (req, res) => {
    try {
        const allocations = allocationService.getAllocations();
        res.status(200).json(allocations);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getClientDetails = (req, res) => {
    const clientId = parseInt(req.params.id, 10);
    const client = dataService.getClientById(clientId);
    if (client) {
      res.json(client);
    } else {
      res.status(404).send('Client not found');
    }
  };
  
  const getProjectsForClient = (req, res) => {
    const clientId = parseInt(req.params.id, 10);
    const projects = dataService.getProjectsByClientId(clientId);
    res.json(projects);
  };
  
  const getEmployeesForProject = (req, res) => {
    const projectId = parseInt(req.params.projectId, 10);
    const employees = dataService.getEmployeesByProjectId(projectId);
    res.json(employees);
  };
export default{
    getAllAllocations,
    addResourceAllocation,
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
    generateBenchReport,
    getClientDetails,
  getProjectsForClient,
  getEmployeesForProject
};
