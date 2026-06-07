import { getContainer } from "@cloudflare/containers";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { parseAuthorizedKey } from "./authorized-key";

export { SshContainer } from "./container";

type AppEnv = {
	Bindings: CloudflareBindings;
	Variables: { authorizedKey: string };
};

const requireAuthKey = createMiddleware<AppEnv>(async (c, next) => {
	const header = c.req.header("Cf-Access-Client-Id");
	const authorizedKey = header ? parseAuthorizedKey(header) : null;
	if (!authorizedKey) {
		return c.text("invalid Cf-Access-Client-Id", 400);
	}
	c.set("authorizedKey", authorizedKey);
	return next();
});

const app = new Hono<AppEnv>();

app.use(requireAuthKey);

app.get("/workbox", async (c) => {
	const state = await getContainer(
		c.env.SSH_CONTAINER,
		c.get("authorizedKey"),
	).getState();
	return c.json(state);
});

app.delete("/workbox", async (c) => {
	await getContainer(c.env.SSH_CONTAINER, c.get("authorizedKey")).destroy();
	return c.body(null, 204);
});

app.get("/connect/:port", (c) => {
	const authorizedKey = c.get("authorizedKey");
	const request = new Request(c.req.raw);
	request.headers.set("X-Authorized-Key", authorizedKey);
	return getContainer(c.env.SSH_CONTAINER, authorizedKey).fetch(request);
});

export default app;
