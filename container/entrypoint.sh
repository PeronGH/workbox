#!/bin/bash
set -euo pipefail

mkdir -p /run/sshd
ssh-keygen -A

# TODO: provision authentication (authorized_keys, CA-signed certs, or a
# password) before exposing this — the skeleton image ships none.

/usr/sbin/sshd -D &
websocat --binary ws-l:0.0.0.0:2222 tcp:127.0.0.1:22 &

# Exit if either daemon dies so Cloudflare restarts the instance.
wait -n
