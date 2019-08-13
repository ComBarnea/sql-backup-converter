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
const path = require("path");
const klaw = require("klaw");
const through2 = require("through2");
class WalkerService {
    constructor(currentPath) {
        this.currentPath = currentPath;
    }
    getAbsolutePath() {
        return path.resolve(this.currentPath);
    }
    generateFilesList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._runKlaw();
        });
    }
    _runKlaw() {
        return new Promise((resolve, reject) => {
            const items = [];
            klaw(this.getAbsolutePath(), {
                depthLimit: process.argv[3] || -1
            })
                .pipe(through2.obj(function (item, enc, next) {
                let ext = path.extname(item.path);
                if (ext.toLowerCase() === '.sql') {
                    this.push(item);
                }
                next();
            }))
                .on('data', function (item) {
                if (!item.stats.isDirectory()) {
                    items.push(item.path);
                }
            })
                .on('end', function () {
                resolve(items);
            });
        });
    }
}
exports.WalkerService = WalkerService;
//# sourceMappingURL=walker.service.js.map