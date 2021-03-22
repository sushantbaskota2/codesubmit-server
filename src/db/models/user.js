const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        instructor: {
            type: Boolean,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Not a valid email');
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (value.length <= 6) {
                    throw new Error('Password weak');
                }
            }
        },
        courses: [
            {
                type: mongoose.SchemaTypes.ObjectId
            }
        ],
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    { timestamps: true }
);

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

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
};

//Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    console.log('just before saving');
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
