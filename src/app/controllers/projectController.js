const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    res.send({ user: req.userId });
});
router.get('/:projectId', async (req, res) => {
    const { id } = req.params.projectId;
    res.send({ user: req.userId, id: id });
});
router.post('/', async (req, res) => {
    try {
        const project = await Project.create(req.body);
        return res.send({ project });
    } catch (err) {
        return res.send({ err });
    }
});
router.put('/:projectId', async (req, res) => {
    res.send({ user: req.userId });
});
router.delete('/:projectId', async (req, res) => {
    res.send({ user: req.userId });
});


module.exports = (app) => app.use('/projects', router);