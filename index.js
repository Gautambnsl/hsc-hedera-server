const express = require('express');
const { Test } = require('./test'); // Import the Test function
const app = express();
const port = 3001;

// Define a GET request endpoint to call Test
app.get('/SendMessageOnHedera', async (req, res) => {
  console.log('Received request');
  
  const { string1 } = req.query;

  // Check if both strings are provided
  if (!string1) {
    return res.status(400).json({ error: ' Message is  required' });
  }

  try {

      let result = await Test(string1);
      res.json({ result });
    

    // Return the result from Test function as a JSON response
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Something went wrong while processing the request.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
