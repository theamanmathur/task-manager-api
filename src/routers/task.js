/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/*jshint esversion: 9 */ //for spread operator
/* jshint -W097 */
/* jshint -W117 */
'use strict';

const express = require('express');
const Task = require('../models/task');
const router = new express.Router();
const auth = require('../middleware/auth');
module.exports = router;

//get all tasks
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort ={};
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        //res.send(await Task.find({owner:req.user._id}));

        //populating virtual property
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
                // : {
                    //ascending=1, descending=-1
                    //createdAt:-1
                //     completed: 
                // }
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

//find task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }

});

//create task
router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body); //obsolete
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

//update task
router.patch('/tasks/:id', auth, async (req, res) => {
    //console.log(req.body);
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates'
        });
    }
    try {

        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        //const task = await Task.findByIdAndUpdate(req.params.id);

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators: true});

        if (!task) {
            return res.status(404).send();
        }
        updates.forEach((update) => task[update] = req.body[update]);

        task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

//delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(400).send();
    }
});