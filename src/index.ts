import { getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export { SshContainer } from "./container";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/workbox", async (c) => {
	const authorizedKey = c.req.header("Cf-Access-Client-Id");
	if (!authorizedKey) {
		return c.text("missing Cf-Access-Client-Id", 400);
	}
	const state = await getContainer(
		c.env.SSH_CONTAINER,
		authorizedKey,
	).getState();
	return c.json(state);
});

app.delete("/workbox", async (c) => {
	const authorizedKey = c.req.header("Cf-Access-Client-Id");
	if (!authorizedKey) {
		return c.text("missing Cf-Access-Client-Id", 400);
	}
	await getContainer(c.env.SSH_CONTAINER, authorizedKey).destroy();
	return c.body(null, 204);
});

app.get("/connect/:port", (c) => {
	const authorizedKey = c.req.header("Cf-Access-Client-Id");
	if (!authorizedKey) {
		return c.text("missing Cf-Access-Client-Id", 400);
	}
	const request = new Request(c.req.raw);
	request.headers.set("X-Authorized-Key", authorizedKey);
	return getContainer(c.env.SSH_CONTAINER, authorizedKey).fetch(request);
});

export default app;
