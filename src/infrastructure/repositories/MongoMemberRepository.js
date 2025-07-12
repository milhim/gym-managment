const MemberRepository = require('../../domain/repositories/MemberRepository');
const Member = require('../../domain/entities/Member');
const MemberModel = require('../database/schemas/MemberSchema');

class MongoMemberRepository extends MemberRepository {
    async save(member) {
        try {
            let memberDoc;

            if (member.id) {
                // Update existing member
                memberDoc = await MemberModel.findByIdAndUpdate(
                    member.id,
                    {
                        name: member.name,
                        phoneNumber: member.phoneNumber,
                        joinDate: member.joinDate,
                        paidAmount: member.paidAmount,
                        totalMembership: member.totalMembership,
                        lastPaymentDate: member.lastPaymentDate,
                        updatedAt: new Date()
                    },
                    { new: true, runValidators: true }
                );
            } else {
                // Create new member
                memberDoc = new MemberModel({
                    name: member.name,
                    phoneNumber: member.phoneNumber,
                    joinDate: member.joinDate,
                    paidAmount: member.paidAmount,
                    totalMembership: member.totalMembership,
                    lastPaymentDate: member.lastPaymentDate
                });
                await memberDoc.save();
            }

            return this.toDomain(memberDoc);
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('Member with this phone number already exists');
            }
            throw error;
        }
    }

    async findById(id) {
        try {
            const memberDoc = await MemberModel.findById(id);
            return memberDoc ? this.toDomain(memberDoc) : null;
        } catch (error) {
            throw error;
        }
    }

    async findByPhone(phoneNumber) {
        try {
            const memberDoc = await MemberModel.findOne({ phoneNumber });
            return memberDoc ? this.toDomain(memberDoc) : null;
        } catch (error) {
            throw error;
        }
    }

    async findAll(filters = {}, page = 1, limit = 10) {
        try {
            const query = this.buildQuery(filters);
            const skip = (page - 1) * limit;

            const memberDocs = await MemberModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            return memberDocs.map(doc => this.toDomain(doc));
        } catch (error) {
            throw error;
        }
    }

    async count(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            return await MemberModel.countDocuments(query);
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await MemberModel.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            throw error;
        }
    }

    async getStatistics() {
        try {
            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalMembers: { $sum: 1 },
                        totalRevenue: { $sum: '$paidAmount' },
                        expectedRevenue: { $sum: '$totalMembership' },
                        paidMembers: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$paidAmount', '$totalMembership'] },
                                    1,
                                    0
                                ]
                            }
                        },
                        unpaidMembers: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$paidAmount', 0] },
                                    1,
                                    0
                                ]
                            }
                        },
                        partiallyPaidMembers: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gt: ['$paidAmount', 0] },
                                            { $lt: ['$paidAmount', '$totalMembership'] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ];

            const result = await MemberModel.aggregate(pipeline);
            const stats = result[0] || {
                totalMembers: 0,
                totalRevenue: 0,
                expectedRevenue: 0,
                paidMembers: 0,
                unpaidMembers: 0,
                partiallyPaidMembers: 0
            };

            stats.remainingAmount = stats.expectedRevenue - stats.totalRevenue;

            return stats;
        } catch (error) {
            throw error;
        }
    }

    buildQuery(filters) {
        const query = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { phoneNumber: { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.status) {
            if (filters.status === 'paid') {
                query.$expr = { $gte: ['$paidAmount', '$totalMembership'] };
            } else if (filters.status === 'unpaid') {
                query.paidAmount = 0;
            } else if (filters.status === 'partial') {
                query.$and = [
                    { paidAmount: { $gt: 0 } },
                    { $expr: { $lt: ['$paidAmount', '$totalMembership'] } }
                ];
            }
        }

        if (filters.joinDateFrom) {
            query.joinDate = {
                ...query.joinDate,
                $gte: new Date(filters.joinDateFrom)
            };
        }

        if (filters.joinDateTo) {
            query.joinDate = {
                ...query.joinDate,
                $lte: new Date(filters.joinDateTo)
            };
        }

        return query;
    }

    toDomain(memberDoc) {
        return new Member({
            id: memberDoc._id.toString(),
            name: memberDoc.name,
            phoneNumber: memberDoc.phoneNumber,
            joinDate: memberDoc.joinDate,
            paidAmount: memberDoc.paidAmount,
            totalMembership: memberDoc.totalMembership,
            lastPaymentDate: memberDoc.lastPaymentDate,
            createdAt: memberDoc.createdAt,
            updatedAt: memberDoc.updatedAt
        });
    }
}

module.exports = MongoMemberRepository; 