class DeleteMember {
    constructor(memberRepository) {
        this.memberRepository = memberRepository;
    }

    async execute(memberId) {
        const member = await this.memberRepository.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        // You could add business rules here, like:
        // - Only allow deletion if member has no pending payments
        // - Require confirmation for members with payment history
        // - Archive instead of delete

        return await this.memberRepository.delete(memberId);
    }
}

module.exports = DeleteMember; 