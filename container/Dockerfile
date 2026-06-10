FROM golang:1.26-trixie AS wsproxy

WORKDIR /src/wsproxy
COPY wsproxy/go.mod wsproxy/go.sum ./
RUN go mod download
COPY wsproxy/ ./
RUN go build -o /usr/local/bin/wsproxy .

FROM archlinux:base-devel

RUN pacman -Syu --noconfirm \
		aria2 \
		bind \
		btop \
		docker \
		docker-compose \
		fastfetch \
		git \
		htop \
		jq \
		micro \
		openssh \
		ripgrep \
		tini \
		tree \
		wget \
	&& rm -rf /var/cache/pacman/pkg/*

RUN echo 'en_US.UTF-8 UTF-8' > /etc/locale.gen \
	&& locale-gen \
	&& echo 'LANG=en_US.UTF-8' > /etc/locale.conf \
	&& echo 'LANG=en_US.UTF-8' > /etc/environment

COPY --from=wsproxy /usr/local/bin/wsproxy /usr/local/bin/wsproxy

COPY bin/poweroff /usr/local/sbin/poweroff

COPY sshd-sandbox.conf /etc/ssh/sshd_config.d/sandbox.conf

COPY bin/motd-gen /usr/local/bin/motd-gen

COPY bin/entrypoint.sh /entrypoint.sh

EXPOSE 2052

ENTRYPOINT ["tini", "--", "/entrypoint.sh"]
