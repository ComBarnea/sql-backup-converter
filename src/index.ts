import * as yargs from 'yargs';
import { MainService } from './main.service';

const argv: {
    path: string
} = yargs
    .alias('p', 'path')
    .describe('p', 'choose path to work from')
    .help('help')
    .argv;

const mainService = new MainService(argv.path);
mainService.init()
.then(() => {
   return mainService.run();
})
.catch((err) => {

});