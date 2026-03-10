"use strict";
/**
 * MCP Sampling Utilities
 *
 * Provides helper functions for server-initiated LLM requests through MCP sampling.
 * Allows the server to leverage AI capabilities without requiring API keys.
 *
 * Note: Sampling requires client support - check client capabilities before use.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientSupportsSampling = clientSupportsSampling;
exports.requestSampling = requestSampling;
exports.resolveProductName = resolveProductName;
exports.categorizeBug = categorizeBug;
exports.analyzeUpgradeRisk = analyzeUpgradeRisk;
exports.summarizeBugs = summarizeBugs;
exports.extractProductQuery = extractProductQuery;
const logger_js_1 = require("./logger.js");
/**
 * Check if the client supports sampling
 */
function clientSupportsSampling(server) {
    const capabilities = server.getClientCapabilities();
    return capabilities?.sampling !== undefined;
}
/**
 * Request LLM completion from the client via sampling
 *
 * @param server - MCP Server instance
 * @param options - Sampling request options
 * @returns The LLM response text
 * @throws Error if client doesn't support sampling
 */
async function requestSampling(server, options) {
    // Check if client supports sampling
    if (!clientSupportsSampling(server)) {
        throw new Error('Client does not support sampling. This feature requires an MCP client with sampling capability.');
    }
    logger_js_1.logger.info('Requesting LLM sampling from client', {
        messageLength: options.message.length,
        hasSystemPrompt: !!options.systemPrompt,
        maxTokens: options.maxTokens || 1000
    });
    try {
        // Build the messages array
        const messages = [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: options.message
                }
            }
        ];
        // Prepare sampling parameters
        const params = {
            messages,
            maxTokens: options.maxTokens || 1000,
            ...(options.systemPrompt && { systemPrompt: options.systemPrompt }),
            ...(options.temperature !== undefined && { temperature: options.temperature }),
            ...(options.modelPreferences && { modelPreferences: options.modelPreferences })
        };
        // Request completion from client
        const response = await server.createMessage(params);
        // Extract text from response
        const content = response.content;
        if (content.type === 'text') {
            logger_js_1.logger.info('Sampling completed successfully', {
                model: response.model,
                stopReason: response.stopReason,
                responseLength: content.text.length
            });
            return content.text;
        }
        throw new Error(`Unexpected content type from sampling: ${content.type}`);
    }
    catch (error) {
        logger_js_1.logger.error('Sampling request failed', { error });
        throw error;
    }
}
/**
 * Request intelligent product name resolution
 * Converts natural language product descriptions to product IDs
 *
 * @example
 * resolveProductName(server, "Catalyst 9200 24-port switch")
 * // Returns: "C9200-24P"
 */
async function resolveProductName(server, productDescription) {
    const systemPrompt = `You are a Cisco product identification expert. Given a product description,
return ONLY the exact Cisco product ID (e.g., "C9200-24P", "ISR4431", "ASA5516-X").
If you cannot identify the exact product, respond with "UNKNOWN".
Do not include any explanation, just the product ID or "UNKNOWN".`;
    const message = `What is the Cisco product ID for: ${productDescription}`;
    const result = await requestSampling(server, {
        message,
        systemPrompt,
        maxTokens: 50,
        modelPreferences: {
            speedPriority: 0.8, // Fast response
            costPriority: 0.7, // Keep costs low
            intelligencePriority: 0.5 // Moderate intelligence needed
        },
        temperature: 0.1 // Low temperature for deterministic results
    });
    return result.trim();
}
/**
 * Categorize bug severity and impact using LLM analysis
 *
 * @example
 * categorizeBug(server, bugDescription)
 * // Returns: { severity: "high", impact: "network-outage", category: "routing" }
 */
