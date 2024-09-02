import express from 'express';
import mainController from '../controllers/employeController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: API for managing employee data
 */

/**
 * @swagger
 * /employees/{name}:
 *   get:
 *     summary: Retrieve an employee by their name
 *     tags: [Employee]
 *     description: Returns details of an employee when the employee's name is provided in the path parameter.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: The name of the employee to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Amit Sharma
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 position:
 *                   type: string
 *                   example: Software Engineer
 *                 department:
 *                   type: string
 *                   example: Engineering
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Employee not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching employee details.
 */
router.get('/employees/:name', mainController.getEmployeeByName);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Retrieve all employees
 *     tags: [Employee]
 *     description: Returns a list of all employees.
 *     responses:
 *       200:
 *         description: List of employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Amit Sharma
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   position:
 *                     type: string
 *                     example: Software Engineer
 *                   department:
 *                     type: string
 *                     example: Engineering
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching employees.
 */
router.get('/employees', mainController.getAllEmployees);

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: API for managing client data
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Retrieve all clients
 *     tags: [Client]
 *     description: Returns a list of all clients.
 *     responses:
 *       200:
 *         description: List of clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Tech Solutions Ltd.
 *                   industry:
 *                     type: string
 *                     example: Software
 *                   contact:
 *                     type: string
 *                     example: tech@solutions.com
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching clients.
 */
router.get('/clients', mainController.getAllClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Retrieve a client by their ID
 *     tags: [Client]
 *     description: Returns details of a client when the client's ID is provided in the path parameter.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the client to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Client details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Tech Solutions Ltd.
 *                 industry:
 *                   type: string
 *                   example: Software
 *                 contact:
 *                   type: string
 *                   example: tech@solutions.com
 *       404:
 *         description: Client not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Client not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching client details.
 */
router.get('/clients/:id', mainController.getClientById);

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: API for managing project data
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Retrieve all projects
 *     tags: [Project]
 *     description: Returns a list of all projects.
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Project Alpha
 *                   clientId:
 *                     type: integer
 *                     example: 1
 *                   status:
 *                     type: string
 *                     example: Ongoing
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching projects.
 */
router.get('/projects', mainController.getAllProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Retrieve a project by its ID
 *     tags: [Project]
 *     description: Returns details of a project when the project's ID is provided in the path parameter.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Project Alpha
 *                 clientId:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   example: Ongoing
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Project not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching project details.
 */
router.get('/projects/:id', mainController.getProjectById);

/**
 * @swagger
 * tags:
 *   name: Allocation
 *   description: API for managing project allocations
 */

/**
 * @swagger
 * /allocations/project/{projectId}:
 *   get:
 *     summary: Retrieve allocations for a project
 *     tags: [Allocation]
 *     description: Returns a list of allocations for a given project ID.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: The ID of the project to retrieve allocations for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Allocations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   projectId:
 *                     type: integer
 *                     example: 1
 *                   employeeId:
 *                     type: integer
 *                     example: 1
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching project allocations.
 */
router.get('/allocations/project/:projectId', mainController.getProjectAllocations);

/**
 * @swagger
 * /allocations/employee/{employeeId}:
 *   get:
 *     summary: Retrieve allocations for an employee
 *     tags: [Allocation]
 *     description: Returns a list of allocations for a given employee ID.
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         description: The ID of the employee to retrieve allocations for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Allocations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   projectId:
 *                     type: integer
 *                     example: 1
 *                   employeeId:
 *                     type: integer
 *                     example: 1
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching employee allocations.
 */
router.get('/allocations/employee/:employeeId', mainController.getEmployeeAllocations);

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: API for generating reports
 */

/**
 * @swagger
 * /reports/allocation:
 *   get:
 *     summary: Generate an allocation report
 *     tags: [Report]
 *     description: Generates a report showing project allocations.
 *     responses:
 *       200:
 *         description: Allocation report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   project:
 *                     type: string
 *                     example: Project Alpha
 *                   allocations:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: Amit Sharma
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while generating the allocation report.
 */
router.get('/reports/allocation', mainController.generateAllocationReport);

/**
 * @swagger
 * /reports/bench:
 *   get:
 *     summary: Generate a bench report
 *     tags: [Report]
 *     description: Generates a report of employees who are not currently allocated to any project.
 *     responses:
 *       200:
 *         description: Bench report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 7
 *                   name:
 *                     type: string
 *                     example: Vikram Desai
 *                   position:
 *                     type: string
 *                     example: System Administrator
 *                   department:
 *                     type: string
 *                     example: IT
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while generating the bench report.
 */
router.get('/reports/bench', mainController.generateBenchReport);

export default router;
