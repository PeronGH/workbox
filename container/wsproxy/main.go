package main

import (
	"context"
	"io"
	"log"
	"net"
	"net/http"
	"path"
	"strconv"
	"time"

	"github.com/coder/websocket"
)

// wsproxy accepts WebSocket connections and proxies each to the TCP port named
// in the request path (e.g. /connect/22 -> 127.0.0.1:22).
func main() {
	waitForSSHD()
	http.HandleFunc("/", handle)
	log.Fatal(http.ListenAndServe("0.0.0.0:2052", nil))
}

func waitForSSHD() {
	for {
		c, err := net.DialTimeout("tcp", "127.0.0.1:22", time.Second)
		if err == nil {
			c.Close()
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
}

func handle(w http.ResponseWriter, r *http.Request) {
	port, err := strconv.Atoi(path.Base(r.URL.Path))
	if err != nil || port < 1 || port > 65535 {
		http.Error(w, "invalid port", http.StatusBadRequest)
		return
	}

	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{InsecureSkipVerify: true})
	if err != nil {
		return
	}
	defer c.CloseNow()

	upstream, err := net.Dial("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)))
	if err != nil {
		c.Close(websocket.StatusInternalError, "dial failed")
		return
	}
	defer upstream.Close()

	conn := websocket.NetConn(context.Background(), c, websocket.MessageBinary)
	go func() { _, _ = io.Copy(upstream, conn) }()
	_, _ = io.Copy(conn, upstream)
}
