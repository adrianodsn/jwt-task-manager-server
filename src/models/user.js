const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const global = require('../globals/globals');

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
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw Error('Password cannoct include "password" substring');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw Error('Age must be a positive number');
            }
        }
    },
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true,
});

// ------------------------------------------------------------------------

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// ------------------------------------------------------------------------

userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const csrfToken = global.generateCSRFToken();

    const token = jwt.sign({
        _id: user._id.toString(),
        _type: 'access',
        _scrf: csrfToken,
    }, process.env.JWT_SECRET, {
        expiresIn: parseInt(process.env.JWT_TOKEN_LIFE_TIME)
    });

    const refreshToken = jwt.sign({
        _id: user._id.toString(),
        _type: 'refresh',
        _scrf: csrfToken,
    }, process.env.JWT_SECRET, {
        expiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_LIFE_TIME)
    });

    return { token, refreshToken, csrfToken };
}

// ------------------------------------------------------------------------

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.avatar;

    return userObject;
}

// ------------------------------------------------------------------------

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

// ------------------------------------------------------------------------

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// ------------------------------------------------------------------------

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

// ------------------------------------------------------------------------

const User = mongoose.model('User', userSchema);

module.exports = User;
