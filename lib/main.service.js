"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const walker_service_1 = require("./walker.service");
const sqlToJSON_service_1 = require("./sqlToJSON.service");
const fs = require("fs-extra");
const moment = require("moment");
class MainService {
    constructor(dirPath) {
        this.dirPath = dirPath;
        this.filesList = [];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.walkerService = new walker_service_1.WalkerService(this.dirPath);
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._generateFilesList();
            yield this._convertFilesToJSON();
            yield this._writeReport();
        });
    }
    _generateFilesList() {
        return __awaiter(this, void 0, void 0, function* () {
            const filesArray = yield this.walkerService.generateFilesList();
            filesArray.forEach((singlePath) => {
                this.filesList.push({
                    path: singlePath
                });
            });
        });
    }
    _convertFilesToJSON() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let singleFile of this.filesList) {
                const converter = new sqlToJSON_service_1.SqlToJSONService(singleFile.path);
                const answer = yield converter.convert();
                singleFile.tableName = answer.tableName;
                singleFile.amountOfRowsParsed = answer.amountOfRowsParsed;
                singleFile.amountOfRowsConverted = answer.amountOfRowsConverted;
            }
        });
    }
    _writeReport() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.writeJson(`${this.dirPath}/report-${moment().format('YYYY-MM-DD hh:mm:ss')}.json`, { files: this.filesList });
        });
    }
}
exports.MainService = MainService;
//# sourceMappingURL=main.service.js.map