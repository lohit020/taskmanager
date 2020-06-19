require('./db/mongoose');
const userRouter = require('./routers/user-router')
const tasksRouter = require('./routers/tasks-router')
const express = require('express');
const path = require('path');

const app = express();

const staticPath = path.join(__dirname, './public')

const port = process.env.PORT;

app.use(express.static(staticPath));
app.use(express.json())
app.use(userRouter, tasksRouter)

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});

