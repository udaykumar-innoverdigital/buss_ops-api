import express from 'express';
import mainController from '../controllers/NinjaController.js';

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

router.get('/client/:id', mainController.getClientDetails);
router.get('/client/:id/projects', mainController.getProjectsForClient);
router.get('/project/:projectId/employees', mainController.getEmployeesForProject);
router.post('/allocate-resourcess', mainController.addResourceAllocation);
export default router;
