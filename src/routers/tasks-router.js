const express = require('express')
const { Task } = require('../models/tasks')
const { auth } = require('../middleware/authentication')

const tasksRouter = new express.Router();

tasksRouter.post('/add-tasks', auth, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id })
    try {
        await task.save()
        res.send(task);
    } catch (error) {
        res.status(401).send('title already taken');
    }
})

tasksRouter.get('/tasks', auth, async (req, res) => {
    match = {
        ...req.query
    }
    sort = {};

    delete match.limit
    delete match.skip
    delete match.sortBy

    if (req.query.sortBy) {
        const part = req.query.sortBy.split(':');
        sort[part[0]] = part[1] === 'asc' ? 1 : -1
    }


    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(401).send(error.toString());
    }
})

tasksRouter.delete('/delete-task/:id', auth, async (req, res) => {
    try {
        await Task.findOneAndRemove({ _id: Task.objectId(req.params.id), owner: req.user._id });
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(401).send(error.toString());
    }
})

tasksRouter.patch('/edit-tasks/:id', auth, async (req, res) => {
    try {
        const taskDetail = await Task.findOneAndUpdate({ _id: Task.objectId(req.params.id), owner: req.user._id }, { $set: req.body })
        if (!taskDetail) {
            throw new Error('can not find the task')
        }
        await taskDetail.save()
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(401).send(error.toString());
    }
})


module.exports = tasksRouter      