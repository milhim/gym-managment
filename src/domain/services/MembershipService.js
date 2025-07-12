const Payment = require('../entities/Payment');

class MembershipService {
    constructor(memberRepository) {
        this.memberRepository = memberRepository;
    }

    async validateMemberData(memberData) {
        const { name, phoneNumber, paidAmount, totalMembership } = memberData;

        // Validate name
        if (!name || name.trim().length < 3) {
            throw new Error('Name must be at least 3 characters long');
        }

        // Validate phone number
        if (!phoneNumber || phoneNumber.trim().length < 10) {
            throw new Error('Phone number must be at least 10 digits');
        }

        // Check if phone already exists
        const existingMember = await this.memberRepository.findByPhone(phoneNumber);
        if (existingMember) {
            throw new Error('Member with this phone number already exists');
        }

        // Validate amounts
        const totalFee = totalMembership || 100000;
        const paid = paidAmount || 0;

        if (totalFee <= 0) {
            throw new Error('Total membership fee must be greater than 0');
        }

        if (paid < 0) {
            throw new Error('Paid amount cannot be negative');
        }

        if (paid > totalFee) {
            throw new Error('Paid amount cannot exceed total membership fee');
        }

        return true;
    }

    async validatePaymentAmount(memberId, amount) {
        if (!amount || amount <= 0) {
            throw new Error('Payment amount must be greater than 0');
        }

        const member = await this.memberRepository.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        if (amount > member.remainingAmount) {
            throw new Error('Payment amount exceeds remaining membership fee');
        }

        return true;
    }

    async calculateMembershipStatistics() {
        const stats = await this.memberRepository.getStatistics();
        return {
            totalMembers: stats.totalMembers || 0,
            paidMembers: stats.paidMembers || 0,
            partiallyPaidMembers: stats.partiallyPaidMembers || 0,
            unpaidMembers: stats.unpaidMembers || 0,
            totalRevenue: stats.totalRevenue || 0,
            expectedRevenue: stats.expectedRevenue || 0,
            remainingAmount: stats.remainingAmount || 0
        };
    }

    createPayment(paymentData) {
        return new Payment({
            amount: paymentData.amount,
            date: paymentData.date || new Date(),
            method: paymentData.method,
            notes: paymentData.notes || ''
        });
    }
}

module.exports = MembershipService; 