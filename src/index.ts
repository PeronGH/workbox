import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class SshContainer extends Container {
	override defaultPort = 2222;
	override requiredPorts = [22, 2222];
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/ssh/:name", (c) => {
	const container = getContainer(c.env.SSH_CONTAINER, c.req.param("name"));
	return container.fetch(c.req.raw);
});

export default app;
