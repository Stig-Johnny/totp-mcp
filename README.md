# TOTP MCP Server

MCP server for generating TOTP (Time-based One-Time Password) 2FA codes for Claude Code automation.

## Features

- Generate 6-digit TOTP codes for configured accounts
- Codes are valid for ~30 seconds (standard TOTP)
- Shows remaining validity time
- Reads secrets from external file (not hardcoded)

## Installation

```bash
cd ~/.claude/mcp-servers/totp
npm install
```

## Configuration

1. Create a secrets file (e.g., `~/.nutrie-secrets`):
   ```
   GOOGLE_TOTP_SECRET=JBSWY3DPEHPK3PXP
   ```

2. Update `SECRETS_FILE` path in `index.js` if needed

3. Add accounts to the `ACCOUNTS` object in `index.js`:
   ```javascript
   const ACCOUNTS = {
     "google": "GOOGLE_TOTP_SECRET",
     "github": "GITHUB_TOTP_SECRET",
   };
   ```

## MCP Configuration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "totp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/.claude/mcp-servers/totp/index.js"]
    }
  }
}
```

## Tools

### `get_totp_code`

Generate a TOTP code for an account.

**Parameters:**
- `account` (required): Account name (e.g., "google")

**Example:**
```
TOTP code for google: 123456
Valid for 24 more seconds
```

### `list_totp_accounts`

List all configured TOTP accounts and their status.

## Security

- TOTP secrets are stored in an external file, not in the code
- The secrets file should have restricted permissions (`chmod 600`)
- Never commit secrets to git

## Troubleshooting

### "Account not found" error

The account name passed to `get_totp_code` doesn't match any key in the `ACCOUNTS` object.

**Fix:** Run `list_totp_accounts` to see configured account names, then use the exact name (case-sensitive).

### "Cannot read secrets file" / ENOENT error

The secrets file path in `index.js` doesn't exist or is wrong.

**Fix:** Verify the `SECRETS_FILE` path in `index.js` matches where your secrets file actually lives:
```bash
ls -la ~/.nutrie-secrets
```

### Code is always invalid / authentication failing

TOTP codes are time-based. If your system clock is out of sync, codes will be rejected even if they look correct.

**Fix:** Sync your system clock:
```bash
# macOS
sudo sntp -sS time.apple.com

# Linux
sudo timedatectl set-ntp true
```

### "Invalid base32 secret" error

The TOTP secret in your secrets file is malformed — it may have spaces, padding issues, or invalid characters.

**Fix:** Ensure the secret is a valid base32 string (A-Z, 2-7, no spaces). Copy it directly from your authenticator app's export or the service's 2FA setup page.

### Server not appearing in Claude

The MCP server isn't registered correctly in `.mcp.json`.

**Fix:** Double-check the path in your `.mcp.json` points to the actual `index.js` location:
```bash
node /path/to/.claude/mcp-servers/totp/index.js
```
Run this manually — if it errors, fix the path first.

### Code expires before Claude can use it

TOTP codes refresh every 30 seconds. If Claude takes too long between fetching the code and submitting it, it may expire.

**Fix:** Call `get_totp_code` as close to the moment of use as possible. The tool shows remaining validity time — if it's under 5 seconds, wait for the next cycle.

## License

MIT
