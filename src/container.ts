import { Container } from "@cloudflare/containers";

export class SshContainer extends Container {
	override defaultPort = 2052;

	override async fetch(request: Request): Promise<Response> {
		const authorizedKey = request.headers.get("X-Authorized-Key");
		await this.startAndWaitForPorts({
			startOptions: {
				envVars: {
					AUTHORIZED_KEY: authorizedKey!,
				},
			},
		});
		return super.fetch(request);
	}
}
