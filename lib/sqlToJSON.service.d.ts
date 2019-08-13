/// <reference types="node" />
import { SQLToJSONAnswer } from './types';
export declare class SqlToJSONService {
    private filePath;
    fileBuffer: Buffer;
    fileString: string;
    fileLines: string[];
    rows: string[];
    items: any[];
    falseItems: string[];
    tableName: string;
    answer: SQLToJSONAnswer;
    constructor(filePath: string);
    convert(): Promise<SQLToJSONAnswer>;
    private _loadFile;
    private _convertToLines;
    private _findTable;
    private _findRows;
    private _findItems;
    private _convertItem;
    private _splitSQLInsertLine;
    private _writeNewFile;
}
