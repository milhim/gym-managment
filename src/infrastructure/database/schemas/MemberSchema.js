const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 10,
        maxlength: 20
    },
    joinDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    paidAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    totalMembership: {
        type: Number,
        required: true,
        min: 0,
        default: 100000
    },
    lastPaymentDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Virtual for remaining amount
MemberSchema.virtual('remainingAmount').get(function () {
    return this.totalMembership - this.paidAmount;
});

// Virtual for full payment status
MemberSchema.virtual('isFullyPaid').get(function () {
    return this.remainingAmount <= 0;
});

// Virtual for payment percentage
MemberSchema.virtual('paymentPercentage').get(function () {
    if (this.totalMembership === 0) return 0;
    return (this.paidAmount / this.totalMembership) * 100;
});

// Virtual for membership status
MemberSchema.virtual('membershipStatus').get(function () {
    if (this.isFullyPaid) return 'paid';
    if (this.paidAmount === 0) return 'unpaid';
    return 'partial';
});

// Include virtuals in JSON
MemberSchema.set('toJSON', { virtuals: true });
MemberSchema.set('toObject', { virtuals: true });

// Indexes for better performance
MemberSchema.index({ phoneNumber: 1 });
MemberSchema.index({ name: 1 });
MemberSchema.index({ joinDate: 1 });
MemberSchema.index({ createdAt: -1 });
MemberSchema.index({ paidAmount: 1 });

module.exports = mongoose.model('Member', MemberSchema); 