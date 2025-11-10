#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as common from "./common.js";

let wanting = "";
const wantingMap = {
    "u": "up",
    "d": "down"
};
let skipIndex = 1;
if(process.argv[0].includes("node")){
    skipIndex = 2;
}
const unifiedArgv = process.argv.slice(skipIndex).join(" ");
const optionsArgvStart = unifiedArgv.indexOf("-");
if(optionsArgvStart < 0){
    console.error("usage: svwait -ud ss");
    process.exit(1);
}
//["-xokud", ...s]
const argvNecessary = unifiedArgv.slice(optionsArgvStart).split(/ +/g);
const xokud = argvNecessary.shift();
if(!xokud || xokud.length <= 1){
    console.error("usage: svwait -ud ss");
    process.exit(1);
}
xokud.slice(1).split("").forEach(xokudOption => {
    if(!("xokud".split("").includes(xokudOption))){
        console.error("usage: svwait -ud ss");
        process.exit(1);
    }
    if(wanting){
        console.error("or up or down but not both");
        process.exit(1);
    }
    wanting = wantingMap[xokudOption[0] as "d" | "u"];
});
// plural of s
const ss = argvNecessary;
(async function (){
    for (let s of ss){
        if(s[0] !== "/"){
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
