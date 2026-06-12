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

motd-gen > /etc/motd || true

# cgroup v2: move all procs out of the root cgroup so controllers can be
# delegated to Docker's child cgroups ("no internal processes" rule), then
# use the cgroupfs driver since no systemd is running to manage scope units.
if [ -f /sys/fs/cgroup/cgroup.controllers ]; then
	mkdir -p /sys/fs/cgroup/init
	xargs -rn1 < /sys/fs/cgroup/cgroup.procs > /sys/fs/cgroup/init/cgroup.procs || true
	sed -e 's/ / +/g' -e 's/^/+/' < /sys/fs/cgroup/cgroup.controllers > /sys/fs/cgroup/cgroup.subtree_control
fi

dockerd --exec-opt native.cgroupdriver=cgroupfs >/var/log/dockerd.log 2>&1 &
/usr/sbin/sshd -D &
wsproxy &
wait -n
