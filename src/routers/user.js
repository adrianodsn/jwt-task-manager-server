const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const { auth, newToken } = require('../middleware/auth');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account');
const { cookieParams } = require('../globals/globals');
const router = new express.Router();

// ------------------------------------------------------------------------

router.get('/checkConnection', auth, async (req, res) => {
    res.status(200).send();
});

// ------------------------------------------------------------------------

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const { token, refreshToken } = await user.generateAuthToken();
        res.cookie('RefreshToken', refreshToken, cookieParams);
        res.status(201).send({ user, token, refreshToken });
    } catch (e) {
        res.status(400).send(e);
    }
});

// ------------------------------------------------------------------------

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|jpg)$/)) {
            return cb(new Error('Please upload an image'));
        }

        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    req.user.save();
    res.send();
});

// ------------------------------------------------------------------------

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const { token, refreshToken, csrfToken } = await user.generateAuthToken();
        res.cookie('RefreshToken', refreshToken, cookieParams);
        res.send({ user, token, refreshToken, csrfToken });
    } catch (e) {
        res.status(400).send();
    }
});

// ------------------------------------------------------------------------

router.post('/users/refreshToken', newToken, async (req, res) => {
    try {
        res.cookie('RefreshToken', req.refreshToken, cookieParams);
        res.send({
            token: req.token,
            refreshToken: req.refreshToken,
            csrfToken: req.csrfToken,
        });
    } catch (e) {
        res.status(500).send();
    }
});

// ------------------------------------------------------------------------

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// ------------------------------------------------------------------------

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({
            'error': 'Invalid updates!'
        });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

// ------------------------------------------------------------------------

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
        sendGoodbyeEmail(req.user.email, req.user.name);
    } catch (e) {
        res.status(500).send();
    }
});

// ------------------------------------------------------------------------

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

// ------------------------------------------------------------------------

module.exports = router;