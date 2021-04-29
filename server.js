const express = require('express');

const app = express();

app.use(express.json({extended: false, limit: '50mb'}));

// Routes
app.use("/api/emails", require('./routes/api/emails'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));