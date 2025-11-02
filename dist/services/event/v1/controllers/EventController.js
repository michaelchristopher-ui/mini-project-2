"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
class EventController {
    constructor(eventsRepo) {
        this.eventsRepo = eventsRepo;
    }
    GetEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Parse query parameters
                const { start_date, category } = req.query;
                let startDateFilter;
                // Validate and parse start_date query parameter
                if (start_date) {
                    if (typeof start_date !== 'string') {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'start_date query parameter must be a string'
                        });
                        return;
                    }
                    const parsedDate = new Date(start_date);
                    if (isNaN(parsedDate.getTime())) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Invalid start_date format. Please use ISO 8601 format (e.g., 2025-11-01T00:00:00Z)'
                        });
                        return;
                    }
                    startDateFilter = parsedDate;
                }
                if (category) {
                    if (typeof category !== 'string' || isNaN(Number(category))) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'category query parameter must be a number'
                        });
                        return;
                    }
                }
                const categoryFilter = category ? Number(category) : undefined;
                const events = yield this.eventsRepo.GetEvents(startDateFilter, categoryFilter);
                const filterInfo = {};
                if (startDateFilter)
                    filterInfo.start_date = startDateFilter.toISOString();
                if (categoryFilter)
                    filterInfo.category_id = categoryFilter;
                res.status(200).json({
                    success: true,
                    data: events,
                    message: `Events retrieved successfully${Object.keys(filterInfo).length > 0 ? ` (filtered)` : ''}`,
                    filters: Object.keys(filterInfo).length > 0 ? filterInfo : null
                });
            }
            catch (error) {
                console.error('Error in GetEvents controller:', error);
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve events'
                });
            }
        });
    }
    GetEventByUuid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get UUID from URL parameters
                const { uuid } = req.params;
                // Validate UUID parameter
                if (!uuid || typeof uuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'UUID parameter is required and must be a string'
                    });
                    return;
                }
                // Basic UUID format validation (36 characters with hyphens)
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(uuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                const event = yield this.eventsRepo.GetEventByUuid(uuid);
                if (!event) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Event not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: event,
                    message: 'Event retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetEventByUuid controller:', error);
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve event'
                });
            }
        });
    }
    CreateEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventData = req.body;
                // Validate required fields
                if (!eventData.name || typeof eventData.name !== 'string' || eventData.name.trim() === '') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Event name is required and must be a non-empty string'
                    });
                    return;
                }
                if (!eventData.start_date || typeof eventData.start_date !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Start date is required and must be a string in ISO format'
                    });
                    return;
                }
                if (!eventData.available_seats || typeof eventData.available_seats !== 'number' || eventData.available_seats <= 0) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Available seats is required and must be a positive number'
                    });
                    return;
                }
                // Validate start_date format
                const startDate = new Date(eventData.start_date);
                if (isNaN(startDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid start_date format. Please use ISO 8601 format'
                    });
                    return;
                }
                // Validate end_date format if provided
                if (eventData.end_date) {
                    const endDate = new Date(eventData.end_date);
                    if (isNaN(endDate.getTime())) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Invalid end_date format. Please use ISO 8601 format'
                        });
                        return;
                    }
                    // Check that end_date is after start_date
                    if (endDate <= startDate) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'End date must be after start date'
                        });
                        return;
                    }
                }
                // Validate category_id if provided
                if (eventData.category_id !== undefined) {
                    if (typeof eventData.category_id !== 'number' || eventData.category_id <= 0) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Category ID must be a positive number'
                        });
                        return;
                    }
                }
                // Create the event
                const newEvent = yield this.eventsRepo.CreateEvent(eventData);
                res.status(201).json({
                    success: true,
                    data: newEvent,
                    message: 'Event created successfully'
                });
            }
            catch (error) {
                console.error('Error in CreateEvent controller:', error);
                // Check for specific database errors
                if (error instanceof Error && (error.message.includes('foreign key constraint') || error.message.includes('events_category_id_fkey'))) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid category ID: Category does not exist'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to create event'
                });
            }
        });
    }
    CreateTicket(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get event UUID from URL parameters
                const { uuid } = req.params;
                const ticketData = req.body;
                // Validate UUID parameter
                if (!uuid || typeof uuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Event UUID parameter is required and must be a string'
                    });
                    return;
                }
                // Basic UUID format validation
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(uuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                // Validate price field
                if (ticketData.price === undefined || ticketData.price === null || typeof ticketData.price !== 'number') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Price is required and must be a number'
                    });
                    return;
                }
                // Validate price is not negative
                if (ticketData.price < 0) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Price cannot be negative'
                    });
                    return;
                }
                // Create the ticket
                const newTicket = yield this.eventsRepo.CreateTicket(uuid, ticketData);
                res.status(201).json({
                    success: true,
                    data: newTicket,
                    message: 'Ticket created successfully'
                });
            }
            catch (error) {
                console.error('Error in CreateTicket controller:', error);
                // Check for specific errors
                if (error instanceof Error && error.message.includes('Event not found or inactive')) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Event not found or inactive'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to create ticket'
                });
            }
        });
    }
    GetVouchersByEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uuid } = req.params;
                // Validate UUID format
                if (!uuid || typeof uuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Event UUID is required'
                    });
                    return;
                }
                // Validate UUID format using regex
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(uuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                const vouchers = yield this.eventsRepo.GetVouchersByEvent(uuid);
                res.status(200).json({
                    success: true,
                    data: vouchers,
                    message: 'Vouchers retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetVouchersByEvent:', error);
                if (error instanceof Error && error.message === 'Event not found') {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Event not found'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve vouchers'
                });
            }
        });
    }
    CreateVoucher(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uuid } = req.params;
                // Validate UUID format
                if (!uuid || typeof uuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Event UUID is required'
                    });
                    return;
                }
                // Validate UUID format using regex
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(uuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                // Validate request body
                const { code, discount_type, discount_amount, max_uses, start_date, end_date } = req.body;
                if (!code || typeof code !== 'string' || code.trim() === '') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Voucher code is required and must be a non-empty string'
                    });
                    return;
                }
                if (!discount_type || !['percentage', 'fixed'].includes(discount_type)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'discount_type is required and must be "percentage" or "fixed"'
                    });
                    return;
                }
                if (!discount_amount || typeof discount_amount !== 'number' || discount_amount <= 0) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'discount_amount is required and must be a positive number'
                    });
                    return;
                }
                if (max_uses !== undefined && (typeof max_uses !== 'number' || max_uses <= 0)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'max_uses must be a positive number if provided'
                    });
                    return;
                }
                if (!start_date || typeof start_date !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'start_date is required and must be a valid ISO string'
                    });
                    return;
                }
                if (!end_date || typeof end_date !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'end_date is required and must be a valid ISO string'
                    });
                    return;
                }
                // Validate date formats
                const startDateObj = new Date(start_date);
                const endDateObj = new Date(end_date);
                if (isNaN(startDateObj.getTime())) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid start_date format. Please use ISO 8601 format'
                    });
                    return;
                }
                if (isNaN(endDateObj.getTime())) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid end_date format. Please use ISO 8601 format'
                    });
                    return;
                }
                // Validate date logic
                if (endDateObj <= startDateObj) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'end_date must be after start_date'
                    });
                    return;
                }
                const voucherData = {
                    code: code.trim(),
                    discount_type,
                    discount_amount,
                    max_uses,
                    start_date,
                    end_date
                };
                const newVoucher = yield this.eventsRepo.CreateVoucher(uuid, voucherData);
                res.status(201).json({
                    success: true,
                    data: newVoucher,
                    message: 'Voucher created successfully'
                });
            }
            catch (error) {
                console.error('Error in CreateVoucher:', error);
                if (error instanceof Error && error.message === 'Event not found or inactive') {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Event not found or inactive'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to create voucher'
                });
            }
        });
    }
    GetTransactionsByEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uuid } = req.params;
                // Validate UUID format
                if (!uuid || typeof uuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Event UUID is required'
                    });
                    return;
                }
                // Validate UUID format using regex
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(uuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                const transactions = yield this.eventsRepo.GetTransactionsByEvent(uuid);
                res.status(200).json({
                    success: true,
                    data: transactions,
                    message: 'Transactions retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetTransactionsByEvent:', error);
                if (error instanceof Error && error.message === 'Event not found') {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Event not found'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve transactions'
                });
            }
        });
    }
    GetTransactionByUuid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionUuid } = req.params;
                // Validate UUID format
                if (!transactionUuid || typeof transactionUuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Transaction UUID is required'
                    });
                    return;
                }
                // Validate UUID format using regex
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(transactionUuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                const transaction = yield this.eventsRepo.GetTransactionByUuid(transactionUuid);
                if (!transaction) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Transaction not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: transaction,
                    message: 'Transaction retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetTransactionByUuid:', error);
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve transaction'
                });
            }
        });
    }
    CreateTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request body
                const { event_id, created_by, ticket_ids } = req.body;
                if (!event_id || typeof event_id !== 'number') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'event_id is required and must be a number'
                    });
                    return;
                }
                if (!ticket_ids || typeof ticket_ids !== 'object' || Object.keys(ticket_ids).length === 0) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'ticket_ids is required and must be a non-empty object mapping ticket IDs to quantities'
                    });
                    return;
                }
                // Validate that all ticket_ids are numbers and quantities are positive integers
                for (const [ticketId, quantity] of Object.entries(ticket_ids)) {
                    if (isNaN(Number(ticketId)) || !Number.isInteger(Number(ticketId))) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'All ticket IDs must be valid integers'
                        });
                        return;
                    }
                    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'All quantities must be positive integers'
                        });
                        return;
                    }
                }
                if (created_by !== undefined && typeof created_by !== 'number') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'created_by must be a number if provided'
                    });
                    return;
                }
                const transactionData = {
                    event_id,
                    created_by,
                    ticket_ids
                };
                const newTransaction = yield this.eventsRepo.CreateTransaction(transactionData);
                res.status(201).json({
                    success: true,
                    data: newTransaction,
                    message: 'Transaction created successfully'
                });
            }
            catch (error) {
                console.error('Error in CreateTransaction:', error);
                const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error';
                // Check for specific error types to provide better error messages
                if (errorMessage.includes('Insufficient seats available')) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: errorMessage
                    });
                    return;
                }
                if (errorMessage.includes('Event not found')) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Event not found'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to create transaction'
                });
            }
        });
    }
    UpdateTransactionStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionUuid } = req.params;
                const { status, confirmed_by, confirmed_at } = req.body;
                // Validate UUID format
                if (!transactionUuid || typeof transactionUuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Transaction UUID is required'
                    });
                    return;
                }
                // Validate UUID format using regex
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(transactionUuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                // Validate status if provided
                if (status !== undefined && (typeof status !== 'number' || ![1, 2, 3, 4, 5, 6].includes(status))) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Status must be 1 (Waiting for Payment), 2 (Waiting for Confirmation), 3 (Completed), 4 (Expired), 5 (Canceled), or 6 (Rejected)'
                    });
                    return;
                }
                if (confirmed_by !== undefined && typeof confirmed_by !== 'number') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'confirmed_by must be a number if provided'
                    });
                    return;
                }
                if (confirmed_at !== undefined && typeof confirmed_at !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'confirmed_at must be a valid ISO string if provided'
                    });
                    return;
                }
                // Validate date format if confirmed_at is provided
                if (confirmed_at) {
                    const confirmedAtDate = new Date(confirmed_at);
                    if (isNaN(confirmedAtDate.getTime())) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Invalid confirmed_at format. Please use ISO 8601 format'
                        });
                        return;
                    }
                }
                // Fetch current transaction for validation and auto-confirmation logic
                let currentTransaction;
                try {
                    currentTransaction = yield this.eventsRepo.GetTransactionByUuid(transactionUuid);
                    if (!currentTransaction) {
                        res.status(404).json({
                            success: false,
                            data: null,
                            message: 'Transaction not found'
                        });
                        return;
                    }
                }
                catch (error) {
                    console.error('Error fetching transaction:', error);
                    res.status(500).json({
                        success: false,
                        data: null,
                        message: 'Internal server error while fetching transaction'
                    });
                    return;
                }
                // Validate status transition rules
                const currentStatus = currentTransaction.status;
                if (currentStatus === 4 || currentStatus === 5) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Cannot update expired (4) or canceled (5) transactions'
                    });
                    return;
                }
                if (status === 3 && currentStatus !== 2) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Can only complete transactions that are waiting for confirmation (status 2)'
                    });
                    return;
                }
                // Auto-set confirmation fields for completion (3) and rejection (6)
                let finalConfirmedBy = confirmed_by;
                let finalConfirmedAt = confirmed_at;
                if (status === 3 || status === 6) {
                    // For completion or rejection, automatically set confirmed_at to now if not provided
                    if (!finalConfirmedAt) {
                        finalConfirmedAt = new Date().toISOString();
                    }
                    // If confirmed_by not provided, use created_by from the current transaction
                    if (!finalConfirmedBy) {
                        finalConfirmedBy = currentTransaction.created_by;
                    }
                }
                const updateData = {
                    status,
                    confirmed_by: finalConfirmedBy,
                    confirmed_at: finalConfirmedAt
                };
                const updatedTransaction = yield this.eventsRepo.UpdateTransaction(transactionUuid, updateData);
                res.status(200).json({
                    success: true,
                    data: updatedTransaction,
                    message: 'Transaction updated successfully'
                });
            }
            catch (error) {
                console.error('Error in UpdateTransactionStatus:', error);
                if (error instanceof Error && error.message.includes('not found')) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Transaction not found'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to update transaction'
                });
            }
        });
    }
    GetTicketsByTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { transactionUuid } = req.params;
                // Validate UUID format
                if (!transactionUuid || typeof transactionUuid !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Transaction UUID is required'
                    });
                    return;
                }
                // Validate UUID format using regex
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(transactionUuid)) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid UUID format'
                    });
                    return;
                }
                const tickets = yield this.eventsRepo.GetTicketsByTransaction(transactionUuid);
                res.status(200).json({
                    success: true,
                    data: tickets,
                    message: 'Tickets retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetTicketsByTransaction:', error);
                if (error instanceof Error && error.message === 'Transaction not found') {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'Transaction not found'
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve tickets for transaction'
                });
            }
        });
    }
}
exports.EventController = EventController;
