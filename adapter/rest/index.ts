// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EventController } from '../../services/event/v1/controllers/EventController';
import { UsersController } from '../../services/event/v1/controllers/UsersController';
import { TransactionsController } from '../../services/event/v1/controllers/TransactionsController';
import { PostgresRepository } from '../../services/event/v1/db/events/adapter_prisma_postgresql';
import { PostgresUsersRepository } from '../../services/event/v1/db/users/adapter_prisma_postgresql';
import { MigrationService } from '../../services/migration/MigrationService';
import { SeedService } from '../../services/migration/SeedService';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize dependencies
const prismaClient = new PrismaClient();
const eventsRepo = new PostgresRepository(prismaClient);
const usersRepo = new PostgresUsersRepository(prismaClient);
const eventController = new EventController(eventsRepo);
const usersController = new UsersController(usersRepo);
const transactionsController = new TransactionsController(eventsRepo);
const migrationService = new MigrationService();
const seedService = new SeedService();

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

// Events endpoints
app.get('/events/list', (req: Request, res: Response) => {
    eventController.GetEvents(req, res);
});

app.get('/events/:uuid', (req: Request, res: Response) => {
    eventController.GetEventByUuid(req, res);
});

app.post('/events', (req: Request, res: Response) => {
    eventController.CreateEvent(req, res);
});

app.post('/events/:uuid/tickets', (req: Request, res: Response) => {
    eventController.CreateTicket(req, res);
});

// Voucher endpoints
app.get('/events/:uuid/vouchers', (req: Request, res: Response) => {
    eventController.GetVouchersByEvent(req, res);
});

app.post('/events/:uuid/vouchers', (req: Request, res: Response) => {
    eventController.CreateVoucher(req, res);
});

// Transaction endpoints
app.get('/events/:uuid/transactions', (req: Request, res: Response) => {
    eventController.GetTransactionsByEvent(req, res);
});

app.post('/transactions', (req: Request, res: Response) => {
    transactionsController.CreateTransaction(req, res);
});

app.get('/transactions/:transactionUuid', (req: Request, res: Response) => {
    transactionsController.GetTransactionByUuid(req, res);
});

app.patch('/transactions/:transactionUuid/upload_image', (req: Request, res: Response) => {
    transactionsController.UpdateTransactionUploadImage(req, res);
});

app.patch('/transactions/:transactionUuid/status', (req: Request, res: Response) => {
    transactionsController.UpdateTransactionStatus(req, res);
});

app.get('/transactions/:transactionUuid/tickets', (req: Request, res: Response) => {
    transactionsController.GetTicketsByTransaction(req, res);
});

// Users endpoints
app.post('/users', (req: Request, res: Response) => {
    usersController.CreateUser(req, res);
});

app.get('/users/:id', (req: Request, res: Response) => {
    usersController.GetUserById(req, res);
});

app.patch('/users/:userId', (req: Request, res: Response) => {
    usersController.UpdateUser(req, res);
});

app.post('/users/:userId/reset-password', (req: Request, res: Response) => {
    usersController.ResetPassword(req, res);
});


// User points endpoint
app.get('/users/:userId/points', (req: Request, res: Response) => {
    usersController.GetUserPoints(req, res);
});

app.get('/users/:userId/points/sum', (req: Request, res: Response) => {
    usersController.GetUserPointsSum(req, res);
});

app.get('/users/:userId/coupons', (req: Request, res: Response) => {
    usersController.GetUserCoupons(req, res);
});

// Migration endpoints
app.post('/migration_up', async (req: Request, res: Response) => {
    try {
        console.log('Starting migration up...');
        const result = await migrationService.runMigrationsUp();
        
        if (result.errors.length === 0) {
            res.status(200).json({
                success: true,
                message: 'Migrations executed successfully',
                data: {
                    executedFiles: result.executedFiles,
                    totalExecuted: result.executedFiles.length
                }
            });
        } else {
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
    } catch (error) {
        console.error('Migration up error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration up failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

app.post('/migration_down', async (req: Request, res: Response) => {
    try {
        console.log('Starting migration down...');
        const result = await migrationService.runMigrationsDown();
        
        if (result.errors.length === 0) {
            res.status(200).json({
                success: true,
                message: 'Rollback migrations executed successfully',
                data: {
                    executedFiles: result.executedFiles,
                    totalExecuted: result.executedFiles.length
                }
            });
        } else {
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
    } catch (error) {
        console.error('Migration down error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration down failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// Seed endpoints
app.post('/seed_up', async (req: Request, res: Response) => {
    try {
        console.log('Starting seed up...');
        const result = await seedService.runSeedsUp();

        if (result.errors.length === 0) {
            res.json({
                success: true,
                message: 'Seeds executed successfully',
                executedFiles: result.executedFiles,
                errors: []
            });
        } else {
            res.status(207).json({
                success: false,
                message: 'Some seeds failed',
                executedFiles: result.executedFiles,
                errors: result.errors
            });
        }
    } catch (error) {
        console.error('Seed up error:', error);
        res.status(500).json({
            success: false,
            message: 'Seed up failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

app.post('/seed_down', async (req: Request, res: Response) => {
    try {
        console.log('Starting seed down...');
        const result = await seedService.runSeedsDown();

        if (result.errors.length === 0) {
            res.json({
                success: true,
                message: 'Seed rollback executed successfully',
                executedFiles: result.executedFiles,
                errors: []
            });
        } else {
            res.status(207).json({
                success: false,
                message: 'Some seed rollbacks failed',
                executedFiles: result.executedFiles,
                errors: result.errors
            });
        }
    } catch (error) {
        console.error('Seed down error:', error);
        res.status(500).json({
            success: false,
            message: 'Seed down failed',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

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

async function tickerFunction() {
    const now = new Date();
    console.log(`Ticker executed at: ${now.toISOString()}`);
    
    try {
        // Expire overdue transactions (Waiting for Payment > 2 hours)
        const expiredCount = await eventsRepo.ExpireOverdueTransactions();
        if (expiredCount > 0) {
            console.log(`Expired ${expiredCount} overdue transactions`);
        }
        
        // Cancel overdue confirmation transactions (Waiting for Confirmation > 3 days)
        const canceledCount = await eventsRepo.CancelOverdueConfirmations();
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
    } catch (error) {
        console.error('Error in ticker function:', error);
    }
}

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    
    // Start the background ticker when server starts
    startTicker();
});

export default app;