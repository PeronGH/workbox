import { getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export { SshContainer } from "./container";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/connect/:port", (c) => {
	const authorizedKey = c.req.header("X-Authorized-Key");
	if (!authorizedKey) {
		return c.text("missing X-Authorized-Key", 400);
	}
	return getContainer(c.env.SSH_CONTAINER, authorizedKey).fetch(c.req.raw);
});

export default app;
