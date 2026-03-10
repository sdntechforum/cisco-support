#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.error('[MCP DEBUG] Starting imports...');
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const mcp_server_js_1 = require("./mcp-server.js");
const sse_server_js_1 = require("./sse-server.js");
const fs_1 = require("fs");
const path_1 = require("path");
const node_crypto_1 = require("node:crypto");
console.error('[MCP DEBUG] Imports complete');
// Get version from package.json (handle different working directories)
function findPackageJson() {
    const possiblePaths = [
        (0, path_1.join)(__dirname, '../../package.json'), // When compiled to dist/src/
        (0, path_1.join)(__dirname, '../package.json'), // When running from src/
        (0, path_1.join)(process.cwd(), 'package.json'), // When running from project root
    ];
    for (const path of possiblePaths) {
        try {
            return (0, fs_1.readFileSync)(path, 'utf8');
        }
        catch (error) {
            // Continue to next path
        }
    }
    // Fallback version
    return JSON.stringify({ version: '1.7.0' });
}
const packageJson = JSON.parse(findPackageJson());
const VERSION = packageJson.version;
// CLI token generation functions
function generateToken() {
    return (0, node_crypto_1.randomUUID)().replace(/-/g, '');
}
function showTokenCommands() {
    console.log('🔑 Bearer Token Management');
    console.log('');
    console.log('Generate a new Bearer token:');
    console.log('  npx mcp-cisco-support --generate-token');
    console.log('');
    console.log('Use token via environment variable:');
    console.log('  export MCP_BEARER_TOKEN=your_custom_token_here');
    console.log('  npx mcp-cisco-support --http');
    console.log('');
    console.log('Disable authentication (not recommended):');
    console.log('  export DANGEROUSLY_OMIT_AUTH=true');
    console.log('  npx mcp-cisco-support --http');
    console.log('');
}
// Handle CLI commands
const args = process.argv.slice(2);
// Token generation command
if (args.includes('--generate-token')) {
    const newToken = generateToken();
    console.log('🔑 Generated Bearer Token:');
    console.log('');
    console.log(`   ${newToken}`);
    console.log('');
    console.log('💡 Usage Options:');
    console.log('');
    console.log('1. Set as environment variable:');
    console.log(`   export MCP_BEARER_TOKEN=${newToken}`);
    console.log('   npx mcp-cisco-support --http');
    console.log('');
    console.log('2. Use in HTTP requests:');
    console.log(`   curl -H "Authorization: Bearer ${newToken}" http://localhost:3000/mcp`);
    console.log('');
    console.log('3. Add to .env file:');
    console.log(`   echo "MCP_BEARER_TOKEN=${newToken}" >> .env`);
    console.log('');
    process.exit(0);
}
// Help command
if (args.includes('--help') || args.includes('-h')) {
    console.log(`MCP Cisco Support Server v${VERSION}`);
    console.log('');
    console.log('Usage:');
    console.log('  npx mcp-cisco-support [options]');
    console.log('');
    console.log('Options:');
    console.log('  --http, --sse        Start HTTP server mode (default: stdio)');
    console.log('  --generate-token     Generate a new Bearer token');
    console.log('  --token-help         Show token management commands');
    console.log('  --help, -h           Show this help message');
    console.log('  --version, -v        Show version number');
    console.log('');
    console.log('Environment Variables:');
    console.log('  CISCO_CLIENT_ID           Cisco API client ID (required)');
    console.log('  CISCO_CLIENT_SECRET       Cisco API client secret (required)');
    console.log('  SUPPORT_API               Enabled APIs: bug,case,eox or all (default: bug)');
    console.log('  AUTH_TYPE                 Auth type: bearer (default) or oauth2.1');
    console.log('  MCP_BEARER_TOKEN          Custom Bearer token (for bearer auth)');
    console.log('  OAUTH2_ISSUER_URL         OAuth 2.1 issuer URL (for oauth2.1 auth)');
    console.log('  DANGEROUSLY_OMIT_AUTH     Set to "true" to disable HTTP auth');
    console.log('  PORT                      HTTP server port (default: 3000)');
    console.log('');
    console.log('Examples:');
    console.log('  npx mcp-cisco-support                    # Start in stdio mode');
    console.log('  npx mcp-cisco-support --http             # Start HTTP server');
    console.log('  npx mcp-cisco-support --generate-token   # Generate Bearer token');
    console.log('');
    process.exit(0);
}
// Token help command
if (args.includes('--token-help')) {
    showTokenCommands();
    process.exit(0);
}
// Version command
if (args.includes('--version') || args.includes('-v')) {
    console.log(VERSION);
    process.exit(0);
}
// Determine mode from command line arguments
const isHttpMode = args.includes('--http') || args.includes('--sse');
const isStdioMode = !isHttpMode;
// Configure logging based on mode
(0, mcp_server_js_1.setLogging)(!isStdioMode);
// Main function
async function main() {
    try {
        console.error('[MCP DEBUG] Main function started');
        const args = process.argv.slice(2);
        console.error('[MCP DEBUG] Args:', args);
        const isHTTP = args.includes('--http') || args.includes('--sse');
        console.error('[MCP DEBUG] Mode:', isHTTP ? 'HTTP' : 'STDIO');
        if (isHTTP) {
            // Run as SSE HTTP server
            const PORT = process.env.PORT || 3000;
            const sseServer = (0, sse_server_js_1.createSSEServer)(mcp_server_js_1.mcpServer);
            // Graceful shutdown handling
            const cleanup = () => {
                mcp_server_js_1.logger.info('Shutting down gracefully');
                process.exit(0);
            };
            process.on('SIGTERM', cleanup);
            process.on('SIGINT', cleanup);
            sseServer.listen(PORT, () => {
                mcp_server_js_1.logger.info(`Cisco Support MCP SSE Server started on port ${PORT}`, {
                    environment: process.env.NODE_ENV || 'development',
                    version: VERSION,
                    mode: 'sse-http'
                });
            });
        }
        else {
            // Run as MCP server over stdio (default)
            console.error('[MCP DEBUG] Starting stdio mode');
            mcp_server_js_1.logger.info('Starting Cisco Support MCP Server in stdio mode');
            console.error('[MCP DEBUG] Creating StdioServerTransport');
            const transport = new stdio_js_1.StdioServerTransport();
            console.error('[MCP DEBUG] Connecting to transport');
            await mcp_server_js_1.mcpServer.connect(transport);
            console.error('[MCP DEBUG] Connected successfully');
            mcp_server_js_1.logger.info('Cisco Support MCP Server connected via stdio');
        }
    }
    catch (error) {
        console.error('[MCP DEBUG] Error in main:', error);
        throw error;
    }
}
// Run main function
console.error('[MCP DEBUG] About to call main()');
main().catch((error) => {
    console.error('[MCP DEBUG] main() threw error:', error);
    console.error('Failed to start server:', error);
    process.exit(1);
});
console.error('[MCP DEBUG] main() called (async)');
//# sourceMappingURL=index.js.map