const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const inputCheck = require('./utils/inputCheck');

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = new sqlite3.Database('./db/election.db', err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the election database.');
});

// // TEST GET ROUTE
// app.get('/', (req, res) => {
//   res.json({
//     message: "I'm your huckleberry"
//   });
// });


// GET all candidates
app.get('/api/candidates', (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
  AS party_name 
  FROM candidates 
  LEFT JOIN parties 
  ON candidates.party_id = parties.id`;
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: 'Success!',
      data: rows
    });
  });
});

// GET all parties
app.get('/api/parties', (req, res) => {
  const sql = `SELECT * FROM parties`;
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: rows
    });
  });
});


// GET a single candidate
app.get('/api/candidate/:id', (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
  AS party_name 
  FROM candidates 
  LEFT JOIN parties 
  ON candidates.party_id = parties.id 
  WHERE candidates.id = ?`;
  const params = [req.params.id]; // a route parameter that will hold the value of the id to specify which candidate we'll select from the database
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: row
    });
  });
});

// GET a single party
app.get('/api/party/:id', (req, res) => {
  const sql = `SELECT * FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: row
    });
  });
});


// UPDATE a given candidate's party_id
app.put('/api/candidate/:id', (req, res) => {
  const errors = inputCheck(req.body, 'party_id'); // Validate that a valid party_id was provided in the request

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql =
    `UPDATE candidates SET party_id = ? 
  WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];

  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: req.body,
      changes: this.changes
    });
  });
});

// DELETE a given candidate
/* 
- uses its own HTTP request method -- delete()
- as above, includes a route parameter to uniquely identify the candidate to remove. 
- done using a prepared SQL statement with a placeholder
*/
app.delete('/api/candidate/:id', (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({
      message: 'Candidate deleted successfully',
      changes: this.changes // Verifies whether any rows were changed.
    });
  });
});

// DELETE a given party
app.delete('/api/party/:id', (req, res) => {
  const sql = `DELETE FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({ message: 'successfully deleted', changes: this.changes });
  });
});


// CREATE a candidate
app.post('/api/candidate', ({ body }, res) => {
  const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql =
    `INSERT INTO candidates (first_name, last_name, industry_connected) 
  VALUES (?,?,?)`;
  const params = [body.first_name, body.last_name, body.industry_connected];
  // ES5 function, not arrow function, to use `this`
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'Candidate created successfully!',
      data: body,
      id: this.lastID
    });
  });

});











// "CATCHALL ROUTE" >> DEFAULT RESPONSE FOR ANY OTHER REQUEST (i.e. NOT FOUND)
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