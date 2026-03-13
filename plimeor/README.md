# Web Terminal Time Machine

- Team / Members: Plimeor
- Agentic Coder: Codex
- Completion self-review: MVP complete for the hackathon brief. The app includes a Bun static shell, mock terminal commands, session recording, timed replay, and a read-only timeline. Browser-level manual smoke testing was not executed in this session.
- First prompt to AI: "帮我实现这个方案，你需要先调研一下如何用 bun 搭建初始项目。"

## Implementation Note

- Dev: `cd plimeor && bun run dev`
- Build: `cd plimeor && bun run build`
- Completed MVP features: xterm-based mock terminal, `help` / `ls` / `gcc main.c` / `clear`, fresh recording sessions, replay with progress timeline, and Bun tests for pure modules.
- Known gaps: replay does not model backspace as a semantic event, and manual browser interaction was not verified inside this session.
