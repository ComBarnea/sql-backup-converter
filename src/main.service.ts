import { WalkerService } from './walker.service';
import { SqlToJSONService } from './sqlToJSON.service';
import * as fs from 'fs-extra';
import * as moment from 'moment';

export class MainService {
    walkerService: WalkerService;
    filesList: {
        path: string;
        tableName?: string;
        amountOfRowsParsed?: number;
        amountOfRowsConverted?: number;
    }[] = [];
    constructor(
        private dirPath: string
    ) {}

    async init() {
        this.walkerService = new WalkerService(this.dirPath);
    }

    async run() {
        await this._generateFilesList();
        await this._convertFilesToJSON();
        await this._writeReport();
    }

    private async _generateFilesList() {
        const filesArray: string[] = await this.walkerService.generateFilesList();

        filesArray.forEach((singlePath) => {
            this.filesList.push({
                path: singlePath
            });
        });
    }

    private async _convertFilesToJSON() {
        for (let singleFile of this.filesList) {
            const converter = new SqlToJSONService(singleFile.path);
            const answer = await converter.convert();
            singleFile.tableName = answer.tableName;
            singleFile.amountOfRowsParsed = answer.amountOfRowsParsed;
            singleFile.amountOfRowsConverted = answer.amountOfRowsConverted;
        }
    }


    private async _writeReport() {
        await fs.writeJson(`${this.dirPath}/report-${moment().format('YYYY-MM-DD hh:mm:ss')}.json`, {files: this.filesList});
    }
}