"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartBondingBaseApi = void 0;
const smart_bonding_auth_js_1 = require("../utils/smart-bonding-auth.js");
const logger_js_1 = require("../utils/logger.js");
const validation_js_1 = require("../utils/validation.js");
/**
 * ⚠️ EXPERIMENTAL: Smart Bonding Base API
 *
 * Base class for Smart Bonding API tools with separate authentication system.
 * Uses different OAuth2 endpoint (cloudsso.cisco.com) than standard Support APIs.
 *
 * Status: UNTESTED - Requires Smart Bonding credentials from Cisco Account Manager
 */
class SmartBondingBaseApi {
    baseUrl;
    apiName = 'Smart Bonding';
    constructor() {
        // Environment-based URL (staging vs production)
        const env = process.env.SMART_BONDING_ENV || 'production';
        this.baseUrl = env === 'staging'
            ? 'https://stage.sbnprd.xylem.cisco.com/sb-partner-oauth-proxy-api/rest/v1'
            : 'https://sb.xylem.cisco.com/sb-partner-oauth-proxy-api/rest/v1';
        logger_js_1.logger.info(`Smart Bonding API initialized`, {
            environment: env,
            baseUrl: this.baseUrl,
            status: 'EXPERIMENTAL/UNTESTED'
        });
    }
    /**
     * Make authenticated API call to Smart Bonding endpoint
     * Supports both GET and POST methods (unlike standard Support APIs)
     */
    async makeApiCall(endpoint, method = 'GET', body, params = {}, correlationId) {
        const token = await (0, smart_bonding_auth_js_1.getValidSmartBondingToken)();
        // Build query string for GET requests
        const queryParams = new URLSearchParams();
        if (method === 'GET') {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, String(value));
                }
            });
        }
        const queryString = queryParams.toString();
        const url = `${this.baseUrl}${endpoint}${queryString ? '?' + queryString : ''}`;
        try {
            logger_js_1.logger.info(`Making Smart Bonding API call [EXPERIMENTAL]`, {
                method,
                endpoint,
                params,
                fullUrl: url,
                hasBody: !!body,
                correlationId: correlationId || '(none)'
            });
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'User-Agent': 'mcp-cisco-support/1.0-smart-bonding-experimental'
            };
            // Add correlation ID header if provided
            if (correlationId) {
                headers['x-correlation-id'] = correlationId;
            }
            // Add Content-Type for POST requests
            if (method === 'POST' && body) {
                headers['Content-Type'] = 'application/json';
            }
            const fetchOptions = {
                method,
                headers,
                signal: controller.signal
            };
            // Add body for POST requests
            if (method === 'POST' && body) {
                fetchOptions.body = JSON.stringify(body);
            }
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            if (response.status === 401) {
                logger_js_1.logger.warn('Smart Bonding API returned 401, token may be expired, refreshing...');
                // Token expired, refresh and retry once
                const newToken = await (0, smart_bonding_auth_js_1.getValidSmartBondingToken)();
                const retryController = new AbortController();
                const retryTimeoutId = setTimeout(() => retryController.abort(), 60000);
                const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
                const retryOptions = { ...fetchOptions, signal: retryController.signal, headers: retryHeaders };
                const retryResponse = await fetch(url, retryOptions);
                clearTimeout(retryTimeoutId);
                if (!retryResponse.ok) {
                    const errorText = await retryResponse.text();
                    logger_js_1.logger.error('Smart Bonding API call failed after token refresh', {
                        status: retryResponse.status,
                        errorText: errorText.substring(0, 500)
                    });
                    throw new Error(`Smart Bonding API call failed after token refresh: ${retryResponse.status} ${retryResponse.statusText} - ${errorText}`);
                }
                const retryData = await retryResponse.json();
                return retryData;
            }
            if (!response.ok) {
                const errorText = await response.text();
                logger_js_1.logger.error(`Smart Bonding API call failed`, {
                    status: response.status,
                    statusText: response.statusText,
                    url: url,
                    method,
                    errorText: errorText.substring(0, 500)
                });
                throw new Error(`Smart Bonding API call failed: ${response.status} ${response.statusText} - URL: ${url} - ${errorText}`);
            }
            const data = await response.json();
            logger_js_1.logger.info(`Smart Bonding API call successful`, {
                endpoint,
                method,
                resultCount: this.getResultCount(data)
            });
            return data;
        }
        catch (error) {
            // Handle specific timeout errors
            if (error instanceof Error) {
                if (error.name === 'AbortError' || error.message.includes('timeout')) {
                    logger_js_1.logger.error(`Smart Bonding API call timed out`, { endpoint, method, timeout: '60s' });
                    throw new Error(`Smart Bonding API call timed out after 60 seconds. The API may be experiencing high load. Please try again later.`);
                }
                else if (error.message.includes('Headers Timeout') || error.message.includes('UND_ERR_HEADERS_TIMEOUT')) {
                    logger_js_1.logger.error(`Smart Bonding API headers timeout`, { endpoint, method });
                    throw new Error(`Smart Bonding API connection timed out while waiting for response headers. The service may be temporarily unavailable.`);
                }
            }
            logger_js_1.logger.error(`Smart Bonding API call failed`, { endpoint, method, error: error instanceof Error ? error.message : error });
            throw error;
        }
    }
    // Validate tool arguments
    validateTool(name, args) {
        const tools = this.getTools();
        const tool = tools.find(t => t.name === name);
        if (!tool) {
            throw new Error(`Unknown Smart Bonding tool: ${name}`);
        }
        (0, validation_js_1.validateToolArgs)(tool, args);
        const processedArgs = (0, validation_js_1.setDefaultValues)(args);
        return { tool, processedArgs };
    }
    // Get result count from API response
    getResultCount(data) {
        if ('tickets' in data && Array.isArray(data.tickets)) {
            return data.tickets.length;
        }
        if ('status' in data && data.status === 'success') {
            return 1; // Single operation success
        }
        return 0;
    }
}
exports.SmartBondingBaseApi = SmartBondingBaseApi;
//# sourceMappingURL=smart-bonding-base-api.js.map