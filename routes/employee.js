import express from 'express';
import employeeController from '../controllers/employeController.js';

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
 *                   example: syedanwar
 *                 id:
 *                   type: integer
 *                   example: 123
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
router.get('/:name', employeeController.getEmpdetails);
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
 *                     example: syedanwar
 *                   id:
 *                     type: integer
 *                     example: 123
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
router.get('/', employeeController.getAllEmployees);

export default router;
