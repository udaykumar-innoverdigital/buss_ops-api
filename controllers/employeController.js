// In ../controllers/employeeController.js
import employeeService from '../services/employeeService.js'; // Import the service

const getEmpdetails = async (req, res) => {
  const name = req.params.name;
  try {
    const employee = employeeService.getEmployeeByName(name); // Get employee by name
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error fetching employee details:', error); // Log the error for debugging
    res.status(500).json({ error: 'An error occurred while fetching employee details.' });
  }
};

const getAllEmployees = (req, res) => {
  try {
    const employees = employeeService.getAllEmployees();
    
    res.status(200).json(employees);
  } catch (error) {
  
    res.status(500).json({ error: 'An error occurred while fetching employees.' });
  }
};

export default { getAllEmployees, getEmpdetails };
