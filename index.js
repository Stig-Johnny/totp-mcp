#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { authenticator } = require("otplib");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Secrets file location
const SECRETS_FILE = path.join(os.homedir(), "Google Drive/My Drive/.nutrie-secrets");

// Account to secret key mapping (key name in secrets file)
const ACCOUNTS = {
  "google": "GOOGLE_TOTP_SECRET",
  "codiedev42": "GOOGLE_TOTP_SECRET",  // alias
};

// Load secrets from file
function loadSecrets() {
  try {
    const content = fs.readFileSync(SECRETS_FILE, "utf-8");
    const secrets = {};
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        secrets[match[1]] = match[2].trim();
      }
    }
    return secrets;
  } catch (err) {
    console.error(`Failed to load secrets: ${err.message}`);
    return {};
  }
}

// Generate TOTP code
function generateCode(account) {
  const secrets = loadSecrets();
  const keyName = ACCOUNTS[account.toLowerCase()];

  if (!keyName) {
    return { error: `Unknown account: ${account}. Available: ${Object.keys(ACCOUNTS).join(", ")}` };
  }

  const secret = secrets[keyName];
  if (!secret) {
    return { error: `No secret found for ${keyName} in secrets file` };
  }

  try {
    const code = authenticator.generate(secret);
    const remaining = authenticator.timeRemaining();
    return { code, remaining, account };
  } catch (err) {
    return { error: `Failed to generate code: ${err.message}` };
  }
}

// List available accounts
function listAccounts() {
  const secrets = loadSecrets();
  const available = [];

  for (const [account, keyName] of Object.entries(ACCOUNTS)) {
    if (secrets[keyName]) {
      available.push({ account, configured: true });
    } else {
      available.push({ account, configured: false, missing: keyName });
    }
  }

  return available;
}

// Create server
const server = new Server(
  { name: "totp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_totp_code",
      description: "Generate a TOTP 2FA code for an account. Returns a 6-digit code valid for ~30 seconds.",
      inputSchema: {
        type: "object",
        properties: {
          account: {
            type: "string",
            description: "Account name (e.g., 'google', 'codiedev42')"
          }
        },
        required: ["account"]
      }
    },
    {
      name: "list_totp_accounts",
      description: "List all configured TOTP accounts",
      inputSchema: {
        type: "object",
        properties: {}
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_totp_code") {
    const result = generateCode(args.account);
    if (result.error) {
      return { content: [{ type: "text", text: `Error: ${result.error}` }] };
    }
    return {
      content: [{
        type: "text",
        text: `TOTP code for ${result.account}: ${result.code}\nValid for ${result.remaining} more seconds`
      }]
    };
  }

  if (name === "list_totp_accounts") {
    const accounts = listAccounts();
    const lines = accounts.map(a =>
      a.configured
        ? `- ${a.account}: configured`
        : `- ${a.account}: NOT configured (missing ${a.missing})`
    );
    return {
      content: [{
        type: "text",
        text: `Available TOTP accounts:\n${lines.join("\n")}`
      }]
    };
  }

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }] };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TOTP MCP server running");
}

main().catch(console.error);
