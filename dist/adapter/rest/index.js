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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables first
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const EventController_1 = require("../../services/event/v1/controllers/EventController");
const UsersController_1 = require("../../services/event/v1/controllers/UsersController");
const TransactionsController_1 = require("../../services/event/v1/controllers/TransactionsController");
const adapter_prisma_postgresql_1 = require("../../services/event/v1/db/events/adapter_prisma_postgresql");
const adapter_prisma_postgresql_2 = require("../../services/event/v1/db/users/adapter_prisma_postgresql");
const MigrationService_1 = require("../../services/migration/MigrationService");
const SeedService_1 = require("../../services/migration/SeedService");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
// Initialize dependencies
const prismaClient = new client_1.PrismaClient();
const eventsRepo = new adapter_prisma_postgresql_1.PostgresRepository(prismaClient);
const usersRepo = new adapter_prisma_postgresql_2.PostgresUsersRepository(prismaClient);
const eventController = new EventController_1.EventController(eventsRepo);
const usersController = new UsersController_1.UsersController(usersRepo);
const transactionsController = new TransactionsController_1.TransactionsController(eventsRepo);
const migrationService = new MigrationService_1.MigrationService();
const seedService = new SeedService_1.SeedService();
// Root endpoint
app.get('/', (req, res) => {
    res.send('Hello World');
});
// Events endpoints
app.get('/events/list', (req, res) => {
    eventController.GetEvents(req, res);
});
app.get('/events/:uuid', (req, res) => {
    eventController.GetEventByUuid(req, res);
});
app.post('/events', (req, res) => {
    eventController.CreateEvent(req, res);
});
app.post('/events/:uuid/tickets', (req, res) => {
    eventController.CreateTicket(req, res);
});
// Voucher endpoints
app.get('/events/:uuid/vouchers', (req, res) => {
    eventController.GetVouchersByEvent(req, res);
});
app.post('/events/:uuid/vouchers', (req, res) => {
    eventController.CreateVoucher(req, res);
});
// Transaction endpoints
app.get('/events/:uuid/transactions', (req, res) => {
    eventController.GetTransactionsByEvent(req, res);
});
app.post('/transactions', (req, res) => {
    transactionsController.CreateTransaction(req, res);
});
app.get('/transactions/:transactionUuid', (req, res) => {
    transactionsController.GetTransactionByUuid(req, res);
});
app.patch('/transactions/:transactionUuid/status', (req, res) => {
    transactionsController.UpdateTransactionStatus(req, res);
});
app.get('/transactions/:transactionUuid/tickets', (req, res) => {
    transactionsController.GetTicketsByTransaction(req, res);
});
// Users endpoints
app.post('/users', (req, res) => {
    usersController.CreateUser(req, res);
});
// Get user by ID
app.get('/users/:id', (req, res) => {
    usersController.GetUserById(req, res);
});
app.get('/users/:userId/points', (req, res) => {
    usersController.GetUserPoints(req, res);
});
app.get('/users/:userId/coupons', (req, res) => {
    usersController.GetUserCoupons(req, res);
});
// Update user endpoint
app.patch('/users/:id', (req, res) => {
    usersController.UpdateUser(req, res);
});
// Points sum endpoint (separate from detailed points list)
app.get('/users/:userId/points/sum', (req, res) => {
    usersController.GetUserPointsSum(req, res);
});
// Migration endpoints
app.post('/migration_up', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting migration up...');
        const result = yield migrationService.runMigrationsUp();
        if (result.errors.length === 0) {
            res.status(200).json({
                success: true,
                message: 'Migrations executed successfully',
                data: {
                    executedFiles: result.executedFiles,
                    totalExecuted: result.executedFiles.length
                }
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Some migrations failed',
                data: {
                    executedFiles: result.executedFiles,
                    errors: result.errors,
                    totalExecuted: result.executedFiles.length,
                    totalErrors: result.errors.length
                }
            });
        }
    }
    catch (error) {
        console.error('Migration up error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration up failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
app.post('/migration_down', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting migration down...');
        const result = yield migrationService.runMigrationsDown();
        if (result.errors.length === 0) {
            res.status(200).json({
                success: true,
                message: 'Rollback migrations executed successfully',
                data: {
                    executedFiles: result.executedFiles,
                    totalExecuted: result.executedFiles.length
                }
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Some rollback migrations failed',
                data: {
                    executedFiles: result.executedFiles,
                    errors: result.errors,
                    totalExecuted: result.executedFiles.length,
                    totalErrors: result.errors.length
                }
            });
        }
    }
    catch (error) {
        console.error('Migration down error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration down failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
// Seed endpoints
app.post('/seed_up', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting seed up...');
        const result = yield seedService.runSeedsUp();
        if (result.errors.length === 0) {
            res.json({
                success: true,
                message: 'Seeds executed successfully',
                executedFiles: result.executedFiles,
                errors: []
            });
        }
        else {
            res.status(207).json({
                success: false,
                message: 'Some seeds failed',
                executedFiles: result.executedFiles,
                errors: result.errors
            });
        }
    }
    catch (error) {
        console.error('Seed up error:', error);
        res.status(500).json({
            success: false,
            message: 'Seed up failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
app.post('/seed_down', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting seed down...');
        const result = yield seedService.runSeedsDown();
        if (result.errors.length === 0) {
            res.json({
                success: true,
                message: 'Seed rollback executed successfully',
                executedFiles: result.executedFiles,
                errors: []
            });
        }
        else {
            res.status(207).json({
                success: false,
                message: 'Some seed rollbacks failed',
                executedFiles: result.executedFiles,
                errors: result.errors
            });
        }
    }
    catch (error) {
        console.error('Seed down error:', error);
        res.status(500).json({
            success: false,
            message: 'Seed down failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
// Golang-style ticker function that runs every minute
function startTicker() {
    console.log('Starting background ticker...');
    // Run immediately on startup
    tickerFunction();
    // Then run every minute (60,000 milliseconds)
    setInterval(() => {
        tickerFunction();
    }, 60 * 1000);
}
function tickerFunction() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        console.log(`Ticker executed at: ${now.toISOString()}`);
        try {
            // Expire overdue transactions (Waiting for Payment > 2 hours)
            const expiredCount = yield eventsRepo.ExpireOverdueTransactions();
            if (expiredCount > 0) {
                console.log(`Expired ${expiredCount} overdue transactions`);
            }
            // Cancel overdue confirmation transactions (Waiting for Confirmation > 3 days)
            const canceledCount = yield eventsRepo.CancelOverdueConfirmations();
            if (canceledCount > 0) {
                console.log(`Canceled ${canceledCount} overdue confirmation transactions`);
            }
            // TODO: Add more background tasks here
            // This function is called every minute and can be used for:
            // - Cleaning up expired sessions
            // - Sending notifications
            // - Database maintenance tasks
            // - Health checks
            // - etc.
        }
        catch (error) {
            console.error('Error in ticker function:', error);
        }
    });
}
// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    // Start the background ticker when server starts
    startTicker();
});
exports.default = app;
