const Member = require('../../domain/entities/Member');

class CreateMember {
    constructor(memberRepository, membershipService) {
        this.memberRepository = memberRepository;
        this.membershipService = membershipService;
    }

    async execute(memberData) {
        // Validate member data
        await this.membershipService.validateMemberData(memberData);

        // Create member entity
        const member = new Member({
            name: memberData.name.trim(),
            phoneNumber: memberData.phoneNumber.trim(),
            joinDate: new Date(memberData.joinDate),
            paidAmount: memberData.paidAmount,
            totalMembership: 100000, // Default value since it's not provided in the simple schema
            lastPaymentDate: memberData.paidAmount > 0 ? new Date() : null
        });

        // Save member
        return await this.memberRepository.save(member);
    }
}

module.exports = CreateMember; 