/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/* jshint -W097 */
/* jshint -W117 */
'use strict';

const {sendWelcomeEmail,sendCancellationEmail:cancelMail}=require('../emails/account');
const sharp = require('sharp');
const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
module.exports = router;

//get all users using auth as middlware
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user); //req.user was set by auth module.
});

//create a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email,user.name);
        const token = await user.genAuthToken();
        res.status(201).send({
            user,
            token
        });
    } catch (e) {
        res.status(400).send(e+' --here>>user.js router');
    }
});

//login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.genAuthToken();
        res.send({
            user: user,
            token
        });
    } catch (e) {
        res.status(400).send(e.toString());
    }
});

//Logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send('logged out.');
    } catch (e) {
        res.status(500).send(e.toString());
    }
});

//Logout user of all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send('logged out of all sessions.');
    } catch (e) {
        res.status(500).send(e.toString());
    }
});


//Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    // "every" returns false even if one object fails to pass the test.
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update); //test
    });

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates'
        });
    }
    try {
        /**
         * goes through the middleware to hash the password if it is updated.
         * save() goes through the middleware.
         * directly using findbyidandupdate() to update, by passes the middleware.
         * middleware works only when password is modified.
         */

        //const user = await User.findByIdAndUpdate(req.user._id);
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}); //bypasses the middleware 

        // if (!user) {
        //     return res.send(404).send();
        // }
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

//Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {

        /*OBSOLETE
        const user = await User.findByIdAndDelete(req.user._id);

        if (!user) {
            return res.status(404).send();
        }*/

        await req.user.remove();
        cancelMail(req.user.email,req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

//

const upload = multer({
    limits: {
        fileSize: 1024000 //1MB
    },
    fileFilter(req, file, cb) {

        //https://regex101.com/
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Invalid File Format. Only jpg/jpeg/png accepted!!'));
        }
        cb(undefined, true);
        // cb(new Error('Invalid File Format.'));

        // cb(undefined,false);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (e, req, res, next) => {
    res.status(400).send(e.toString());
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png').send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

//  get a user by id
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     }
// });