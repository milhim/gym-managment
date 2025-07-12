class MembershipService {
    constructor(memberRepository) {
        this.memberRepository = memberRepository;
    }

    async validateMemberData(memberData) {
        const { name, phoneNumber, paidAmount } = memberData;

        // Validate name
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        // Validate phone number
        if (!phoneNumber || phoneNumber.trim().length < 8) {
            throw new Error('Phone number must be at least 8 characters');
        }

        // Check if phone already exists
        const existingMember = await this.memberRepository.findByPhone(phoneNumber);
        if (existingMember) {
            throw new Error('Member with this phone number already exists');
        }

        // Validate paid amount
        if (paidAmount < 0) {
            throw new Error('Paid amount cannot be negative');
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
        return {
            amount: paymentData.amount,
            date: paymentData.date || new Date(),
            method: paymentData.method || 'cash',
            notes: paymentData.notes || ''
        };
    }
}

module.exports = MembershipService; 