const express = require('express');
const { User } = require('../models/user');
const { auth, adminAuth } = require('../middleware/authentication');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail } = require('../emails/account');

const userRouter = new express.Router();

const upload = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true);
    }
});


userRouter.post('/signup', async (req, res) => {
    req.body.role = 'user'
    const user = new User(req.body);
    try {
        const userDetails = await user.save();
        const userSessionToken = await user.generateAuthToken();
        // await sendWelcomeEmail(userDetails.emailID, userDetails.userName)
        res.send({ user: userDetails, userSessionToken });
    } catch (e) {
        res.status(406).send(e.message)
    }
});

userRouter.post('/add-avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send('avatar uploaded');
}, (error, req, res, next) => {
    res.status(401).send(error.message)
})

userRouter.get('/avatar', auth, async (req, res) => {
    try {
        const user = req.user
        if (!user || !user.avatar) {
            throw new Error('No avatar')
        }

        res.set('Content-Type', 'image/png')

        res.send(user.avatar)

    } catch (error) {
        res.status(401).send(error.message)
    }
})


userRouter.delete('/delete-avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send('avatar deleted');
}, (error, req, res, next) => {
    res.status(401).send(error.message)
})

userRouter.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.userName, req.body.password);
        const userSessionToken = await user.generateAuthToken();
        res.send({ user, userSessionToken });
    } catch (error) {
        res.status('401').send(error.message)
    }
});

userRouter.get('/authenticate', auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (error) {
        res.status('401').send(error.message)
    }
});

userRouter.get('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(tokenDetail => tokenDetail.token !== req.token)
        req.user.activeSessions = req.user.tokens.length;
        req.user.save()
        res.send('successfully log out')
    } catch {
        res.status(501).send('invalid session');
    }
})

userRouter.get('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        req.user.activeSessions = 0;
        req.user.save();
        res.send('successfully log out from all session')
    } catch {
        res.status(501).send('invalid session');
    }
})

userRouter.patch('/edit-user', auth, async (req, res) => {
    try {
        const userDetails = await User.findOneAndUpdate({ userName: req.user.userName }, { $set: req.body });
        if (!userDetails) {
            throw new Error('Unable to insert User');
        }
        await userDetails.save();
        res.status(200).send('successfully modified')
    } catch (e) {
        res.status(406).send(e.toString())
    }
});

userRouter.get("/profile", auth, async (req, res) => {
    try {
        const userDetails = await User.findOne({ userName: req.user.userName })
        res.send(userDetails);
    } catch (e) {
        res.status(401).send(e.message);
    }
});

userRouter.get("/users", auth, adminAuth, async (req, res) => {
    try {
        const usersDetail = await User.find(req.query)
        res.send(usersDetail)
    } catch{
        res.status(400).send('invalid inputs')
    }
});

userRouter.delete("/delete-profile", auth, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            throw new Error('can not delete profile')
        }
        await req.user.remove();
        res.send('profile removed successfully')
    } catch (e) {
        res.status(400).send(e.toString())
    }
});

userRouter.get("/end-points", (req, res) => {
    const routes = userRouter.stack.map(function (r) {
        if (r.route && r.route.path) {
            return { path: r.route.path, method: r.route.methods };
        }
    })
    res.send(routes);
})


module.exports = userRouter; 