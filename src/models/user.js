/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/* jshint -W097 */
/* jshint -W117 */
'use strict';

const Task = require('../models/task');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email!!');
            }
        }
    },
    password: {
        required: true,
        type: String,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Passwords should not contain "password"');
            }
        }
    },
    age: {
        default: 0,
        type: Number,
        validate(value) {
            if (value < 0) throw new Error('age must be a positive number');
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer //https://jsbin.com/?html,output
        //no validation reqd. multer handles that.
    }
}, {
    timestamps: true
});

/**The code below adds a tasks field onto users that can be used to fetch the tasks for a given user.
 * It’s a VIRTUAL PROPERTY because users in the database won’t have a tasks field. 
 * It’s a reference to the task data stored in the separate collection.
 */
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

//Hashing the modified/updated password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {

        user.password = await bcrypt.hash(user.password, 8);
        console.log("Middleware accessed for password hashing.");
    }
    next();
});

//Login middleware
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email
    });
    if (!user) {
        //throw new Error('Unable to login'); //recommended
        throw new Error('user not found!!');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        //throw new Error('Unable to login'); //recommended
        throw new Error('Wrong Password');
    }
    return user;
};

//generating authorization token
userSchema.methods.genAuthToken = async function () {
    const user = this;
    const token = jwt.sign({
        _id: user._id.toString()
    }, process.env.JWT_SECRET);
    //console.log(token);
    user.tokens = user.tokens.concat({
        token
    });

    //saving token into the database
    await user.save();
    
    return token;
};

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

//delete all task when a user is deleted
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({
        owner: user._id
    });
    next();
});

const User = mongoose.model('User', userSchema);


module.exports = User;


// const me = new User({
//     name: '    Shubham     ',
//     email: '         Verma4513@gmail.com  ',
//     age: 25,
//     password: '125xcvdsd'
// });
// me.save().then(() => {
//     console.log(me);
// }).catch((error) => {
//     console.log('Error!', error);
// });