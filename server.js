const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());







// // TEST GET ROUTE
// app.get('/', (req, res) => {
//   res.json({
//     message: "I'll be your huckleberry"
//   });
// });


// DEFAULT RESPONSE FOR ANY OTHER REQUEST (NOT FOUND CATCH-ALL)
app.use((req, res) => {
  res.status(404).end();
});


app.listen(PORT, () => {
  console.log(`Server is locked 'n' loaded on port ${PORT}`);
});