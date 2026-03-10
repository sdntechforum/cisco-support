"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRegistry = exports.SUPPORTED_APIS = void 0;
exports.setCurrentRequestScopes = setCurrentRequestScopes;
exports.getCurrentRequestScopes = getCurrentRequestScopes;
exports.getEnabledAPIs = getEnabledAPIs;
exports.createApiRegistry = createApiRegistry;
const base_api_js_1 = require("./base-api.js");
const bug_api_js_1 = require("./bug-api.js");
const case_api_js_1 = require("./case-api.js");
const eox_api_js_1 = require("./eox-api.js");
const psirt_api_js_1 = require("./psirt-api.js");
const product_api_js_1 = require("./product-api.js");
const software_api_js_1 = require("./software-api.js");
const enhanced_analysis_api_js_1 = require("./enhanced-analysis-api.js");
const serial_api_js_1 = require("./serial-api.js");
const rma_api_js_1 = require("./rma-api.js");
const smart_bonding_api_js_1 = require("./smart-bonding-api.js");
const sampling_tools_js_1 = require("./sampling-tools.js");
const oauth2_js_1 = require("../oauth2.js");
exports.SUPPORTED_APIS = ['psirt', 'bug', 'case', 'eox', 'product', 'serial', 'rma', 'software', 'enhanced_analysis', 'smart_bonding', 'sampling'];
// Placeholder API class for unimplemented APIs
class PlaceholderApi extends base_api_js_1.BaseApi {
    baseUrl = '';
    apiName;
    constructor(apiName) {
        super();
        this.apiName = apiName;
    }
    getTools() {
        return [
            {
                name: `${this.apiName.toLowerCase()}_placeholder`,
                description: `⚠️ ${this.apiName} API not yet implemented. Please use Bug API tools instead for related searches.`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: `This is a placeholder - ${this.apiName} API is not yet implemented`
                        }
                    },
                    required: []
                }
            }
        ];
    }
    async executeTool(name, args, meta) {
        return {
            error: `${this.apiName} API Not Implemented`,
            message: `The Cisco ${this.apiName} API is not yet implemented in this MCP server. Currently, only the Bug and Case APIs are available.`,
            alternatives: [
                'Use search_bugs_by_keyword to find bugs related to your topic',
                'Use search_bugs_by_product_id if you have a specific product ID',
                'Use get_case_details if you have a case ID to investigate'
            ],
            example: `Try: "Search for bugs related to your ${this.apiName.toLowerCase()} topic with keyword search"`,
            available_apis: ['bug', 'case'],
            planned_apis: ['eox', 'product', 'serial', 'rma', 'software', 'asd']
        };
    }
}
// Module-level variable to store current request's OAuth scopes
// This is set by the SSE/HTTP transport layer before handling MCP requests
let currentRequestScopes;
/**
 * Set the OAuth scopes for the current request
 * Called by HTTP transport before handling MCP requests
 */
function setCurrentRequestScopes(scopes) {
    currentRequestScopes = scopes;
}
/**
 * Get the OAuth scopes for the current request
 */
