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

## License

MIT
