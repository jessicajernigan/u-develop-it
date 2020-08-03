const express = require('express');
const db = require('./db/database');

const PORT = process.env.PORT || 3001;
const app = express();

const apiRoutes = require('./routes/apiRoutes'); // Remember that you don't have to specify index.js in the path (e.g., ./routes/apiRoutes/index.js). If the directory has an index.js file in it, Node.js will automatically look for it when requiring the directory.

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use apiRoutes
app.use('/api', apiRoutes);


// // TEST GET ROUTE
// app.get('/', (req, res) => {
//   res.json({
//     message: "I'm your huckleberry"
//   });
// });


// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});


/* To ensure that the Express.js server doesn't start before the connection 
to the database has been established, let's wrap the Express.js server connection 
located at the bottom of the server.js file in an event handler */
db.on('open', () => {
  app.listen(PORT, () => {
    console.log(`Server is locked 'n' loaded on port ${PORT}`);
  });
});