function getCurrentRequestScopes() {
    return currentRequestScopes;
}
// API registry
class ApiRegistry {
    apis = new Map();
    enabledApis = [];
    mcpServer;
    constructor(enabledApis, mcpServer) {
        this.enabledApis = enabledApis;
        this.mcpServer = mcpServer;
        this.initializeApis();
    }
    initializeApis() {
        // Initialize implemented APIs
        this.apis.set('bug', new bug_api_js_1.BugApi());
        this.apis.set('case', new case_api_js_1.CaseApi());
        this.apis.set('eox', new eox_api_js_1.EoxApi());
        this.apis.set('psirt', new psirt_api_js_1.PsirtApi());
        this.apis.set('product', new product_api_js_1.ProductApi());
        this.apis.set('software', new software_api_js_1.SoftwareApi());
        this.apis.set('serial', new serial_api_js_1.SerialApi());
        this.apis.set('rma', new rma_api_js_1.RmaApi());
        this.apis.set('enhanced_analysis', new enhanced_analysis_api_js_1.EnhancedAnalysisApi());
        this.apis.set('smart_bonding', new smart_bonding_api_js_1.SmartBondingApi()); // Cast needed due to different base class
    }
    // Get all tools from enabled APIs
    // In OAuth mode, filters based on current request scopes
    getAvailableTools() {
        // In OAuth 2.1 mode, filter tools based on current request scopes
        let apisToUse = this.enabledApis;
        if (process.env.AUTH_TYPE === 'oauth2.1' && currentRequestScopes) {
            apisToUse = getEnabledAPIs(currentRequestScopes);
        }
        const availableTools = [];
        for (const apiName of apisToUse) {
            // Handle sampling tools specially (they're not in the apis map)
            if (apiName === 'sampling') {
                availableTools.push(...sampling_tools_js_1.samplingTools);
                continue;
            }
            const api = this.apis.get(apiName);
            if (api) {
                const apiTools = api.getTools();
                availableTools.push(...apiTools);
            }
        }
        return availableTools;
    }
    // Execute a tool call
    async executeTool(name, args, meta) {
        // Check if this is a sampling tool
        if (this.enabledApis.includes('sampling')) {
            const samplingTool = sampling_tools_js_1.samplingTools.find(t => t.name === name);
            if (samplingTool && this.mcpServer) {
                // Get cisco auth from bug API for any tools that need it
                const bugApi = this.apis.get('bug');
                const ciscoAuth = bugApi ? bugApi.ciscoAuth : null;
                const result = await (0, sampling_tools_js_1.handleSamplingTool)(this.mcpServer, name, args, ciscoAuth);
                return { result, apiName: 'sampling' };
            }
        }
        // Find which API owns this tool
        for (const apiName of this.enabledApis) {
            const api = this.apis.get(apiName);
            if (api) {
                const tools = api.getTools();
                const tool = tools.find(t => t.name === name);
                if (tool) {
                    const result = await api.executeTool(name, args, meta);
                    return { result, apiName };
                }
            }
        }
        // If tool not found in advertised tools, try calling it anyway
        // This allows APIs with internal tools (like enhanced_analysis) to handle them
        for (const apiName of this.enabledApis) {
            const api = this.apis.get(apiName);
            if (api) {
                try {
                    const result = await api.executeTool(name, args, meta);
                    return { result, apiName };
                }
                catch (error) {
                    // If this API doesn't have the tool, try the next one
                    if (error instanceof Error && (error.message.includes('not available') ||
                        error.message.includes('Tool implementation not found') ||
                        error.message.includes('Unknown tool'))) {
                        continue;
                    }
                    // If it's a different error, re-throw it
                    throw error;
                }
            }
        }
        throw new Error(`Unknown tool: ${name}`);
    }
    // Get enabled API names
    getEnabledApis() {
        return [...this.enabledApis];
    }
    // Check if an API is enabled
    isApiEnabled(apiName) {
        return this.enabledApis.includes(apiName);
    }
}
exports.ApiRegistry = ApiRegistry;
// Get enabled APIs from environment or OAuth scopes
function getEnabledAPIs(oauthScopes) {
    // In OAuth 2.1 mode, enable ALL APIs at startup
    // Per-request filtering will be done based on OAuth token scopes
    if (process.env.AUTH_TYPE === 'oauth2.1' && !oauthScopes) {
        // Enable all APIs so the registry has all tools available
        // The tools/list handler will filter based on actual OAuth scopes
        return exports.SUPPORTED_APIS;
    }
    // If oauthScopes provided, convert scopes to APIs (per-request filtering)
    if (oauthScopes && process.env.AUTH_TYPE === 'oauth2.1') {
        const enabledApis = (0, oauth2_js_1.scopesToEnabledAPIs)(oauthScopes);
        return enabledApis;
    }
    // Fallback to environment variable for non-OAuth modes
    const supportApiEnv = process.env.SUPPORT_API || 'bug';
    const lowerEnv = supportApiEnv.toLowerCase();
    // Handle 'all' or 'all,something' patterns
    if (lowerEnv === 'all' || lowerEnv.startsWith('all,')) {
        const baseApis = exports.SUPPORTED_APIS.filter(api => api !== 'enhanced_analysis' && api !== 'smart_bonding' && api !== 'sampling');
        // If it's "all,sampling" or "all,xyz", add the additional APIs
        if (lowerEnv.includes(',')) {
            const additionalApis = lowerEnv.split(',')
                .slice(1) // Skip 'all'
                .map(api => api.trim())
                .filter(api => exports.SUPPORTED_APIS.includes(api));
            return [...baseApis, ...additionalApis];
        }
        return baseApis;
    }
    if (lowerEnv === 'enhanced_analysis') {
        return ['enhanced_analysis']; // Only return enhanced analysis tools
    }
    const requestedAPIs = lowerEnv.split(',').map(api => api.trim());
    return requestedAPIs.filter(api => exports.SUPPORTED_APIS.includes(api));
}
// Create API registry instance
function createApiRegistry(mcpServer, oauthScopes) {
    const enabledApis = getEnabledAPIs(oauthScopes);
    return new ApiRegistry(enabledApis, mcpServer);
}
//# sourceMappingURL=index.js.map