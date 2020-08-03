const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');



// GET all candidates
router.get('/candidates', (req, res) => {
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

// GET a single candidate
router.get('/candidate/:id', (req, res) => {
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

// UPDATE a given candidate's party_id
router.put('/candidate/:id', (req, res) => {
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

// CREATE a candidate
router.post('/candidate', ({ body }, res) => {
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

// DELETE a given candidate
/* 
- uses its own HTTP request method -- delete()
- as above, includes a route parameter to uniquely identify the candidate to remove. 
- done using a prepared SQL statement with a placeholder
*/
router.delete('/candidate/:id', (req, res) => {
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


module.exports = router;