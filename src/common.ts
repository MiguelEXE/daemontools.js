import * as fs from "fs";

// for testing purpouses, change that later
export const DEFAULT_SERVICE_PATH = "/home/miguel/daemontools.js/services";
// extracted directly from kill -l: false, thats extracted from @types/node (also MIT license)
export const SIGNALS = "SIGABRT SIGALRM SIGBUS SIGCHLD SIGCONT SIGFPE SIGHUP SIGILL SIGINT SIGIO SIGIOT SIGKILL SIGPIPE SIGPOLL SIGPROF SIGPWR SIGQUIT SIGSEGV SIGSTKFLT SIGSTOP SIGSYS SIGTERM SIGTRAP SIGTSTP SIGTTIN SIGTTOU SIGUNUSED SIGURG SIGUSR1 SIGUSR2 SIGVTALRM SIGWINCH SIGXCPU SIGXFSZ SIGBREAK SIGLOST SIGINFO".split(" ");

// unix specifics (permission)
export const DEFAULT_CONTROL_MODE = 0o600;
export const DEFAULT_STATUS_MODE = 0o644;

export function checkServiceArgDir(s: string){
    // separate into different statements,
    // mostly because you don't wanna
    // merge string operations and file system
    // operations, even on basic conditions like
    // this, that becomes bad code
    if(s.includes("/") || s.includes("."))
        return true;
    return fs.existsSync(s);
}