#!/usr/bin/env node
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as common from "./common.js";

let skipIndex = 1;
if(process.argv[0].includes("node")){
    skipIndex = 2;
}
// plural of s
// .join(" ").split(/ +/) DOES NOT cancel out I swear
const ss = process.argv.slice(skipIndex).join(" ").split(/ +/g).filter(s => s.length > 0);
const d = ss[0];
if(!d){
    console.error("usage: supervise d");
    process.exit(1);
}
const child = ss.slice(1).join(" ");
fs.readdirSync(d).forEach(envName => {
    process.env[envName] = fs.readFileSync(path.join(d, envName), { encoding: "utf-8" });
});
const daemon = child_process.spawn(child, {
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
