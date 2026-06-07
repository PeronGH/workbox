import { Container } from "@cloudflare/containers";

const PORT_READY_TIMEOUT_MS = 1000;

export class SshContainer extends Container {
	override async fetch(request: Request): Promise<Response> {
		const authorizedKey = request.headers.get("X-Authorized-Key");
		if (!authorizedKey) {
			return new Response("missing X-Authorized-Key", { status: 400 });
		}
		const port = Number(new URL(request.url).pathname.split("/").at(-1));
		if (!Number.isInteger(port) || port < 1 || port > 65535) {
			return new Response("invalid port", { status: 400 });
		}

		await this.start({ envVars: { AUTHORIZED_KEY: authorizedKey } });

		const socket = await this.dial(port);
		if (!socket) {
			return new Response("container port not ready", { status: 504 });
		}

		const { 0: client, 1: server } = new WebSocketPair();
		server.accept();
		bridge(server, socket);
		return new Response(null, { status: 101, webSocket: client });
	}

	private async dial(port: number): Promise<Socket | null> {
		const { container } = this.ctx;
		if (!container) {
			return null;
		}
		let timedOut = false;
		const timer = new Promise<null>((resolve) =>
			setTimeout(() => {
				timedOut = true;
				resolve(null);
			}, PORT_READY_TIMEOUT_MS),
		);
		const attempt = (async () => {
			while (!timedOut) {
				const socket = container.getTcpPort(port).connect(`10.0.0.1:${port}`);
				if (
					await socket.opened.then(
						() => true,
						() => false,
					)
				) {
					return socket;
				}
			}
			return null;
		})();
		return Promise.race([attempt, timer]);
	}
}

function bridge(ws: WebSocket, socket: Socket): void {
	const writer = socket.writable.getWriter();
	ws.addEventListener("message", (event) => {
		writer
			.write(new Uint8Array(event.data as ArrayBuffer))
			.catch(() => ws.close());
	});
	ws.addEventListener("close", () => writer.close().catch(() => undefined));

	socket.readable
		.pipeTo(new WritableStream({ write: (chunk) => ws.send(chunk) }))
		.then(() => ws.close())
		.catch(() => ws.close());
}
