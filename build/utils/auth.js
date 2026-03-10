"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWithCisco = authenticateWithCisco;
exports.getValidToken = getValidToken;
exports.resetToken = resetToken;
const logger_js_1 = require("./logger.js");
// Global variables for OAuth2 token management
let accessToken = null;
let tokenExpiry = null;
const TOKEN_REFRESH_MARGIN = 30 * 60 * 1000; // 30 minutes in milliseconds
// OAuth2 authentication
async function authenticateWithCisco() {
    const { CISCO_CLIENT_ID, CISCO_CLIENT_SECRET } = process.env;
    if (!CISCO_CLIENT_ID || !CISCO_CLIENT_SECRET) {
        throw new Error('Missing Cisco API credentials in environment variables');
    }
    const tokenUrl = 'https://id.cisco.com/oauth2/default/v1/token';
    const credentials = Buffer.from(`${CISCO_CLIENT_ID}:${CISCO_CLIENT_SECRET}`).toString('base64');
    try {
        logger_js_1.logger.info('Requesting OAuth2 token from Cisco');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for auth
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: 'grant_type=client_credentials',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OAuth2 authentication failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const tokenData = await response.json();
        if (!tokenData.access_token) {
            throw new Error('No access token received from Cisco OAuth2 API');
        }
        // Calculate token expiry (default 12 hours if not provided)
        const expiresIn = tokenData.expires_in || 43200; // 12 hours default
        tokenExpiry = Date.now() + (expiresIn * 1000);
        accessToken = tokenData.access_token;
        logger_js_1.logger.info('Successfully obtained OAuth2 token', {
            expiresIn: expiresIn,
            expiryTime: new Date(tokenExpiry).toISOString()
        });
        return accessToken;
    }
    catch (error) {
        // Handle specific timeout errors
        if (error instanceof Error) {
            if (error.name === 'AbortError' || error.message.includes('timeout')) {
                logger_js_1.logger.error('OAuth2 authentication timed out', { timeout: '30s' });
                throw new Error(`OAuth2 authentication timed out after 30 seconds. Cisco's authentication service may be experiencing issues.`);
            }
            else if (error.message.includes('Headers Timeout') || error.message.includes('UND_ERR_HEADERS_TIMEOUT')) {
                logger_js_1.logger.error('OAuth2 headers timeout');
                throw new Error(`OAuth2 authentication connection timed out. Cisco's authentication service may be temporarily unavailable.`);
            }
        }
        logger_js_1.logger.error('OAuth2 authentication failed', error);
        throw error;
    }
}
// Get valid access token, refreshing if necessary
async function getValidToken() {
    const now = Date.now();
    // Check if token exists and is not expired (with margin)
    if (accessToken && tokenExpiry && (tokenExpiry - now) > TOKEN_REFRESH_MARGIN) {
        return accessToken;
    }
    logger_js_1.logger.info('Token expired or missing, refreshing...');
    return await authenticateWithCisco();
}
// Reset token (for testing or manual refresh)
function resetToken() {
    accessToken = null;
    tokenExpiry = null;
}
//# sourceMappingURL=auth.js.map