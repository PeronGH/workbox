import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class SshContainer extends Container {
	override defaultPort = 2222;
	override requiredPorts = [22, 2222];

	override fetch(request: Request): Promise<Response> {
		const authorizedKey = request.headers.get("X-Authorized-Key");
		if (authorizedKey) {
			this.envVars = { AUTHORIZED_KEY: authorizedKey };
		}
		return super.fetch(request);
	}
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/connect/ed25519/:pubKey/ssh", (c) => {
	const pubKey = c.req.param("pubKey");
	const container = getContainer(c.env.SSH_CONTAINER, `ed25519-${pubKey}`);
	const request = new Request(c.req.raw);
	request.headers.set("X-Authorized-Key", `ssh-ed25519 ${pubKey}`);
	return container.fetch(request);
});

export default app;
