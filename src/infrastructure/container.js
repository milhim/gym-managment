// Dependencies
const MongoMemberRepository = require('./repositories/MongoMemberRepository');
const MembershipService = require('../domain/services/MembershipService');

// Use Cases
const CreateMember = require('../application/use-cases/CreateMember');
const UpdateMember = require('../application/use-cases/UpdateMember');
const GetMembers = require('../application/use-cases/GetMembers');
const DeleteMember = require('../application/use-cases/DeleteMember');

// Controllers
const MemberController = require('../presentation/controllers/MemberController');

class Container {
    constructor() {
        this._repositories = {};
        this._services = {};
        this._useCases = {};
        this._controllers = {};
    }

    getRepositories() {
        if (!this._repositories.memberRepository) {
            this._repositories.memberRepository = new MongoMemberRepository();
        }
        return this._repositories;
    }

    getServices() {
        if (!this._services.membershipService) {
            this._services.membershipService = new MembershipService(
                this.getRepositories().memberRepository
            );
        }
        return this._services;
    }

    getUseCases() {
        if (!this._useCases.createMember) {
            const repositories = this.getRepositories();
            const services = this.getServices();

            this._useCases.createMember = new CreateMember(
                repositories.memberRepository,
                services.membershipService
            );
            this._useCases.updateMember = new UpdateMember(
                repositories.memberRepository,
                services.membershipService
            );
            this._useCases.getMembers = new GetMembers(
                repositories.memberRepository
            );
            this._useCases.deleteMember = new DeleteMember(
                repositories.memberRepository
            );
        }
        return this._useCases;
    }

    getControllers() {
        if (!this._controllers.memberController) {
            const useCases = this.getUseCases();

            this._controllers.memberController = new MemberController(
                useCases.createMember,
                useCases.updateMember,
                useCases.getMembers,
                useCases.deleteMember
            );
        }
        return this._controllers;
    }
}

module.exports = new Container(); 