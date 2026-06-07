FROM golang:1.26-trixie AS wsproxy

WORKDIR /src/wsproxy
COPY wsproxy/go.mod wsproxy/go.sum ./
RUN go mod download
COPY wsproxy/ ./
RUN go build -o /usr/local/bin/wsproxy .

FROM buildpack-deps:trixie

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		openssh-server \
		tini \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=wsproxy /usr/local/bin/wsproxy /usr/local/bin/wsproxy

COPY sshd-sandbox.conf /etc/ssh/sshd_config.d/sandbox.conf

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 2052

ENTRYPOINT ["tini", "--", "/usr/local/bin/entrypoint.sh"]
