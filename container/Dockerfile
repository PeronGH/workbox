FROM golang:1.26-trixie AS wsproxy

WORKDIR /src/wsproxy
COPY wsproxy/go.mod wsproxy/go.sum ./
RUN go mod download
COPY wsproxy/ ./
RUN go build -o /usr/local/bin/wsproxy .

FROM debian:trixie-slim

RUN apt-get update \
	&& apt-get install -y \
		build-essential \
		curl \
		file \
		git \
		procps \
	&& rm -rf /var/lib/apt/lists/*

RUN touch /.dockerenv \
	&& NONINTERACTIVE=1 /bin/bash -c \
		"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" \
	&& echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' \
		> /etc/profile.d/homebrew.sh

ENV PATH=/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:$PATH

RUN apt-get update \
	&& apt-get install -y \
		docker-compose \
		docker.io \
		locales \
		openssh-server \
		tini \
	&& rm -rf /var/lib/apt/lists/*

RUN sed -i '/^# *en_US\.UTF-8 UTF-8/s/^# *//' /etc/locale.gen \
	&& locale-gen \
	&& echo 'LANG=en_US.UTF-8' > /etc/environment

RUN brew install \
	aria2 \
	bind \
	btop \
	fastfetch \
	htop \
	jq \
	micro \
	ripgrep \
	tree \
	wget \
	&& rm -rf "$(brew --cache)"

COPY --from=wsproxy /usr/local/bin/wsproxy /usr/local/bin/wsproxy

COPY bin/destroy /usr/local/bin/destroy

COPY sshd-sandbox.conf /etc/ssh/sshd_config.d/sandbox.conf

RUN rm -f /etc/motd
COPY bin/motd-region /etc/update-motd.d/20-region

COPY bin/entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 2052

ENTRYPOINT ["tini", "--", "/usr/local/bin/entrypoint.sh"]
