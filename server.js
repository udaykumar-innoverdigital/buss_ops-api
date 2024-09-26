import express from 'express';
import cors from 'cors';
import db from './dbSetup.js'; // Ensure dbSetup is imported if you need to set up the database
import { populateDatabase } from './populate.js'; // Make sure to export the function from populate.js
import mysql from 'mysql';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Route to trigger data population
app.post('/populate', async (req, res) => {
  try {
    await populateDatabase(); // This function should be called from populate.js
    res.status(200).send('Data populated successfully');
  } catch (error) {
    console.error('Error populating data:', error);
    res.status(500).send('Failed to populate data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
