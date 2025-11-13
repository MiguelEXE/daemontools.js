#!/usr/bin/env node
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as common from "./common.js";

let skipIndex = 1;
if(process.argv[0].includes("node")){
    skipIndex = 2;
}
const d = process.argv[skipIndex++];
const child = process.argv[skipIndex++];
const child_argv = process.argv.slice(skipIndex);
if(d === undefined || child === undefined){
    console.error("usage: envdir d child");
    process.exit(1);
}

fs.readdirSync(d).forEach(envName => {
    process.env[envName] = fs.readFileSync(path.join(d, envName), { encoding: "utf-8" });
});
const daemon = child_process.spawn(child, child_argv, {
    stdio: ["inherit", "inherit", "inherit"],
    windowsHide: true
});
common.SIGNALS.forEach(signal => {
    // try here because when trying to register SIGKILL the nodejs can crash
    try{
        process.on(signal, () => {
            daemon.kill(signal as NodeJS.Signals);
        });
    }catch{}
});
