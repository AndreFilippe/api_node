const mongoose = require('../../database');
const bcryp = require('bcryptjs');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    project: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        require: true
    }],
    completed: {
        type: Boolean,
        require: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;