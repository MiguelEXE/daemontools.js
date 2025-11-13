#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as common from "./common.js";
import * as getopt from "posix-getopt";

const parser = new getopt.BasicParser("xukdits", process.argv);
const ss: string[] = [];
let commands = ""; // what to send
let curParsedOption: Option | undefined;

while ((curParsedOption = parser.getopt()) !== undefined){
    commands += curParsedOption.option;
}
for(let i=parser.optind();i<process.argv.length;i++)
    ss.push(process.argv[i]);
if(ss.length <= 0){
    console.error("usage: svc -xukdits ss");
    process.exit(1);
}

ss.forEach(s => {
    if(!common.checkServiceArgDir(s)){
        s = path.join(common.DEFAULT_SERVICE_PATH, s);
    }
    const s_stat = fs.statSync(s, { throwIfNoEntry: false });
    if(s_stat === undefined || !s_stat.isDirectory()){
        console.error(`'${s}' does not exist or is not a directory`);
        process.exit(1);
    }
    process.chdir(s);
    const control_stat = fs.statSync("control", { throwIfNoEntry: false });
    if(control_stat === undefined || !control_stat.isFile()){
        console.error("control does not exist or is not a file (is the supervise down?)");
        process.exit(1);
    }
    fs.appendFileSync("control", commands);
});
