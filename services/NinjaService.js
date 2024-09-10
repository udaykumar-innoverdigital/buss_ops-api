import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import data from '../data.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File path to save data (if using JSON files)
const dataFilePath = path.resolve(__dirname, '../data.json'); 

// Helper Functions
const loadData = () => {
    try {
        const rawData = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading data:', error);
        return { clients: [], projects: [], employees: [], resourceAllocations: [] };
    }
};

const saveData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

// Service Functions
const getClientById = (id) => {
    return data.clients.find(client => client.id === id);
};

const getProjectsByClientId = (clientId) => {
    return data.projects.filter(project => project.clientId === clientId);
};

const getEmployeesByProjectId = (projectId) => {
    const project = data.projects.find(p => p.id === projectId);
    return project ? data.employees.filter(employee => project.employees.includes(employee.id)) : [];
};

const getAllEmployees = () => {
    return data.employees;
};

const getEmployeeByName = (name) => {
    return data.employees.find(emp => emp.name === name);
};

const getAllClients = () => {
    return data.clients;
};

const getAllProjects = () => {
    return data.projects;
};

const getProjectById = (id) => {
    return data.projects.find(project => project.id === id);
};

const getProjectAllocations = (projectId) => {
    return data.resourceAllocations.filter(allocation => allocation.project_id === projectId);
};

const getEmployeeAllocations = (employeeId) => {
    return data.resourceAllocations.filter(allocation => allocation.resource_name === getEmployeeById(employeeId).name);
};

const generateAllocationReport = () => {
    return data.projects.map(project => ({
        project: getProjectById(project.id).name,
        allocations: getProjectAllocations(project.id).map(allocation => {
            const employee = getEmployeeByName(allocation.resource_name);
            return employee ? employee.name : 'Unknown';
        })
    }));
};

const addResourceAllocation = (newAllocation) => {
    const currentData = loadData();

    // Add the new allocation to the resourceAllocations array
    console.log("current data",currentData);
    currentData.resourceAllocations.push(newAllocation);
    console.log("resource allocation",newAllocation);
    // Find the corresponding project and add the employee to the project's employees list
    const project = currentData.projects.find(p => p.id === newAllocation.project_id);
    if (project) {
        const employee = currentData.employees.find(e => e.name === newAllocation.resource_name);
        if (employee && !project.employees.includes(employee.id)) {
            project.employees.push(employee.id);
        }
    }

    saveData(currentData);
    return currentData;
};

const generateBenchReport = () => {
    const allocatedEmployees = data.resourceAllocations.map(allocation => getEmployeeByName(allocation.resource_name)?.id).filter(Boolean);
    return data.employees.filter(employee => !allocatedEmployees.includes(employee.id));
};

export default {
    addResourceAllocation,
    getClientById,
    getProjectsByClientId,
    getEmployeesByProjectId,
    getAllEmployees,
    getEmployeeByName,
    getAllClients,
    getAllProjects,
    getProjectById,
    getProjectAllocations,
    getEmployeeAllocations,
    generateAllocationReport,
    generateBenchReport
};
