import { getContainer } from "@cloudflare/containers";
import { type Context, Hono } from "hono";
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

const connect = (c: Context<AppEnv>, port: string) => {
	const authorizedKey = c.get("authorizedKey");
	const url = new URL(c.req.url);
	url.pathname = `/connect/${port}`;
	const request = new Request(url, c.req.raw);
	request.headers.set("X-Authorized-Key", authorizedKey);
	return getContainer(c.env.SSH_CONTAINER, authorizedKey).fetch(request);
};

app.get("/connect/:port", (c) => connect(c, c.req.param("port")));

app.get("/connect", (c) => {
	const destination = c.req.header("Cf-Access-Jump-Destination") ?? "";
	const port = destination.slice(destination.lastIndexOf(":") + 1);
	if (!/^\d+$/.test(port)) {
		return c.text("invalid Cf-Access-Jump-Destination", 400);
	}
	return connect(c, port);
});

export default app;
