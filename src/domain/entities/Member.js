class Member {
    constructor({
        id,
        name,
        phoneNumber,
        joinDate,
        paidAmount
    }) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.joinDate = joinDate;
        this.paidAmount = paidAmount;
    }

    updateInfo(data) {
        if (data.name) this.name = data.name;
        if (data.phoneNumber) this.phoneNumber = data.phoneNumber;
        if (data.joinDate) this.joinDate = data.joinDate;
        if (data.paidAmount !== undefined) this.paidAmount = data.paidAmount;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            phoneNumber: this.phoneNumber,
            joinDate: this.joinDate,
            paidAmount: this.paidAmount
        };
    }
}

module.exports = Member; 