#!/usr/bin/env bash
# latticework statusline badge. Prints [LATTICE] or [LATTICE:LEVEL] when active.
flag="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.latticework-active"
if [ -f "$flag" ]; then
  mode="$(cat "$flag" 2>/dev/null)"
  if [ "$mode" = "full" ] || [ -z "$mode" ]; then echo "[LATTICE]"; else echo "[LATTICE:$(echo "$mode" | tr '[:lower:]' '[:upper:]')]"; fi
fi
