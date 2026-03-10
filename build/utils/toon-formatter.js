"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToToonFormat = convertToToonFormat;
exports.bugResponseToToon = bugResponseToToon;
exports.caseResponseToToon = caseResponseToToon;
exports.eoxResponseToToon = eoxResponseToToon;
exports.shouldUseToonFormat = shouldUseToonFormat;
exports.getFormatDescription = getFormatDescription;
const toon_1 = require("@toon-format/toon");
/**
 * Convert API responses to TOON format
 * TOON (Text Object-Oriented Notation) provides a more readable and structured output
 */
function convertToToonFormat(data, apiType) {
    try {
        // Use the TOON library to encode the data into TOON format
        const toonOutput = (0, toon_1.encode)(data, {
            indent: 2, // Use 2-space indentation for readability
        });
        return toonOutput;
    }
    catch (error) {
        // Fallback to JSON if TOON formatting fails
        console.error('TOON formatting error:', error);
        return JSON.stringify(data, null, 2);
    }
}
/**
 * Convert bug API response to TOON format
 */
function bugResponseToToon(data) {
    return convertToToonFormat(data, 'bug');
}
/**
 * Convert case API response to TOON format
 */
function caseResponseToToon(data) {
    return convertToToonFormat(data, 'case');
}
/**
 * Convert EoX API response to TOON format
 */
function eoxResponseToToon(data) {
    return convertToToonFormat(data, 'eox');
}
/**
 * Determine if TOON format should be used based on environment variable
 * Defaults to true (TOON enabled) unless explicitly disabled
 */
function shouldUseToonFormat() {
    const toonDisabled = process.env.DISABLE_TOON_FORMAT?.toLowerCase() === 'true';
    return !toonDisabled;
}
/**
 * Get format description for logging/debugging
 */
function getFormatDescription() {
    return shouldUseToonFormat() ? 'TOON' : 'JSON';
}
//# sourceMappingURL=toon-formatter.js.map