# daemontools.js

set of tools made in javascript to manage services AKA "daemons"

works on linux (can boot a simple system with network, tested)

possible works on windows (not tested, but should work)

Pro:
- platform agnostic

Cons:
- code is trash
- supervise/svc has a lag when receiving commands (even though they exit almost instantaneously)
- horrible parsing of arguments in command line
- no fghack (unix shenanigans doesn't work on windows, https://github.com/daemontools/daemontools/blob/master/src/fghack.c)
- envdir does not exec() (it spawn())
- svc is not exactly as original in the original daemontools, however they are move verbose of what the supervise would do (this is a neutral one)
- there is no way of knowing if the daemon is ready or not, the supervise will just knows that is running, may fix this in another update (major one)
- no API (may fix in a minor or major update)

usage: refer to HOWTOUSE.md