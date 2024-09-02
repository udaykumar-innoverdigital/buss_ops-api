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
  
  const getAllEmployees = () => {
    return staticEmployees;
  };
  
  const getEmployeeByName = (name) => {
    return staticEmployees.find(emp => emp.name === name);
  };
  
  export default {
    getAllEmployees,
    getEmployeeByName
  };