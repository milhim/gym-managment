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
                        paidAmount: member.paidAmount
                    },
                    { new: true, runValidators: true }
                );
            } else {
                // Create new member
                memberDoc = new MemberModel({
                    name: member.name,
                    phoneNumber: member.phoneNumber,
                    joinDate: member.joinDate,
                    paidAmount: member.paidAmount
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

    async findAll(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { phoneNumber: { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.joinDateFrom || filters.joinDateTo) {
            query.joinDate = {};
            if (filters.joinDateFrom) {
                query.joinDate.$gte = new Date(filters.joinDateFrom);
            }
            if (filters.joinDateTo) {
                query.joinDate.$lte = new Date(filters.joinDateTo);
            }
        }

        const [members, totalCount] = await Promise.all([
            MemberModel.find(query).skip(skip).limit(limit).sort({ joinDate: -1 }),
            MemberModel.countDocuments(query)
        ]);

        return {
            members: members.map(member => this.toDomain(member)),
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        };
    }

    async findById(id) {
        const member = await MemberModel.findById(id);
        return member ? this.toDomain(member) : null;
    }

    async findByPhone(phoneNumber) {
        const member = await MemberModel.findOne({ phoneNumber });
        return member ? this.toDomain(member) : null;
    }

    async delete(id) {
        const result = await MemberModel.findByIdAndDelete(id);
        return result !== null;
    }

    toDomain(memberDoc) {
        return new Member({
            id: memberDoc._id.toString(),
            name: memberDoc.name,
            phoneNumber: memberDoc.phoneNumber,
            joinDate: memberDoc.joinDate,
            paidAmount: memberDoc.paidAmount
        });
    }
}

module.exports = MongoMemberRepository; 