#!/bin/bash
set -euo pipefail

# run: `node dist/envdir.js test_env ./check_env.sh arg1 arg2 arg3`
# should appear:
# arg1 arg2 arg3
# TEST1="TEST"
# TEST2="TESTING"

echo $*
export | grep -o "TEST.=.*$"