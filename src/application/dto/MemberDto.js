class MemberDto {
    static fromDomain(member) {
        return {
            id: member.id,
            name: member.name,
            phoneNumber: member.phoneNumber,
            joinDate: member.joinDate,
            paidAmount: member.paidAmount
        };
    }

    static toDomain(dto) {
        return {
            id: dto.id,
            name: dto.name,
            phoneNumber: dto.phoneNumber,
            joinDate: dto.joinDate,
            paidAmount: dto.paidAmount
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