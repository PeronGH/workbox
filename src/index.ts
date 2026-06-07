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

app.get("/connect/ssh", (c) => {
	const authorizedKey = c.req.header("X-Authorized-Key");
	if (!authorizedKey) {
		return c.text("missing X-Authorized-Key", 400);
	}
	return getContainer(c.env.SSH_CONTAINER, authorizedKey).fetch(c.req.raw);
});

export default app;
