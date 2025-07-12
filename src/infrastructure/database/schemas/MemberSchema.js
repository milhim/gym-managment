const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 8,
        maxlength: 20
    },
    joinDate: {
        type: Date,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = mongoose.model('Member', MemberSchema); 