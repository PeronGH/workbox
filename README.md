# workbox

Ephemeral SSH sandboxes on Cloudflare Containers.

## Deploy

```sh
bun run deploy
```

## Connect

### websocat

```sh
ssh -o ProxyCommand="websocat -b -H='Cf-Access-Client-Id: $(cat ~/.ssh/id_ed25519.pub)' - wss://$HOST/connect/22" root@workbox
```

### cloudflared

```sh
ssh -o ProxyCommand="cloudflared access tcp -T $HOST/connect/22 --id '$(cat ~/.ssh/id_ed25519.pub)'" root@workbox
```
