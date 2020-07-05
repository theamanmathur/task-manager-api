/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/* jshint -W097 */
/* jshint -W117 */
'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    console.log("Initializing Authorization..."); //debug
    try {
        //const rtoken = req.header('Authorization');
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token
        });

        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        console.log("Authorization successful!!");
        next();

    } catch (e) {
        res.status(401).send({
            error: 'authentication failed'
        });
        console.log("⚠️  " + e + " --Authorization failed");
    }
};

module.exports = auth;