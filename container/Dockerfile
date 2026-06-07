FROM buildpack-deps:trixie

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		openssh-server \
		tini \
	&& rm -rf /var/lib/apt/lists/*

COPY sshd-sandbox.conf /etc/ssh/sshd_config.d/sandbox.conf

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 22

ENTRYPOINT ["tini", "--", "/usr/local/bin/entrypoint.sh"]
