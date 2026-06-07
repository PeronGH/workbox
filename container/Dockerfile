FROM golang:1.26-trixie AS wsproxy

WORKDIR /src/wsproxy
COPY wsproxy/go.mod wsproxy/go.sum ./
RUN go mod download
COPY wsproxy/ ./
RUN go build -o /usr/local/bin/wsproxy .

FROM debian:trixie

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		aria2 \
		bash-completion \
		btop \
		ca-certificates \
		curl \
		dnsutils \
		docker-compose \
		docker.io \
		fastfetch \
		file \
		git \
		htop \
		iproute2 \
		iputils-ping \
		jq \
		less \
		locales \
		lsof \
		man-db \
		manpages \
		micro \
		nano \
		netcat-openbsd \
		openssh-server \
		procps \
		ripgrep \
		rsync \
		sudo \
		tini \
		tmux \
		tree \
		unzip \
		vim \
		wget \
		zip \
	&& rm -rf /var/lib/apt/lists/*

RUN sed -i '/^# *en_US\.UTF-8 UTF-8/s/^# *//' /etc/locale.gen \
	&& locale-gen \
	&& echo 'LANG=en_US.UTF-8' > /etc/environment
ENV LANG=en_US.UTF-8

RUN sed -i 's/^Components: main$/Components: main contrib non-free/' \
	/etc/apt/sources.list.d/debian.sources

COPY --from=wsproxy /usr/local/bin/wsproxy /usr/local/bin/wsproxy

COPY sshd-sandbox.conf /etc/ssh/sshd_config.d/sandbox.conf

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 2052

ENTRYPOINT ["tini", "--", "/usr/local/bin/entrypoint.sh"]
