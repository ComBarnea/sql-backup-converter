import * as path from 'path';
import * as klaw from 'klaw';
import * as through2 from 'through2';

export class WalkerService {
    constructor(
        private currentPath: string) {
    }

    getAbsolutePath() {
        return path.resolve(this.currentPath);
    }

    async generateFilesList(): Promise<string[]> {
        return await this._runKlaw();
    }

    private _runKlaw(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const items = [];

            klaw(this.getAbsolutePath(), {

                // default to full recursion, if now depth is given
                depthLimit: process.argv[3] || -1

            })
            .pipe(through2.obj(function (item, enc, next) {

                let ext = path.extname(item.path);

                if (ext.toLowerCase() === '.sql') {

                    this.push(item);

                }

                next();
            }))


                // for each item
            .on('data', function (item) {

                if (!item.stats.isDirectory()) {
                    items.push(item.path);

                }

            })

            // when the walk is over
            .on('end', function () {
                resolve(items);
            });
        });
    }
}
