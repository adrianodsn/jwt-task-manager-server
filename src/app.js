const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(cookieParser()); 

app.use(userRouter);
app.use(taskRouter);

app.get('/prepare', (req, res) => {
    try {
        console.log(require('./globals/globals').generateCSRFToken());
        res.send();
    }
    catch (e) {
        res.status(500).send();
    }
});

module.exports = app;







