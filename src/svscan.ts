#!/usr/bin/env node
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";

function getSuperviseCommand(s: string): [string, string[]]{
    if(__filename.endsWith(".ts"))
        return ["echo", [path.join(__dirname, "supervise.ts"), s]]; // TODO
    return ["node", [path.join(__dirname, "supervise.js"), s]];
}

let exiting = false;

const services: string[] = [];
const servicesPid = new Map<string, child_process.ChildProcess>();
const currentDirWatch = fs.watchFile(".", () => reload());

const _wait = (ms: number) => new Promise(r => setTimeout(r,ms));

function activate(service: string){
    if(servicesPid.has(service)){
        console.warn(`WARN (${service}): supervisor already up. ignoring request...`);
        return;
    }
    const [command, args] = getSuperviseCommand(service);
    const supervisor = child_process.spawn(command, args, {
        stdio: "inherit",
        windowsHide: true
    });
    supervisor.once("exit", async () => {
        servicesPid.delete(service);
        await _wait(2000);
        if(exiting || !services.includes(service))
            return;
        // possible svc -x or supervise crashed, up them again
        activate(service);
    });
    servicesPid.set(service, supervisor);
}
function try_deactivate(service: string){
    const supervisor = servicesPid.get(service);
    if(supervisor === undefined)
        return;
    supervisor.kill();
}
// a \ b
// what elements do a have that b doesn't have
function difference<T>(a: T[], b: T[]): T[]{
    return a.filter(x => !b.includes(x));
}
function reload(){
    if(exiting)
        return;
    const new_services = fs.readdirSync(".");
    const toDeactivate = difference(services, new_services);
    const toActivate = difference(new_services, services);
    for(const service of toDeactivate)
        try_deactivate(service);
    for(const service of toActivate)
        activate(service);
    services.splice(0);
    services.push(...new_services);
}

function try_exit(){
    exiting = true;
    currentDirWatch.removeAllListeners();
    currentDirWatch.unref();
    for(const service of services)
        try_deactivate(service);
}
process
    .on("SIGCHLD", () => console.warn("possible zombie process acknowledged"))
    .once("SIGTERM", try_exit)
    .once("SIGINT", try_exit);

reload();