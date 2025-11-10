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
let s = ss[0];
if(!s){
    console.error("usage: supervise s");
    process.exit(1);
}
if(s[0] !== "/"){
    s = path.join(common.DEFAULT_SERVICE_PATH, s);
}

const s_stat = fs.statSync(s, {throwIfNoEntry: false});
if(s_stat === undefined || !s_stat.isDirectory()){
    console.error(`'${s}' does not exist or is not a directory`);
    process.exit(1);
}

let startTime = 0;
// AKA wants
let auto_start = false;
let exiting = false;

process.chdir(s);

// special case where time must be zero
fs.writeFileSync("status", `down 0 -1 down`, {
    mode: common.DEFAULT_STATUS_MODE
});
fs.writeFileSync("control", "", {
    mode: common.DEFAULT_CONTROL_MODE
});
const controlWatch = fs.watchFile("control", () => {
    const commands = fs.readFileSync("control", {encoding: "utf-8"}).split("");
    fs.writeFileSync("control", "", {
        mode: common.DEFAULT_CONTROL_MODE
    });
    for(const command of commands)
        processCommand(command);
});
let daemon: child_process.ChildProcess | undefined;
if(!fs.existsSync(path.join(s, "down"))){
    auto_start = true;
    startDaemon();
    updateStatus();
}

function isDown(){
    if(daemon === undefined)
        return true;
    return daemon.pid === undefined || daemon.killed || daemon.exitCode !== null;
}

const _wait = (ms: number) => new Promise(r => setTimeout(r,ms));
function updateStatus(){
    if(isDown()){
        fs.writeFileSync("status", `down ${performance.now() - startTime} -1 ${auto_start ? "up" : "down"}`, {
            mode: common.DEFAULT_STATUS_MODE
        });
        return;
    }
    fs.writeFileSync("status", `up ${Date.now()} ${daemon!.pid} ${auto_start ? "up" : "down"}`, {
        mode: common.DEFAULT_STATUS_MODE
    });
    
}
function startDaemon(){
    if(!isDown())
        return;
    startTime = performance.now();
    daemon = child_process.spawn(path.join(s, "run"), {
        stdio: "inherit",
        windowsHide: true
    });
    async function handler(){
        daemon?.removeAllListeners();
        if(exiting)
            return;
        updateStatus();
        await _wait(2000);
        if(exiting)
            return;
        if(auto_start){
            startDaemon();
            updateStatus();
        }
    }
    daemon.once("exit", handler);
}
function killDaemon(signal: NodeJS.Signals = "SIGTERM"): Promise<void>{
    return new Promise(r => {
        if(isDown())
            return r();
        daemon!.once("exit", () => r());
        daemon!.kill(signal);
    });
}
async function exit_supervisor(): Promise<never>{
    exiting = true;
    auto_start = false;
    await killDaemon();
    fs.rmSync("status");
    fs.rmSync("control");
    controlWatch.removeAllListeners();
    controlWatch.unref();
    process.exit(0);
}

// supported commands: xukdits
function processCommand(command: string){
    switch(command){
        case 'u':
            auto_start = true;
            updateStatus();
            break;
        case 's':
            startDaemon();
            updateStatus();
            break;
        case 'd':
            auto_start = false;
            updateStatus();
            break;
        case 't':
            killDaemon("SIGTERM");
            break;
        case 'i':
            killDaemon("SIGINT");
            break;
        case 'k':
            killDaemon("SIGKILL");
            break;
        case 'x':
            exit_supervisor();
            break;
        default:
            console.error(`Unknown command: '${command}'`);
            break;
    }
}

process
    .once("SIGTERM", exit_supervisor)
    .once("SIGINT", exit_supervisor);