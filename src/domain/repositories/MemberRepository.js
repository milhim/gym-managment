class MemberRepository {
    async save(member) {
        throw new Error('Method not implemented');
    }

    async findById(id) {
        throw new Error('Method not implemented');
    }

    async findByPhone(phone) {
        throw new Error('Method not implemented');
    }

    async findAll(filters = {}, page = 1, limit = 10) {
        throw new Error('Method not implemented');
    }

    async delete(id) {
        throw new Error('Method not implemented');
    }

    async count(filters = {}) {
        throw new Error('Method not implemented');
    }

    async getStatistics() {
        throw new Error('Method not implemented');
    }
}

module.exports = MemberRepository; 