<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Source-Of-Truth Implementation Rule

When the user pastes concrete implementation source (SVG/JSX/CSS/code/config/content), treat it as exact source-of-truth:
- Do not reinterpret, redesign, or approximate.
- Implement from the pasted source verbatim first.
- Only animate or modify the specific parts explicitly requested.
- If any source is missing for exact implementation, ask for that file/content before proceeding.
