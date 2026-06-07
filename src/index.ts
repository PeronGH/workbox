import { getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export { SshContainer } from "./container";

const app = new Hono<{ Bindings: CloudflareBindings }>();

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
