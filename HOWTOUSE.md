# how to use

i mistakenly rm-ed the entire project file, but still got the .js, so i had to re-do all of the documentation

## envdir
- usage: `envdir d child`
- files needed to work: *d*
### workings
- will read the contents of the directory *d*, in each file will set in the envdir envoriment the filename = the contents of the file
### example:
- load all env files of dbus and start it: envdir /etc/conf.d/dbus/ dbus

## svstat
- usage: `svstat ss`
- files needed to work: *s*/status
### workings
- will read the status of each service and print in on stdout
### notes
- the syntax of the returning stat is on src/svc.ts
- s means service
- ss is the plural of service: services
### examples
- checking the status of dbus: svstat dbus
- checking the status of udevd and udevadm (respectively): svstat udevd udevadm

## svc
- usage: `svc -xukdits ss`
- files needed to work: *s*/control (must be a normal file, not a FIFO)
### workings
- for each s, it will append the options/commands into *s*/control, supervise will read the file and empty it out
### commands:
- x (exit): sends a sigterm to the daemon, wait for it do die, exit supervisor with code 0 (do not reply for any other commands in the process)
- t (sigterm): sends sigterm (doesnt set want)
- k (sigkill): sends sigkill (doesnt set want)
- i (sigint): sends sigint (doesnt set want)
- s (start): starts the daemon (doesnt set want)
- u (up): sets wants to up (wont start the daemon though)
- d (down): sets wants to down (wont kill the daemon though)
### notes
- is state: if the daemon is running or not (up = alive, down = not alive)
- want state: if the daemon will not restart the service automatically (up = will restart, down = will not restart)
- there is a lag between the communication of svc and supervise, this is a node.js problem
- commands can be stacked, example: `svc -dk` (set want=down, kill with sigkill)
- can control multiple services, example: `svc -dt dbus udevd`
- to avoid race condition, to exit supervisor aggressively: use `svc -dkx s`
- if run svc -dix, it will set want to down, sigint first then sigterm and it for to die. not sure if to clarify this as a unintended feature (not exactly as a bug, but more of a unconvenience feature), if someone needs to send a sigint and exit, I would with no problem re-do the x command (in a major update)
### examples
- start dbus normally: `svc -us dbus`
- start udevd once (dont auto start it if killed, -d can be omitted if already down): `svc -ds dbus`
- set want to down and kill with sigterm (normal killing): `svc -dt networkmanager`
- set want to down and kill with sigint (normal killing 2): `svc -di getty-tty1`
- set want to down and kill with sigkill (aggressive killing): `svc -dk networkmanager-dispatcher`
- set want to up and kill with sigterm (effectively restarting it): `svc -ut sddm`
- sigterm with sigint (restarting again, but omit -u, same effect as above): `svc -i gdm`
- set want to up and kill with sigkill (aggressive restart): `svc -uk elogind`
- exit supervisor (if the supervise was started by svscan, this will restart it): `svc -x libvirt`

## svwait
- usage: `svwait -ud ss`
- files needed to work: *s*/status
### workings
- reads *s*/status and converts it into a human readable form
### notes
- there is a lag between in the detection of the state
- you can only select one option (-u for up, -d for down), you cannot select both
### examples
- wait for udevd to start: `svwait -u udevd`
- wait for dbus to die: `svwait -d dbus`
- wait for dbus and udevd to start: `svwait -u udevd dbus`
- wait for sddm and networkmanager to die: `svwait -d sddm networkmanager`

## supervise
- usage: `supervise s`
- files needed to work: *s*/run ; (optionally) *s*/down
### workings
- if *s*/down does not exist, will spawn *s*/run immediatly, otherwise will do nothing (wait for other commands)
### notes
- there is no fghack, if the daemon backgrounds itself, good luck
### examples
- supervise udevd service: `supervise /etc/services/udevd`

## svscan
- usage: `svscan`
- files needed to work: every entry in the current directory must be a directory (no exceptions, even hidden entries)
### workings
- in the current directory, for each directory, it will spawn a supervise process in it
- if a supervisor die (by any means), restart it
- if a new directory is added, it will spawn a supervise for it
- if a directory is deleted/unlinked in the current directory, it will SIGTERM the supervise
- if receives SIGTERM, it will SIGTERM all supervisors, wait for all to shutdown, and then exit
### notes
- there is no way of killing supervise without removing/moving the directory
- neither there is no way to check if the svscan has a supervise for that folder without using /proc (AKA communicating with svscan)
- svscan SHOULD never die, you could sigterm it and it would exit (if pid 1, will kernel panic after some seconds)
### example:
- `svscan` (bruh)