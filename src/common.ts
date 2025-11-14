import * as fs from "fs";

// time to take to restart the service, if wants = up
export const DEFAULT_RESTART_TIME = 2000;
// for testing purpouses, change that later
export const DEFAULT_SERVICE_PATH = "/home/miguel/daemontools.js/services";
// extracted directly from kill -l: false, thats extracted from @types/node (also MIT license)
export const SIGNALS = "SIGABRT SIGALRM SIGBUS SIGCHLD SIGCONT SIGFPE SIGHUP SIGILL SIGINT SIGIO SIGIOT SIGKILL SIGPIPE SIGPOLL SIGPROF SIGPWR SIGQUIT SIGSEGV SIGSTKFLT SIGSTOP SIGSYS SIGTERM SIGTRAP SIGTSTP SIGTTIN SIGTTOU SIGUNUSED SIGURG SIGUSR1 SIGUSR2 SIGVTALRM SIGWINCH SIGXCPU SIGXFSZ SIGBREAK SIGLOST SIGINFO".split(" ");

// unix specifics (permission)
export const DEFAULT_CONTROL_MODE = 0o600;
export const DEFAULT_STATUS_MODE = 0o644;