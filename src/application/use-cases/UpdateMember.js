class UpdateMember {
    constructor(memberRepository, membershipService) {
        this.memberRepository = memberRepository;
        this.membershipService = membershipService;
    }

    async execute(memberId, updateData) {
        const member = await this.memberRepository.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        // Validate phone number if it's being changed
        if (updateData.phoneNumber && updateData.phoneNumber !== member.phoneNumber) {
            const existingMember = await this.memberRepository.findByPhone(updateData.phoneNumber);
            if (existingMember) {
                throw new Error('Member with this phone number already exists');
            }
        }

        // Validate name if provided
        if (updateData.name && updateData.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        // Validate paid amount if provided
        if (updateData.paidAmount !== undefined && updateData.paidAmount < 0) {
            throw new Error('Paid amount cannot be negative');
        }

        // Update member
        member.updateInfo(updateData);

        // Save updated member
        return await this.memberRepository.save(member);
    }
}

module.exports = UpdateMember; 