const { MemberDto } = require('../../application/dto/MemberDto');

class MemberController {
    constructor(createMember, updateMember, getMembers, deleteMember) {
        this.createMember = createMember;
        this.updateMember = updateMember;
        this.getMembers = getMembers;
        this.deleteMember = deleteMember;
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
            const { page, limit, search, joinDateFrom, joinDateTo } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (joinDateFrom) filters.joinDateFrom = joinDateFrom;
            if (joinDateTo) filters.joinDateTo = joinDateTo;

            const result = await this.getMembers.execute(filters, page, limit);

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
            const member = await this.getMembers.getById(id);

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
}

module.exports = MemberController; 