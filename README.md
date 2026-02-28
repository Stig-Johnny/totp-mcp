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

### TOTP code is rejected / invalid

TOTP codes are time-sensitive. The most common cause of invalid codes is clock drift.

- **Check system time:** `date` — ensure it's accurate to within a few seconds
- **Sync time (Linux):** `sudo timedatectl set-ntp true`
- **Sync time (macOS):** System Settings → General → Date & Time → Set automatically

### "Account not found" error

The account name must exactly match a key in the `ACCOUNTS` object in `index.js`.

- Run `list_totp_accounts` to see all configured account names
- Account names are case-sensitive (`google` ≠ `Google`)

### Secrets file not found

- Verify the `SECRETS_FILE` path in `index.js` points to your actual secrets file
- Confirm the file exists: `ls -la ~/.nutrie-secrets` (or your configured path)
- Check file permissions allow reading: `chmod 600 ~/.nutrie-secrets`

### MCP server fails to start

- Run `npm install` in the totp directory to ensure dependencies are installed
- Test manually: `node index.js` — any startup errors will print to stderr
- Verify the path in `.mcp.json` is absolute and correct

### TOTP secret is wrong / codes always fail

- Re-scan or re-copy the TOTP secret from your account's 2FA setup page
- Secrets are base32-encoded — ensure no extra spaces or line breaks in the secrets file
- Confirm the correct environment variable name is mapped in `ACCOUNTS`

## License

MIT
