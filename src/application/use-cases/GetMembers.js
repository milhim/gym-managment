class GetMembers {
    constructor(memberRepository) {
        this.memberRepository = memberRepository;
    }

    async execute(filters = {}, page = 1, limit = 10) {
        const members = await this.memberRepository.findAll(filters, page, limit);
        const totalCount = await this.memberRepository.count(filters);

        return {
            members,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page < Math.ceil(totalCount / limit),
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