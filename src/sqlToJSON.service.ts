import { SQLToJSONAnswer } from './types';
import * as fs from 'fs-extra';

export class SqlToJSONService {
    fileBuffer: Buffer;
    fileString: string;
    fileLines: string[];
    rows: string[] = [];
    items: any[] = [];
    falseItems: string[] = [];
    tableName: string;
    answer: SQLToJSONAnswer = {
        amountOfRowsParsed: 0,
        amountOfRowsConverted: 0,
        tableName: ''
    };
    constructor(
        private filePath: string) {

    }

    async convert(): Promise<SQLToJSONAnswer> {


        try {
            await this._loadFile();
            await this._convertToLines();
            await this._findTable();
            await this._findRows();
            await this._findItems();
            await this._writeNewFile();
        } catch (e) {
            console.log('e', e);
        }

        return this.answer;
    }

    private async _loadFile() {
        this.fileBuffer = await fs.readFile(this.filePath);
        this.fileString = this.fileBuffer.toString().replace(/\r/g, '');
    }

    private async _convertToLines() {
        this.fileLines = this.fileString.split('\n');
    }

    private async _findTable() {
        const startTag = `create table`;
        const endTag = `)`;
        let foundStart = -1;
        let foundEnd = -1;
        let index = 0;

        for (let singleLine of this.fileLines) {
            if (foundStart === -1) {
                if (singleLine.toLowerCase().includes(startTag)) foundStart = index;
            }

            if (foundStart != -1) {
                if (singleLine.toLowerCase().includes(endTag) && !singleLine.toLowerCase().includes('(')) foundEnd = index;
            }

            index += 1;
            if (foundStart != -1 && foundEnd != -1) break;
        }

        if (foundStart != -1 && foundEnd != -1) {
            this.tableName = this.fileLines[foundStart].replace('create table ', '').replace('(', '');
            this.answer.tableName = this.tableName;
        }
    }

    private async _findRows() {
        let foundStart = -1;
        let foundEnd = -1;
        let index = 0;
        const rowsLogic: {start: number; end: number;}[] = [];

        const startLine = `insert into`;

        for (let singleLine of this.fileLines) {
            const trimSingleLine = singleLine.trim();
            const endRowRegEx = /\)$/;

            if (foundStart === -1) {
                if (trimSingleLine.includes(startLine)) foundStart = index;
            }

            const endRowTest = endRowRegEx.test(trimSingleLine.trim());

            if (foundStart != -1 && endRowTest) foundEnd = index;

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
            if (singleRowLogic.start === -1) continue;
            if (singleRowLogic.end === -1) continue;

            if (singleRowLogic.start === singleRowLogic.end) this.rows.push(this.fileLines[singleRowLogic.start]);

            this.rows.push(this.fileLines.slice(singleRowLogic.start, singleRowLogic.end + 1).join(''));
        }
    }

    private async _findItems() {
        for (let singleItemRow of this.rows) {
            const objectItem = await this._convertItem(singleItemRow);

            if (objectItem.success) {
                this.items.push(objectItem.obj);
                this.answer.amountOfRowsConverted += 1;
            } else {
                this.falseItems.push(objectItem.obj);
            }

            this.answer.amountOfRowsParsed += 1;
        }
    }


    private async _convertItem(singleItemRow: string) {
        return await this._splitSQLInsertLine(singleItemRow);
    }

    private async _splitSQLInsertLine(singleItemRow: string) {
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
            const obj: any = {};

            for (let i = 0; i < keysArray.length; i ++) {
                obj[keysArray[i]] = valuesArray[i];
            }

            return {success: true, obj};
        }

        return {success: false, obj: singleItemRow};
    }

    private async _writeNewFile() {
        const newPath = this.filePath.replace('.sql', '.json');

        await fs.writeJson(newPath, {tableName: this.tableName, items: this.items, falseItems: this.falseItems});
    }
}