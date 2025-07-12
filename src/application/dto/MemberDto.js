class MemberDto {
    static fromDomain(member) {
        return {
            id: member.id,
            name: member.name,
            phoneNumber: member.phoneNumber,
            joinDate: member.joinDate,
            paidAmount: member.paidAmount,
            totalMembership: member.totalMembership,
            lastPaymentDate: member.lastPaymentDate,
            remainingAmount: member.remainingAmount,
            isFullyPaid: member.isFullyPaid,
            paymentPercentage: member.paymentPercentage,
            membershipStatus: member.membershipStatus,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt
        };
    }

    static toDomain(dto) {
        return {
            id: dto.id,
            name: dto.name,
            phoneNumber: dto.phoneNumber,
            joinDate: dto.joinDate,
            paidAmount: dto.paidAmount,
            totalMembership: dto.totalMembership,
            lastPaymentDate: dto.lastPaymentDate,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt
        };
    }
}

class PaymentDto {
    static fromDomain(payment) {
        return {
            id: payment.id,
            amount: payment.amount,
            date: payment.date,
            method: payment.method,
            notes: payment.notes,
            createdAt: payment.createdAt
        };
    }

    static toDomain(dto) {
        return {
            id: dto.id,
            amount: dto.amount,
            date: dto.date,
            method: dto.method,
            notes: dto.notes,
            createdAt: dto.createdAt
        };
    }
}

module.exports = { MemberDto, PaymentDto }; 