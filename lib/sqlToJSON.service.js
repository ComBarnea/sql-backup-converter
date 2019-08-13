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
const fs = require("fs-extra");
class SqlToJSONService {
    constructor(filePath) {
        this.filePath = filePath;
        this.rows = [];
        this.items = [];
        this.falseItems = [];
        this.answer = {
            amountOfRowsParsed: 0,
            amountOfRowsConverted: 0,
            tableName: ''
        };
    }
    convert() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._loadFile();
                yield this._convertToLines();
                yield this._findTable();
                yield this._findRows();
                yield this._findItems();
                yield this._writeNewFile();
            }
            catch (e) {
                console.log('e', e);
            }
            return this.answer;
        });
    }
    _loadFile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fileBuffer = yield fs.readFile(this.filePath);
            this.fileString = this.fileBuffer.toString().replace(/\r/g, '');
        });
    }
    _convertToLines() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fileLines = this.fileString.split('\n');
        });
    }
    _findTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTag = `create table`;
            const endTag = `)`;
            let foundStart = -1;
            let foundEnd = -1;
            let index = 0;
            for (let singleLine of this.fileLines) {
                if (foundStart === -1) {
                    if (singleLine.toLowerCase().includes(startTag))
                        foundStart = index;
                }
                if (foundStart != -1) {
                    if (singleLine.toLowerCase().includes(endTag) && !singleLine.toLowerCase().includes('('))
                        foundEnd = index;
                }
                index += 1;
                if (foundStart != -1 && foundEnd != -1)
                    break;
            }
            if (foundStart != -1 && foundEnd != -1) {
                this.tableName = this.fileLines[foundStart].replace('create table ', '').replace('(', '');
                this.answer.tableName = this.tableName;
            }
        });
    }
    _findRows() {
        return __awaiter(this, void 0, void 0, function* () {
            let foundStart = -1;
            let foundEnd = -1;
            let index = 0;
            const rowsLogic = [];
            const startLine = `insert into`;
            for (let singleLine of this.fileLines) {
                const trimSingleLine = singleLine.trim();
                const endRowRegEx = /\)$/;
                if (foundStart === -1) {
                    if (trimSingleLine.includes(startLine))
                        foundStart = index;
                }
                const endRowTest = endRowRegEx.test(trimSingleLine.trim());
                if (foundStart != -1 && endRowTest)
                    foundEnd = index;
                if (foundStart != -1 && foundEnd != -1) {
                    rowsLogic.push({
                        start: foundStart,
                        end: foundEnd
                    });
                    foundStart = -1;
                    foundEnd = -1;
                }
                index += 1;
            }
            for (let singleRowLogic of rowsLogic) {
                if (singleRowLogic.start === -1)
                    continue;
                if (singleRowLogic.end === -1)
                    continue;
                if (singleRowLogic.start === singleRowLogic.end)
                    this.rows.push(this.fileLines[singleRowLogic.start]);
                this.rows.push(this.fileLines.slice(singleRowLogic.start, singleRowLogic.end + 1).join(''));
            }
        });
    }
    _findItems() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let singleItemRow of this.rows) {
                const objectItem = yield this._convertItem(singleItemRow);
                if (objectItem.success) {
                    this.items.push(objectItem.obj);
                    this.answer.amountOfRowsConverted += 1;
                }
                else {
                    this.falseItems.push(objectItem.obj);
                }
                this.answer.amountOfRowsParsed += 1;
            }
        });
    }
    _convertItem(singleItemRow) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._splitSQLInsertLine(singleItemRow);
        });
    }
    _splitSQLInsertLine(singleItemRow) {
        return __awaiter(this, void 0, void 0, function* () {
            const valuesRegex = /NULL|\d+|'.*?'/g;
            const keysStart = singleItemRow.trim().indexOf('(');
            const keysEnd = singleItemRow.trim().indexOf(')');
            const valuesStart = singleItemRow.trim().lastIndexOf('(');
            const valuesEnd = singleItemRow.trim().lastIndexOf(')');
            const keys = singleItemRow.substring(keysStart + 1, keysEnd);
            const values = singleItemRow.substring(valuesStart + 1, valuesEnd);
            const keysArray = keys.split(',').map((i) => i.trim());
            const valuesArray = [];
            let match;
            while (match = valuesRegex.exec(values)) {
                if (match) {
                    valuesArray.push(match[0]);
                }
            }
            if (keysArray.length === valuesArray.length) {
                const obj = {};
                for (let i = 0; i < keysArray.length; i++) {
                    obj[keysArray[i]] = valuesArray[i];
                }
                return { success: true, obj };
            }
            return { success: false, obj: singleItemRow };
        });
    }
    _writeNewFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const newPath = this.filePath.replace('.sql', '.json');
            yield fs.writeJson(newPath, { tableName: this.tableName, items: this.items, falseItems: this.falseItems });
        });
    }
}
exports.SqlToJSONService = SqlToJSONService;
//# sourceMappingURL=sqlToJSON.service.js.map