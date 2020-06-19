const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { versionKey: false, timestamps: true })

tasksSchema.methods.toJSON = function () {
    taskDetails = this;
    taskDetailsObj = taskDetails.toObject();
    // delete taskDetailsObj.owner
    return taskDetailsObj;
}

tasksSchema.statics.objectId = (id) => mongoose.Types.ObjectId(id.trim())

const Task = mongoose.model('Task', tasksSchema);

module.exports = { Task };