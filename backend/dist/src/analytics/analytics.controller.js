"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getLitersStatistics(pumpId) {
        return this.analyticsService.getLitersStatistics(pumpId);
    }
    getAmountStatistics(pumpId) {
        return this.analyticsService.getAmountStatistics(pumpId);
    }
    getFuelTypeDistribution(pumpId) {
        return this.analyticsService.getFuelTypeDistribution(pumpId);
    }
    getNozzleDistribution(pumpId) {
        return this.analyticsService.getNozzleDistribution(pumpId);
    }
    getTimeSeriesData(pumpId, hours) {
        return this.analyticsService.getTimeSeriesData(pumpId, hours ? parseInt(hours) : 24);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('liters-statistics'),
    __param(0, (0, common_1.Query)('pumpId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getLitersStatistics", null);
__decorate([
    (0, common_1.Get)('amount-statistics'),
    __param(0, (0, common_1.Query)('pumpId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAmountStatistics", null);
__decorate([
    (0, common_1.Get)('fuel-type-distribution'),
    __param(0, (0, common_1.Query)('pumpId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getFuelTypeDistribution", null);
__decorate([
    (0, common_1.Get)('nozzle-distribution'),
    __param(0, (0, common_1.Query)('pumpId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getNozzleDistribution", null);
__decorate([
    (0, common_1.Get)('time-series'),
    __param(0, (0, common_1.Query)('pumpId')),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTimeSeriesData", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map