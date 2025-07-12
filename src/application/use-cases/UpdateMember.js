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
        if (updateData.name && updateData.name.trim().length < 3) {
            throw new Error('Name must be at least 3 characters long');
        }

        // Validate amounts if provided
        if (updateData.totalMembership !== undefined && updateData.totalMembership <= 0) {
            throw new Error('Total membership fee must be greater than 0');
        }

        if (updateData.paidAmount !== undefined) {
            if (updateData.paidAmount < 0) {
                throw new Error('Paid amount cannot be negative');
            }

            const totalFee = updateData.totalMembership || member.totalMembership;
            if (updateData.paidAmount > totalFee) {
                throw new Error('Paid amount cannot exceed total membership fee');
            }
        }

        // Update member
        member.updateInfo(updateData);

        // Save updated member
        return await this.memberRepository.save(member);
    }
}

module.exports = UpdateMember; 