"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.setLogging = setLogging;
// Logger implementation - can be controlled externally
let loggingEnabled = true;
exports.logger = {
    info: (message, data) => {
        if (loggingEnabled) {
            const timestamp = new Date().toISOString();
            const logEntry = { timestamp, level: 'info', message, ...(data && { data }) };
            console.error(JSON.stringify(logEntry));
        }
    },
    error: (message, data) => {
        if (loggingEnabled) {
            const timestamp = new Date().toISOString();
            const logEntry = { timestamp, level: 'error', message, ...(data && { data }) };
            console.error(JSON.stringify(logEntry));
        }
    },
    warn: (message, data) => {
        if (loggingEnabled) {
            const timestamp = new Date().toISOString();
            const logEntry = { timestamp, level: 'warn', message, ...(data && { data }) };
            console.warn(JSON.stringify(logEntry));
        }
    }
};
// Control logging externally
function setLogging(enabled) {
    loggingEnabled = enabled;
}
//# sourceMappingURL=logger.js.map