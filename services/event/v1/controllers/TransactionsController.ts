import { Request, Response } from 'express';
import { EventsRepo } from '../db/events/interface';
import { CreateTransactionRequest, UpdateTransactionRequest } from '../../entities/entities';

export class TransactionsController {
  private eventsRepo: EventsRepo;

  constructor(eventsRepo: EventsRepo) {
    this.eventsRepo = eventsRepo;
  }

  async GetTransactionByUuid(req: Request, res: Response): Promise<void> {
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

      const transaction = await this.eventsRepo.GetTransactionByUuid(transactionUuid);
      
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
    } catch (error) {
      console.error('Error in GetTransactionByUuid:', error);

      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve transaction'
      });
    }
  }

  async CreateTransaction(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { event_id, created_by, ticket_ids, points_to_use, voucher_ids, coupon_ids } = req.body;

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

      // Validate points_to_use if provided
      if (points_to_use !== undefined) {
        if (typeof points_to_use !== 'number' || points_to_use < 0) {
          res.status(400).json({
            success: false,
            data: null,
            message: 'points_to_use must be a non-negative number if provided'
          });
          return;
        }

        // If points are being used, created_by is required
        if (!created_by) {
          res.status(400).json({
            success: false,
            data: null,
            message: 'created_by is required when using points'
          });
          return;
        }
      }

      // Validate voucher_ids if provided
      if (voucher_ids !== undefined) {
        if (!Array.isArray(voucher_ids)) {
          res.status(400).json({
            success: false,
            data: null,
            message: 'voucher_ids must be an array if provided'
          });
          return;
        }

        // Validate that all voucher IDs are numbers
        for (const voucherId of voucher_ids) {
          if (typeof voucherId !== 'number' || !Number.isInteger(voucherId) || voucherId < 1) {
            res.status(400).json({
              success: false,
              data: null,
              message: 'All voucher IDs must be positive integers'
            });
            return;
          }
        }
      }

      // Validate coupon_ids if provided
      if (coupon_ids !== undefined) {
        if (!Array.isArray(coupon_ids)) {
          res.status(400).json({
            success: false,
            data: null,
            message: 'coupon_ids must be an array if provided'
          });
          return;
        }

        // Validate that all coupon IDs are numbers
        for (const couponId of coupon_ids) {
          if (typeof couponId !== 'number' || !Number.isInteger(couponId) || couponId < 1) {
            res.status(400).json({
              success: false,
              data: null,
              message: 'All coupon IDs must be positive integers'
            });
            return;
          }
        }

        // If coupons are being used, created_by is required
        if (coupon_ids.length > 0 && !created_by) {
          res.status(400).json({
            success: false,
            data: null,
            message: 'created_by is required when using coupons'
          });
          return;
        }
      }

      const transactionData: CreateTransactionRequest = {
        event_id,
        created_by,
        ticket_ids,
        points_to_use,
        voucher_ids,
        coupon_ids
      };

      const newTransaction = await this.eventsRepo.CreateTransaction(transactionData);
      
      res.status(201).json({
        success: true,
        data: newTransaction,
        message: 'Transaction created successfully'
      });
    } catch (error) {
      console.error('Error in CreateTransaction:', error);
      
      const errorMessage = (error as Error)?.message || 'Unknown error';
      
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

      if (errorMessage.includes('Voucher with ID') || errorMessage.includes('Coupon with ID')) {
        res.status(400).json({
          success: false,
          data: null,
          message: errorMessage
        });
        return;
      }

      if (errorMessage.includes('Total discounts and points') && errorMessage.includes('exceed')) {
        res.status(400).json({
          success: false,
          data: null,
          message: errorMessage
        });
        return;
      }

      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to create transaction'
      });
    }
  }

  async UpdateTransactionStatus(req: Request, res: Response): Promise<void> {
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
      let currentTransaction: any;
      try {
        currentTransaction = await this.eventsRepo.GetTransactionByUuid(transactionUuid);
        if (!currentTransaction) {
          res.status(404).json({
            success: false,
            data: null,
            message: 'Transaction not found'
          });
          return;
        }
      } catch (error) {
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

      const updateData: UpdateTransactionRequest = {
        status,
        confirmed_by: finalConfirmedBy,
        confirmed_at: finalConfirmedAt
      };

      const updatedTransaction = await this.eventsRepo.UpdateTransaction(transactionUuid, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedTransaction,
        message: 'Transaction updated successfully'
      });
    } catch (error) {
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
  }

  async GetTicketsByTransaction(req: Request, res: Response): Promise<void> {
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

      const tickets = await this.eventsRepo.GetTicketsByTransaction(transactionUuid);
      
      res.status(200).json({
        success: true,
        data: tickets,
        message: 'Tickets retrieved successfully'
      });
    } catch (error) {
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
  }
}
