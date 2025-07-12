const { MemberDto } = require('../../application/dto/MemberDto');

class MemberController {
    constructor(createMember, updateMember, getMember, addPayment, deleteMember, getStatistics) {
        this.createMember = createMember;
        this.updateMember = updateMember;
        this.getMember = getMember;
        this.addPayment = addPayment;
        this.deleteMember = deleteMember;
        this.getStatistics = getStatistics;
    }

    async create(req, res) {
        try {
            const member = await this.createMember.execute(req.body);

            res.status(201).json({
                success: true,
                message: 'Member created successfully',
                data: MemberDto.fromDomain(member)
            });
        } catch (error) {
            console.error('Create member error:', error);

            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const { page, limit, search, status, joinDateFrom, joinDateTo } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (status) filters.status = status;
            if (joinDateFrom) filters.joinDateFrom = joinDateFrom;
            if (joinDateTo) filters.joinDateTo = joinDateTo;

            const result = await this.getMember.execute(filters, page, limit);

            res.json({
                success: true,
                data: result.members.map(member => MemberDto.fromDomain(member)),
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get members error:', error);

            res.status(500).json({
                success: false,
                error: 'Failed to retrieve members'
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const member = await this.getMember.getById(id);

            res.json({
                success: true,
                data: MemberDto.fromDomain(member)
            });
        } catch (error) {
            console.error('Get member by ID error:', error);

            if (error.message === 'Member not found') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to retrieve member'
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const member = await this.updateMember.execute(id, req.body);

            res.json({
                success: true,
                message: 'Member updated successfully',
                data: MemberDto.fromDomain(member)
            });
        } catch (error) {
            console.error('Update member error:', error);

            if (error.message === 'Member not found') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.deleteMember.execute(id);

            res.json({
                success: true,
                message: 'Member deleted successfully'
            });
        } catch (error) {
            console.error('Delete member error:', error);

            if (error.message === 'Member not found') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to delete member'
            });
        }
    }

    async addPayment(req, res) {
        try {
            const { id } = req.params;
            const { amount } = req.body;
            const member = await this.addPayment.execute(id, amount);

            res.json({
                success: true,
                message: 'Payment added successfully',
                data: MemberDto.fromDomain(member)
            });
        } catch (error) {
            console.error('Add payment error:', error);

            if (error.message === 'Member not found') {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async getStatistics(req, res) {
        try {
            const statistics = await this.getStatistics.execute();

            res.json({
                success: true,
                data: statistics
            });
        } catch (error) {
            console.error('Get statistics error:', error);

            res.status(500).json({
                success: false,
                error: 'Failed to retrieve statistics'
            });
        }
    }
}

module.exports = MemberController; 