class GetMembers {
    constructor(memberRepository) {
        this.memberRepository = memberRepository;
    }

    async execute(filters = {}, page = 1, limit = 10) {
        const result = await this.memberRepository.findAll(filters, page, limit);

        return {
            members: result.members,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                hasNext: page < result.totalPages,
                hasPrev: page > 1
            }
        };
    }

    async getById(id) {
        const member = await this.memberRepository.findById(id);
        if (!member) {
            throw new Error('Member not found');
        }
        return member;
    }
}

module.exports = GetMembers; 