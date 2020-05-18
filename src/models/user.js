const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Task } = require('../models/tasks');
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    emailID: {
        type: String,
        unique: true,
        required: true,
        lowercaseL: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: String,
        lowercase: true,
        trim: true
    },
    tokens: [{
        token: {
            type: String
        },
    }],
    activeSessions: {
        type: Number,
        max: 5
    },
    avatar: {
        type: Buffer
    }
}, { versionKey: false });

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (userName, password) => {
    const userValidity = await User.findOne({ userName });
    if (!userValidity) {
        throw new Error('user name doesn\'t exist');
    }
    const userPassword = await User.findOne({ userName });

    const passwordCompare = await bcrypt.compare(password, userPassword.password);
    if (passwordCompare) {
        return userValidity;
    } else {
        throw new Error('invalid user');
    }
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY, { expiresIn: '1 day' });
    user.tokens = user.tokens.concat({ token })
    user.activeSessions = user.tokens.length;
    await user.save()
    return token;
};

userSchema.methods.toJSON = function () {
    const userDetails = this;
    const userDetailsObj = userDetails.toObject();
    delete userDetailsObj.password;
    delete userDetailsObj.tokens;
    delete userDetailsObj.avatar;
    return userDetailsObj;
}

userSchema.pre('save', async function (next) {
    const userInfo = this;
    if (userInfo.isModified('password')) {
        userInfo.password = await bcrypt.hash(userInfo.password, 8)
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const userInfo = this;
    await Task.deleteMany({ owner: userInfo._id })
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = { User };