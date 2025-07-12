class Member {
    constructor({
        id,
        name,
        phoneNumber,
        joinDate,
        paidAmount,
        totalMembership,
        lastPaymentDate,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.joinDate = joinDate;
        this.paidAmount = paidAmount || 0;
        this.totalMembership = totalMembership || 100000;
        this.lastPaymentDate = lastPaymentDate;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    get remainingAmount() {
        return this.totalMembership - this.paidAmount;
    }

    get isFullyPaid() {
        return this.remainingAmount <= 0;
    }

    get paymentPercentage() {
        if (this.totalMembership === 0) return 0;
        return (this.paidAmount / this.totalMembership) * 100;
    }

    get membershipStatus() {
        if (this.isFullyPaid) return 'paid';
        if (this.paidAmount === 0) return 'unpaid';
        return 'partial';
    }

    addPayment(amount) {
        this.paidAmount += amount;
        this.lastPaymentDate = new Date();
        this.updatedAt = new Date();
    }

    updateInfo(data) {
        if (data.name) this.name = data.name;
        if (data.phoneNumber) this.phoneNumber = data.phoneNumber;
        if (data.joinDate) this.joinDate = data.joinDate;
        if (data.paidAmount !== undefined) this.paidAmount = data.paidAmount;
        if (data.totalMembership !== undefined) this.totalMembership = data.totalMembership;
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            phoneNumber: this.phoneNumber,
            joinDate: this.joinDate,
            paidAmount: this.paidAmount,
            totalMembership: this.totalMembership,
            lastPaymentDate: this.lastPaymentDate,
            remainingAmount: this.remainingAmount,
            isFullyPaid: this.isFullyPaid,
            paymentPercentage: this.paymentPercentage,
            membershipStatus: this.membershipStatus,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Member; 