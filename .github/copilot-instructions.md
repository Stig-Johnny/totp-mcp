# Copilot Code Review Instructions - totp-mcp

## Project Overview

MCP server for generating TOTP (Time-based One-Time Password) 2FA codes. Used by Claude Code to automate 2FA verification flows without manual code entry.

## Architecture

- **Pattern:** MCP SDK handler pattern (stdio transport)
- **Runtime:** Node.js (CommonJS)
- **Dependencies:** `@modelcontextprotocol/sdk`, `otplib`
- **Entry point:** `index.js` (single-file server)

## Security Focus

- TOTP secrets loaded from external file (`~/.nutrie-secrets`), never hardcoded
- Secrets file path is hardcoded - do not accept user-provided paths
- Never log TOTP codes or secrets (even in debug output)
- TOTP codes are time-sensitive (30s window) - do not cache
- Account names in tool output are safe to display, secrets are not

## Code Patterns

### TOTP Generation
- Use `otplib.authenticator.generate(secret)` for code generation
- `otplib.authenticator.timeRemaining()` for validity countdown
- Codes are 6 digits, 30-second window (standard TOTP)

### Secrets Management
- Secrets loaded from `~/.nutrie-secrets` file
- Format: `KEY=value` (one per line, no quotes)
- Account mapping defined in code (e.g., "google" -> `GOOGLE_TOTP_SECRET`)

### MCP Handlers
- `get_totp_code` - Generate code with remaining validity time
- `list_totp_accounts` - List configured accounts (no secrets exposed)

## Common Pitfalls

- TOTP codes expire in 30 seconds - use immediately after generation
- System clock must be accurate (NTP synced) for valid codes
- `otplib` expects base32-encoded secrets (standard format)
- Secrets file uses `=` delimiter - values may contain special characters
