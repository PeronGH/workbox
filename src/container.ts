import { Container } from "@cloudflare/containers";

export class SshContainer extends Container {
	override defaultPort = 2052;

	override fetch(request: Request): Promise<Response> {
		const authorizedKey = request.headers.get("X-Authorized-Key");
		if (authorizedKey) {
			this.envVars = { AUTHORIZED_KEY: authorizedKey };
		}
		return super.fetch(request);
	}
}
