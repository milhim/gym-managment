class GetStatistics {
    constructor(memberRepository, membershipService) {
        this.memberRepository = memberRepository;
        this.membershipService = membershipService;
    }

    async execute() {
        return await this.membershipService.calculateMembershipStatistics();
    }
}

module.exports = GetStatistics; 