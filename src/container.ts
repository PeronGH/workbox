import { Container } from "@cloudflare/containers";

export class SshContainer extends Container {
	override defaultPort = 2052;
	override sleepAfter = "24h";

	override async onStop(): Promise<void> {
		await this.destroy();
	}

	override async fetch(request: Request): Promise<Response> {
		const authorizedKey = request.headers.get("X-Authorized-Key");
		if (!authorizedKey) {
			return new Response("missing X-Authorized-Key", { status: 400 });
		}
		await this.startAndWaitForPorts({
			startOptions: {
				envVars: {
					AUTHORIZED_KEY: authorizedKey,
				},
			},
		});
		return super.fetch(request);
	}
}
