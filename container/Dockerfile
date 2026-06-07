FROM debian:bookworm-slim

# websocat is not packaged for Debian; pin the static release binary.
ARG WEBSOCAT_VERSION=1.14.1

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		ca-certificates \
		curl \
		openssh-server \
		tini \
	&& rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/websocat \
		"https://github.com/vi/websocat/releases/download/v${WEBSOCAT_VERSION}/websocat.x86_64-unknown-linux-musl" \
	&& chmod +x /usr/local/bin/websocat

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 2222

ENTRYPOINT ["tini", "--", "/usr/local/bin/entrypoint.sh"]
