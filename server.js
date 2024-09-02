import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import setupSwagger from './swagger.js';
import employeeRoutes from './routes/employee.js';

const app = express();
const port = 5000;

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS

// Routes
app.use('/', employeeRoutes);

// Set up Swagger
setupSwagger(app);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);

});
