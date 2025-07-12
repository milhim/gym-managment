// Dependencies
const MongoMemberRepository = require('./repositories/MongoMemberRepository');
const MembershipService = require('../domain/services/MembershipService');

// Use Cases
const CreateMember = require('../application/use-cases/CreateMember');
const UpdateMember = require('../application/use-cases/UpdateMember');
const GetMembers = require('../application/use-cases/GetMembers');
const AddPayment = require('../application/use-cases/AddPayment');
const DeleteMember = require('../application/use-cases/DeleteMember');
const GetStatistics = require('../application/use-cases/GetStatistics');

// Controllers
const MemberController = require('../presentation/controllers/MemberController');
const ExportController = require('../presentation/controllers/ExportController');

class Container {
    constructor() {
        this._repositories = {};
        this._services = {};
        this._useCases = {};
        this._controllers = {};
    }

    // Repositories
    getMemberRepository() {
        if (!this._repositories.memberRepository) {
            this._repositories.memberRepository = new MongoMemberRepository();
        }
        return this._repositories.memberRepository;
    }

    // Domain Services
    getMembershipService() {
        if (!this._services.membershipService) {
            this._services.membershipService = new MembershipService(
                this.getMemberRepository()
            );
        }
        return this._services.membershipService;
    }

    // Use Cases
    getCreateMemberUseCase() {
        if (!this._useCases.createMember) {
            this._useCases.createMember = new CreateMember(
                this.getMemberRepository(),
                this.getMembershipService()
            );
        }
        return this._useCases.createMember;
    }

    getUpdateMemberUseCase() {
        if (!this._useCases.updateMember) {
            this._useCases.updateMember = new UpdateMember(
                this.getMemberRepository(),
                this.getMembershipService()
            );
        }
        return this._useCases.updateMember;
    }

    getGetMembersUseCase() {
        if (!this._useCases.getMembers) {
            this._useCases.getMembers = new GetMembers(
                this.getMemberRepository()
            );
        }
        return this._useCases.getMembers;
    }

    getAddPaymentUseCase() {
        if (!this._useCases.addPayment) {
            this._useCases.addPayment = new AddPayment(
                this.getMemberRepository(),
                this.getMembershipService()
            );
        }
        return this._useCases.addPayment;
    }

    getDeleteMemberUseCase() {
        if (!this._useCases.deleteMember) {
            this._useCases.deleteMember = new DeleteMember(
                this.getMemberRepository()
            );
        }
        return this._useCases.deleteMember;
    }

    getGetStatisticsUseCase() {
        if (!this._useCases.getStatistics) {
            this._useCases.getStatistics = new GetStatistics(
                this.getMemberRepository(),
                this.getMembershipService()
            );
        }
        return this._useCases.getStatistics;
    }

    // Controllers
    getMemberController() {
        if (!this._controllers.memberController) {
            this._controllers.memberController = new MemberController(
                this.getCreateMemberUseCase(),
                this.getUpdateMemberUseCase(),
                this.getGetMembersUseCase(),
                this.getAddPaymentUseCase(),
                this.getDeleteMemberUseCase(),
                this.getGetStatisticsUseCase()
            );
        }
        return this._controllers.memberController;
    }

    getExportController() {
        if (!this._controllers.exportController) {
            this._controllers.exportController = new ExportController(
                this.getGetMembersUseCase(),
                this.getGetStatisticsUseCase()
            );
        }
        return this._controllers.exportController;
    }

    // Get all controllers
    getControllers() {
        return {
            memberController: this.getMemberController(),
            exportController: this.getExportController()
        };
    }
}

module.exports = new Container(); 