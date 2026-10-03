#!/usr/bin/env bash
# Serve this checkout for verification. Usage: site.sh start|doctor|stop
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
PORT="${VERIFY_PORT:-8123}"
STATE="/tmp/verify-ryanthomas-ai"
PIDFILE="$STATE/server.pid"
mkdir -p "$STATE"

alive() { [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; }

case "${1:-}" in
  start)
    if alive; then echo "already running: pid $(cat "$PIDFILE") on port $PORT"; exit 0; fi
    if (exec 3<>"/dev/tcp/127.0.0.1/$PORT") 2>/dev/null; then
      echo "port $PORT is owned by another process; set VERIFY_PORT to a free port" >&2
      exit 1
    fi
    setsid python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT" \
      >"$STATE/server.log" 2>&1 &
    echo $! >"$PIDFILE"
    for _ in $(seq 1 50); do
      curl -fs -o /dev/null "http://127.0.0.1:$PORT/" && { echo "ready: http://127.0.0.1:$PORT/ (pid $(cat "$PIDFILE"))"; exit 0; }
      sleep 0.1
    done
    echo "server did not answer on port $PORT; see $STATE/server.log" >&2
    exit 1
    ;;
  doctor)
    rc=0
    echo "checkout:  $ROOT"
    echo "revision:  $(git -C "$ROOT" rev-parse --short HEAD) on $(git -C "$ROOT" branch --show-current)"
    echo "dirty:     $(git -C "$ROOT" status --porcelain | wc -l) path(s)"
    if alive; then echo "server:    pid $(cat "$PIDFILE") (started by this skill)"; else echo "server:    NOT running (run: site.sh start)"; rc=1; fi
    served="$(curl -fs "http://127.0.0.1:$PORT/index.html" | sha256sum | cut -d' ' -f1)"
    local_sum="$(sha256sum "$ROOT/index.html" | cut -d' ' -f1)"
    if [ "$served" = "$local_sum" ]; then echo "content:   served index.html matches this checkout"; else echo "content:   MISMATCH, port $PORT is not serving this checkout" >&2; rc=1; fi
    [ -x /opt/google/chrome/chrome ] && echo "chrome:    /opt/google/chrome/chrome" || { echo "chrome:    /opt/google/chrome/chrome missing; use a browser tool with viewport emulation instead" >&2; rc=1; }
    [ -d "$ROOT/.playwright-mcp" ] && echo "note:      $ROOT/.playwright-mcp exists; stop removes it"
    exit $rc
    ;;
  stop)
    if alive; then kill "$(cat "$PIDFILE")" 2>/dev/null; echo "stopped server pid $(cat "$PIDFILE")"; fi
    rm -f "$PIDFILE"
    rm -rf "$ROOT/.playwright-mcp"
    echo "evidence under $STATE/runs is kept"
    ;;
  *)
    echo "usage: site.sh start|doctor|stop" >&2
    exit 2
    ;;
esac
