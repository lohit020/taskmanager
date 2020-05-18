const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const authToken = req.header('Authorization').replace('Bearer ', '');
        const decodeId = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
        const userDetails = await User.findOne({ _id: decodeId._id, 'tokens.token': authToken })
        if (!userDetails) {            
            throw new Error('unauthorized user');
        }
        req.user = userDetails;
        req.token = authToken;
        next();
    } catch (e) {
        res.status(401).send(e.message)
    }
}

const adminAuth = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        res.status(401).send('Not authorized to perform this action');
        return 0;
    }
    next();
}

module.exports = { auth, adminAuth };