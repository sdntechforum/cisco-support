"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RmaApi = void 0;
const base_api_js_1 = require("./base-api.js");
class RmaApi extends base_api_js_1.BaseApi {
    baseUrl = 'https://apix.cisco.com/return/v1.0';
    apiName = 'RMA';
    getTools() {
        return [
            {
                name: 'get_rma_details',
                description: 'Get detailed information for a specific RMA (Return Material Authorization) number. Returns comprehensive RMA details including status, return reason, product information, tracking, and associated case number.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        rma_number: {
                            type: 'string',
                            description: 'RMA number to look up (e.g., "84894022"). RMA numbers are typically 8-digit numeric values.',
                            pattern: '^[0-9A-Z\\-]+$'
                        }
                    },
                    required: ['rma_number']
                }
            },
            {
                name: 'get_rmas_by_user',
                description: 'Get list of RMAs associated with a specific user ID. Returns RMAs for the specified user, by default from the last 30 days. Maximum date range is 90 days.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        user_id: {
                            type: 'string',
                            description: 'Cisco user ID (email or user identifier)',
                            pattern: '^[A-Za-z0-9@.\\-_]+$'
                        },
                        from_date: {
                            type: 'string',
                            description: 'Start date for RMA search in ISO 8601 format (e.g., "2023-01-01T00:00:00Z"). Maximum 90 days range.',
                            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
                        },
                        to_date: {
                            type: 'string',
                            description: 'End date for RMA search in ISO 8601 format (e.g., "2023-03-31T23:59:59Z"). Maximum 90 days from from_date.',
                            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
                        },
                        status: {
                            type: 'string',
                            description: 'Filter by RMA status (e.g., "Open", "Closed", "In Progress")',
                            enum: ['Open', 'Closed', 'In Progress', 'Cancelled']
                        },
                        page_index: {
                            type: 'integer',
                            description: 'Page number for pagination (starts at 1)',
                            minimum: 1,
                            default: 1
                        }
                    },
                    required: ['user_id']
                }
            },
            {
                name: 'search_rmas_by_serial',
                description: 'Search for RMAs associated with specific serial numbers. Returns RMA history for devices identified by their serial numbers.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serial_numbers: {
                            type: 'string',
                            description: 'Comma-separated list of serial numbers (e.g., "SAL09232Q0Z,FOC0903N5J9")',
                            pattern: '^[A-Za-z0-9,\\s]+$'
                        },
                        from_date: {
                            type: 'string',
                            description: 'Start date for RMA search in ISO 8601 format (e.g., "2023-01-01T00:00:00Z")',
                            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
                        },
                        to_date: {
                            type: 'string',
                            description: 'End date for RMA search in ISO 8601 format (e.g., "2023-03-31T23:59:59Z")',
                            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
                        },
                        page_index: {
                            type: 'integer',
                            description: 'Page number for pagination (starts at 1)',
                            minimum: 1,
                            default: 1
                        }
                    },
                    required: ['serial_numbers']
                }
            }
        ];
    }
    async executeTool(name, args, meta) {
        const { tool, processedArgs } = this.validateTool(name, args);
        switch (name) {
            case 'get_rma_details': {
                const rmaNumber = processedArgs.rma_number;
                const endpoint = `/returns/rma_numbers/${rmaNumber}`;
                return await this.makeApiCall(endpoint);
            }
            case 'get_rmas_by_user': {
                const userId = processedArgs.user_id;
                const endpoint = `/returns/user_ids/${userId}`;
                const params = {
                    page_index: processedArgs.page_index
                };
                if (processedArgs.from_date) {
                    params.from_date = processedArgs.from_date;
                }
                if (processedArgs.to_date) {
                    params.to_date = processedArgs.to_date;
                }
                if (processedArgs.status) {
                    params.status = processedArgs.status;
                }
                return await this.makeApiCall(endpoint, params);
            }
            case 'search_rmas_by_serial': {
                const serialNumbers = processedArgs.serial_numbers
                    .split(',')
                    .map(s => s.trim())
                    .join(',');
                const endpoint = `/returns/serial_numbers/${serialNumbers}`;
                const params = {
                    page_index: processedArgs.page_index
                };
                if (processedArgs.from_date) {
                    params.from_date = processedArgs.from_date;
                }
                if (processedArgs.to_date) {
                    params.to_date = processedArgs.to_date;
                }
                return await this.makeApiCall(endpoint, params);
            }
            default:
                throw new Error(`Unknown RMA API tool: ${name}`);
        }
    }
    getResultCount(data) {
        const rmaData = data;
        if (rmaData.returns && Array.isArray(rmaData.returns)) {
            return rmaData.returns.length;
        }
        return 0;
    }
}
exports.RmaApi = RmaApi;
//# sourceMappingURL=rma-api.js.map