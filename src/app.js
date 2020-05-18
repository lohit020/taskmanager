require('./db/mongoose');
const userRouter = require('./routers/user-router')
const tasksRouter = require('./routers/tasks-router')
const express = require('express');

const app = express();

const port = process.env.PORT;

app.use(express.json())
app.use(userRouter, tasksRouter)

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});

