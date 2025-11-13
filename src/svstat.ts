#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as common from "./common.js";

// examples:
// WANT=down, IS=down, time=2000
// down | ran for 2000 sec
//
// WANT=down, IS=up, time=1762576968074
// up | pid 10230 started in 08/11/2025, 04:43:17 (wants down)
//
// WANT=up, IS=down, time=3000
// down | ran for 3000 sec (wants up)
//
// WANT=up, IS=up, time=1762576968074
// up | pid 10230 started in 08/11/2025, 04:43:17

let skipIndex = 1;
if(process.argv[0].includes("node")){
    skipIndex = 2;
}
// plural of s
// .join(" ").split(" ") DOES NOT cancel out I swear
const ss = process.argv.slice(skipIndex);
if(ss.length <= 0){
    console.error("usage: svstat ss");
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
    const status_stat = fs.statSync("status", { throwIfNoEntry: false });
    if(status_stat === undefined || !status_stat.isFile()){
        console.error("status does not exist or is not a file (is the supervise down?)");
        process.exit(1);
    }
    const [is, time, pid, wants] = fs.readFileSync("status", { encoding: "ascii" }).split(" ");
    let str = `${path.basename(s)}: ${is} | `;
    if(is === "up"){
        str += `pid ${pid} started in: ${new Date(parseFloat(time)).toLocaleString()} (started ${Math.floor((Date.now() - parseFloat(time))/1000)} sec ago)`;
    }else{
        str += `ran for ${Math.floor(parseFloat(time) / 1000)} sec`;
    }
    if(is !== wants){
        str += ` (wants ${wants})`;
    }
    console.log(str);
});
