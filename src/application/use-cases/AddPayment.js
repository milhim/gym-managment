class AddPayment {
    constructor(memberRepository, membershipService) {
        this.memberRepository = memberRepository;
        this.membershipService = membershipService;
    }

    async execute(memberId, amount) {
        const member = await this.memberRepository.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        // Validate payment amount
        await this.membershipService.validatePaymentAmount(memberId, amount);

        // Add payment to member
        member.addPayment(amount);

        // Save updated member
        return await this.memberRepository.save(member);
    }
}

module.exports = AddPayment; 