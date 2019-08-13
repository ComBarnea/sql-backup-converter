export declare class WalkerService {
    private currentPath;
    constructor(currentPath: string);
    getAbsolutePath(): string;
    generateFilesList(): Promise<string[]>;
    private _runKlaw;
}
