import * as fs from "fs";
import * as path from "path";

export type Status = {
    is: "up" | "down", // if service is running or stopped
    time: number, // timestamp if `is` is up, time interval in seconds otherwise.
    pid: number, // -1 if `is` is set down
    wants: "up" | "down" // restart automatically if killed
};
export type Signal = "SIGKILL" | "SIGTERM" | "SIGINT";

export const signalCommandMap: Readonly<{[k in Signal]: string}> = Object.freeze({
    SIGTERM: "t",
    SIGINT: "i",
    SIGKILL: "k"
});

export { DEFAULT_CONTROL_MODE, DEFAULT_RESTART_TIME, DEFAULT_SERVICE_PATH, DEFAULT_STATUS_MODE } from "./common.js";

export namespace SuperviseStatus {
    /**
     * Check status of service.
     * 
     * Needs a supervisor running on the directory.
     * 
     * @param serviceDir Service directory
     * @returns Service status
     */
    export async function checkStatus(serviceDir: string){
        const directory = path.join(serviceDir, "status");
        const status = await fs.promises.readFile(directory, { encoding: "ascii" });
        const [is, time, pid, wants] = status.split(" ");
        return {
            is,
            wants,
            time: parseFloat(time),
            pid: parseInt(pid)
        } as Status;
    }
    /**
     * Check status of service.
     * 
     * Needs a supervisor running on the directory.
     * 
     * Synchronous/blocking version of `checkStatus()`.
     * @param serviceDir Service directory
     * @returns Service status
     * @see https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking
     */
    export function checkStatusSync(serviceDir: string){
        const directory = path.join(serviceDir, "status");
        const status = fs.readFileSync(directory, { encoding: "ascii" });
        const [is, time, pid, wants] = status.split(" ");
        return {
            is,
            wants,
            time: parseFloat(time),
            pid: parseInt(pid)
        } as Status;
    }
};
export namespace SuperviseControl {
    /**
     * Synchronous version of all the function in this namespace.
     * @see https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking
     */
    export namespace sync {
        /**
         * Sets the want flag in supervise
         * @param serviceDir Service directory
         * @param wants If true, supervise will restart the service if it terminates
         */
        export function setWants(serviceDir: string, wants: boolean){
            return sendRawCommands(serviceDir, wants ? "u" : "d");
        }
        /**
         * Sends a signal to the service.
         * @param serviceDir Service directory
         * @param signal UNIX signal. Must be `"SIGTERM" | "SIGINT" | "SIGKILL"`
         */
        export function kill(serviceDir: string, signal: Signal){
            const command = signalCommandMap[signal];
            if(command === undefined)
                throw new TypeError("Second argument must be a Signal");
            return sendRawCommands(serviceDir, command);
        }
        /**
         * Start the service. If already started, do nothing.
         * @param serviceDir Service directory
         */
        export function start(serviceDir: string){
            return sendRawCommands(serviceDir, "s");
        }
        /**
         * Exits the supervisor.
         * Essencially the supervisor will:
         * - Signals the service with "SIGTERM"
         * - Waits for it to die
         * - Exits with code 0
         * 
         * While exiting, won't reply to any more commands.
         * @param serviceDir Service directory
         */
        export function exitSupervisor(serviceDir: string){
            return sendRawCommands(serviceDir, "x");
        }
        export function sendRawCommands(serviceDir: string, commands: string){
            const directory = path.join(serviceDir, "control");
            return fs.writeFileSync(directory, commands);
        }
    }
    /**
     * Sets the want flag in supervise
     * @param serviceDir Service directory
     * @param wants If true, supervise will restart the service if it terminates
     */
    export function setWants(serviceDir: string, wants: boolean){
        return sendRawCommands(serviceDir, wants ? "u" : "d");
    }
    /**
     * Sends a signal to the service.
     * @param serviceDir Service directory
     * @param signal UNIX signal. Must be `"SIGTERM" | "SIGINT" | "SIGKILL"`
     */
    export function kill(serviceDir: string, signal: Signal){
        const command = signalCommandMap[signal];
        if(command === undefined)
            throw new TypeError("Second argument must be a Signal");
        return sendRawCommands(serviceDir, command);
    }
    /**
     * Start the service. If already started, do nothing.
     * @param serviceDir Service directory
     */
    export function start(serviceDir: string){
        return sendRawCommands(serviceDir, "s");
    }
    /**
     * Exits the supervisor.
     * Essencially the supervisor will:
     * - Signals the service with "SIGTERM"
     * - Waits for it to die
     * - Exits with code 0
     * 
     * While exiting, won't reply to any more commands.
     * @param serviceDir Service directory
     */
    export function exitSupervisor(serviceDir: string){
        return sendRawCommands(serviceDir, "x");
    }
    /**
     * Send raw commands to supervise
     * @param serviceDir Service directory
     * @param commands String composed of svc parameters.
     */
    export function sendRawCommands(serviceDir: string, commands: string){
        const directory = path.join(serviceDir, "control");
        return fs.promises.writeFile(directory, commands);
    }
};