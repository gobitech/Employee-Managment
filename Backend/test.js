const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
    res.send('Test server is working!');
});

app.listen(PORT, () => {
    console.log(`✅ Test server is running and listening on port ${PORT}`);
});