async function categorizeBug(server, bugDescription) {
    const systemPrompt = `You are a Cisco bug analysis expert. Analyze the bug description and return a JSON object with:
- severity: "critical", "high", "medium", or "low"
- impact: brief description of the impact (e.g., "memory-leak", "crash", "performance-degradation")
- category: the functional area (e.g., "routing", "switching", "security", "voip")

Return ONLY valid JSON, no explanation.`;
    const message = `Analyze this bug: ${bugDescription}`;
    const result = await requestSampling(server, {
        message,
        systemPrompt,
        maxTokens: 200,
        modelPreferences: {
            intelligencePriority: 0.8, // Need good analysis
            speedPriority: 0.5,
            costPriority: 0.5
        },
        temperature: 0.2
    });
    try {
        return JSON.parse(result);
    }
    catch (error) {
        logger_js_1.logger.error('Failed to parse bug categorization', { result, error });
        return {
            severity: 'unknown',
            impact: 'unknown',
            category: 'unknown'
        };
    }
}
/**
 * Analyze software upgrade risk using LLM
 *
 * @example
 * analyzeUpgradeRisk(server, currentVersion, targetVersion, bugData)
 * // Returns: Detailed risk analysis and recommendations
 */
async function analyzeUpgradeRisk(server, productId, currentVersion, targetVersion, bugData) {
    const systemPrompt = `You are a Cisco software upgrade risk analysis expert.
Analyze the provided bug data and software versions to assess upgrade risk.
Provide a clear, concise risk assessment with specific recommendations.`;
    const message = `Analyze upgrade risk for:
Product: ${productId}
Current Version: ${currentVersion}
Target Version: ${targetVersion}

Bug Data:
${JSON.stringify(bugData, null, 2)}

Provide:
1. Risk Level (Low/Medium/High/Critical)
2. Key Issues to be aware of
3. Recommended action
4. Specific prerequisites or precautions`;
    const result = await requestSampling(server, {
        message,
        systemPrompt,
        maxTokens: 800,
        modelPreferences: {
            intelligencePriority: 0.9, // Need thorough analysis
            speedPriority: 0.3,
            costPriority: 0.3
        },
        temperature: 0.3
    });
    return result;
}
/**
 * Generate natural language summary of bug search results
 */
async function summarizeBugs(server, bugs, searchContext) {
    const systemPrompt = `You are a Cisco technical support expert.
Summarize the bug search results in clear, concise language highlighting the most important findings.
Focus on severity, impact, and actionable insights.`;
    const message = `Summarize these bugs for: ${searchContext}

${JSON.stringify(bugs.slice(0, 10), null, 2)}

Provide a concise summary with:
1. Overall findings (number of bugs, severity distribution)
2. Critical issues to address
3. Key recommendations`;
    const result = await requestSampling(server, {
        message,
        systemPrompt,
        maxTokens: 500,
        modelPreferences: {
            intelligencePriority: 0.7,
            speedPriority: 0.6,
            costPriority: 0.5
        },
        temperature: 0.4
    });
    return result;
}
/**
 * Extract structured product information from natural language query
 */
async function extractProductQuery(server, naturalQuery) {
    const systemPrompt = `You are a Cisco query parser. Extract structured information from natural language queries.
Return ONLY valid JSON with these optional fields:
- productId: Cisco product ID (e.g., "C9200-24P")
- productSeries: Product series name (e.g., "Cisco Catalyst 9200 Series")
- version: Software version (e.g., "17.9.1")
- severity: Severity level 1-6
- status: "O" (open), "F" (fixed), or "T" (terminated)
- keywords: Array of relevant search keywords

Return empty fields as null or omit them.`;
    const message = `Extract structured query from: "${naturalQuery}"`;
    const result = await requestSampling(server, {
        message,
        systemPrompt,
        maxTokens: 300,
        modelPreferences: {
            intelligencePriority: 0.7,
            speedPriority: 0.7,
            costPriority: 0.6
        },
        temperature: 0.2
    });
    try {
        return JSON.parse(result);
    }
    catch (error) {
        logger_js_1.logger.error('Failed to parse product query', { result, error });
        return {};
    }
}
//# sourceMappingURL=sampling.js.map