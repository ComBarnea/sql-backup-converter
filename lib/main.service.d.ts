import { WalkerService } from './walker.service';
export declare class MainService {
    private dirPath;
    walkerService: WalkerService;
    filesList: {
        path: string;
        tableName?: string;
        amountOfRowsParsed?: number;
        amountOfRowsConverted?: number;
    }[];
    constructor(dirPath: string);
    init(): Promise<void>;
    run(): Promise<void>;
    private _generateFilesList;
    private _convertFilesToJSON;
    private _writeReport;
}
