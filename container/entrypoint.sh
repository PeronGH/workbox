#!/bin/bash
set -euo pipefail

: "${AUTHORIZED_KEY:?AUTHORIZED_KEY must be set}"

install -d -m 700 /root/.ssh
printf '%s\n' "$AUTHORIZED_KEY" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# Seed a deterministic ed25519 host key from the authorized key so it stays
# stable across instance restarts. The printf bytes are the PKCS#8 prefix for
# an ed25519 private key; the 32-byte seed follows.
{ printf '\x30\x2e\x02\x01\x00\x30\x05\x06\x03\x2b\x65\x70\x04\x22\x04\x20'
	printf '%s' "$AUTHORIZED_KEY" | openssl dgst -sha256 -binary
} | openssl pkey -inform DER -out /etc/ssh/ssh_host_ed25519_key
chmod 600 /etc/ssh/ssh_host_ed25519_key
ssh-keygen -y -f /etc/ssh/ssh_host_ed25519_key > /etc/ssh/ssh_host_ed25519_key.pub

mkdir -p /run/sshd

dockerd >/var/log/dockerd.log 2>&1 &
/usr/sbin/sshd -D &
wsproxy &
wait -n
