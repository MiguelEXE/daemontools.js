#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as common from "./common.js";
import * as getopt from "posix-getopt";

const parser = new getopt.BasicParser("ud", process.argv);
const wantingMap = {
    "u": "up",
    "d": "down"
};
const ss: string[] = [];
let wanting = "";
let curParsedOption: Option | undefined;
while ((curParsedOption = parser.getopt()) !== undefined){
    if(wanting){
        console.error("or up or down but not both");
        process.exit(1);
    }
    wanting = wantingMap[curParsedOption.option as "u" | "d"];
}
for(let i=parser.optind();i<process.argv.length;i++)
    ss.push(process.argv[i]);
if(ss.length <= 0){
    console.error("usage: svwait -ud ss");
    process.exit(1);
}

(async function (){
    for (let s of ss){
        if(!fs.existsSync(s)){
            s = path.join(common.DEFAULT_SERVICE_PATH, s);
        }
        const s_stat = fs.statSync(s, { throwIfNoEntry: false });
        if(s_stat === undefined || !s_stat.isDirectory()){
            console.error(`'${s}' does not exist or is not a directory`);
            process.exit(1);
        }
        process.chdir(s);
        const status_stat = fs.statSync("status", { throwIfNoEntry: false });
        if(status_stat === undefined || !status_stat.isFile()){
            console.error("status does not exist or is not a file (is the supervise down?)");
            process.exit(1);
        }

        // trash but works
        // honestly if there was a
        // repeat ... until ...;
        // from lua i would be glad
        // but this is js so who cares
        const [is, _, __, ___] = fs.readFileSync("status", { encoding: "ascii" }).split(" ");
        if(is === wanting)
            break;
        const iterator = fs.promises.watch("status");
        for await (const _ of iterator){
            const [is, _, __, ___] = fs.readFileSync("status", { encoding: "ascii" }).split(" ");
            if(is === wanting)
                break;
        }
    }
})();
