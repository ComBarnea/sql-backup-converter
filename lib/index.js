"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const main_service_1 = require("./main.service");
const argv = yargs
    .alias('p', 'path')
    .describe('p', 'choose path to work from')
    .help('help')
    .argv;
const mainService = new main_service_1.MainService(argv.path);
mainService.init()
    .then(() => {
    return mainService.run();
})
    .catch((err) => {
});
//# sourceMappingURL=index.js.map