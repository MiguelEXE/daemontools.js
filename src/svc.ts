#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as common from "./common.js";

let options = ""; // what to send
let skipIndex = 1;
if(process.argv[0].includes("node")){
    skipIndex = 2;
}
const unifiedArgv = process.argv.slice(skipIndex).join(" ");
const optionsArgvStart = unifiedArgv.indexOf("-");
if(optionsArgvStart < 0){
    console.error("usage: svc -xukdits ss");
    process.exit(1);
}
//["-xukdits", ...s]
const argvNecessary = unifiedArgv.slice(optionsArgvStart).split(/ +/g);
const xukdits = argvNecessary.shift();
if(!xukdits || xukdits.length <= 1){
    console.error("usage: svc -xukdits ss");
    process.exit(1);
}
xukdits.slice(1).split("").forEach(xukditsOption => {
    if(!("xukdits".split("").includes(xukditsOption))){
        console.error("usage: svc -xukdits ss");
        process.exit(1);
    }
    options += xukditsOption;
});
// plural of s
const ss = argvNecessary;
ss.forEach(s => {
    if(s[0] !== "/"){
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
    fs.appendFileSync("control", options);
});
