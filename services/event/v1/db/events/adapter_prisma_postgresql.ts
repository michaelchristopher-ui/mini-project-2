import { PrismaClient } from '@prisma/client';
import { EventObject, CreateEventRequest, TicketObject, CreateTicketRequest, VoucherObject, CreateVoucherRequest, TransactionObject, CreateTransactionRequest, UpdateTransactionRequest, CreateReviewRequest, ReviewObject, GetReviewRequest} from '../../../entities/entities';
import { Entity } from './entities';
import { toDomainModel } from './helpers';
import { EventsRepo } from './interface';
import { randomUUID } from 'crypto';

export class PostgresRepository implements EventsRepo {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  //GetEvents is a function that allows the querying of events based on multiple optional filters
  async GetEvents(startDateFilter?: Date, category?: number, createdBy?: number): Promise<EventObject[]> {
    try {
      // Build the where clause with optional start_date filtering
      const whereClause: any = {
        status: 'atv'
      };

      // Add start_date filter if provided
      if (startDateFilter) {
        whereClause.start_date = {
          gt: startDateFilter  // greater than the provided date
        };
      }

      // Add category filter if provided
      if (category) {
        whereClause.category_id = category;
      }

      // Add createdBy filter if provided
      if (createdBy) {
        whereClause.created_by = createdBy;
      }

      // Query the events table using Prisma's type-safe query builder
      const events = await this.prisma.event.findMany({
        where: whereClause,
        orderBy: {
          start_date: 'asc'
        }
      });

      // Convert Prisma results to domain models using the helper function
      return events.map((eachEvent) => toDomainModel(eachEvent));
    } catch (error) {
      console.error('Detailed Prisma error:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');
      throw new Error(`Failed to retrieve events from database: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetEventByUuid(uuid: string): Promise<EventObject | null> {
    try {
      // Query for a single event by UUID
      const event = await this.prisma.event.findUnique({
        where: {
          uuid: uuid,
          status: 'atv'  // Only return active events
        }
      });

      // Return null if event not found
      if (!event) {
        return null;
      }

      // Convert Prisma result to domain model using the helper function
      return toDomainModel(event);
    } catch (error) {
      console.error('Detailed Prisma error in GetEventByUuid:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');
      throw new Error(`Failed to retrieve event by UUID from database: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetReviews(reviewFilterData: GetReviewRequest): Promise<ReviewObject[]> {
    try {
      const reviews = await this.prisma.review.findMany({
        where: {
          event_id: reviewFilterData.event_id,
        }
      });
      return reviews.map((eachReview) => eachReview as ReviewObject);
    } catch (error) {
      console.error('Detailed Prisma error in GetReviewsByCreatedBy:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');
      throw new Error(`Failed to retrieve reviews by creator ID from database: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async CreateEvent(eventData: CreateEventRequest): Promise<EventObject> {
    try {
      // Generate UUID for the new event
      const uuid = randomUUID();
      
      // Prepare the data for database insertion
      const createData: any = {
        uuid: uuid,
        name: eventData.name,
        start_date: new Date(eventData.start_date),
        available_seats: eventData.available_seats,
        status: 'atv' // Set as active by default
      };

      // Add optional fields if provided
      if (eventData.end_date) {
        createData.end_date = new Date(eventData.end_date);
      }
      
      if (eventData.description) {
        createData.description = eventData.description;
      }
      
      if (eventData.ticket_type_id) {
        createData.ticket_type_id = eventData.ticket_type_id;
      }
      
      if (eventData.event_type) {
        createData.event_type = eventData.event_type;
      }
      
      if (eventData.category_id) {
        createData.category_id = eventData.category_id;
      }

      if (eventData.created_by) {
        createData.created_by = eventData.created_by;
      }

      // Create the event in the database
      const newEvent = await this.prisma.event.create({
        data: createData
      });

      // Convert Prisma result to domain model using the helper function
      return toDomainModel(newEvent);
    } catch (error) {
      console.error('Detailed Prisma error in CreateEvent:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');
      throw new Error(`Failed to create event in database: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async CreateTicket(eventUuid: string, ticketData: CreateTicketRequest): Promise<TicketObject> {
    try {
      // First, find the event by UUID to get the event ID
      const event = await this.prisma.event.findUnique({
        where: {
          uuid: eventUuid,
          status: 'atv'  // Only allow tickets for active events
        }
      });

      if (!event) {
        throw new Error('Event not found or inactive');
      }

      // Generate UUID for the new ticket
      const ticketUuid = randomUUID();
      
      // Create the ticket in the database
      const newTicket = await this.prisma.ticket.create({
        data: {
          uuid: ticketUuid,
          event_id: event.id,
          price: ticketData.price,
          status: 'atv' // Set as active by default
        }
      });

      // Convert to domain model
      const now = new Date();
      return {
        id: newTicket.id,
        uuid: newTicket.uuid,
        event_id: newTicket.event_id,
        price: newTicket.price.toNumber(), // Convert Decimal to number
        created_at: newTicket.created_at || now,
        updated_at: newTicket.updated_at || now,
        status: newTicket.status
      };
    } catch (error) {
      console.error('Detailed Prisma error in CreateTicket:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');
      throw new Error(`Failed to create ticket: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetVouchersByEvent(eventUuid: string): Promise<VoucherObject[]> {
    try {
      // First, find the event by UUID to get the event ID
      const event = await this.prisma.event.findUnique({
        where: {
          uuid: eventUuid,
        }
      });

      if (!event) {
        throw new Error('Event not found');
      }

      // Get all vouchers for the event
      const vouchers = await this.prisma.voucher.findMany({
        where: {
          event_id: event.id,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      
      return vouchers.map((voucher: any) => ({
        id: voucher.id,
        uuid: voucher.uuid,
        event_id: voucher.event_id,
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_amount: voucher.discount_amount.toNumber(), // Convert Decimal to number
        max_uses: voucher.max_uses,
        used_count: voucher.used_count,
        start_date: voucher.start_date,
        end_date: voucher.end_date,
        created_at: voucher.created_at,
        updated_at: voucher.updated_at,
        status: voucher.status
      }));
    } catch (error) {
      console.error('Detailed Prisma error in GetVouchersByEvent:', error);
      throw new Error(`Failed to retrieve vouchers: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetVoucherById(voucherId: number): Promise<VoucherObject | null> {
    try {
      const voucher = await this.prisma.voucher.findUnique({
        where: {
          id: voucherId,
          status: 'atv'  // Only return active vouchers
        }
      });

      if (!voucher) {
        return null;
      }

      return {
        id: voucher.id,
        uuid: voucher.uuid,
        event_id: voucher.event_id,
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_amount: voucher.discount_amount.toNumber(),
        max_uses: voucher.max_uses,
        used_count: voucher.used_count || 0,
        start_date: voucher.start_date,
        end_date: voucher.end_date,
        created_at: voucher.created_at || new Date(),
        updated_at: voucher.updated_at || new Date(),
        status: voucher.status
      };
    } catch (error) {
      console.error('Detailed Prisma error in GetVoucherById:', error);
      throw new Error(`Failed to retrieve voucher: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async CreateVoucher(eventUuid: string, voucherData: CreateVoucherRequest): Promise<VoucherObject> {
    try {
      // First, find the event by UUID to get the event ID
      const event = await this.prisma.event.findUnique({
        where: {
          uuid: eventUuid,
          status: 'atv'  // Only allow vouchers for active events
        }
      });

      if (!event) {
        throw new Error('Event not found or inactive');
      }

      // Generate UUID for the new voucher
      const voucherUuid = randomUUID();
      
      // Create the voucher in the database
      const newVoucher = await this.prisma.voucher.create({
        data: {
          uuid: voucherUuid,
          event_id: event.id,
          code: voucherData.code,
          discount_type: voucherData.discount_type,
          discount_amount: voucherData.discount_amount,
          max_uses: voucherData.max_uses,
          used_count: 0, // Always start with 0 uses
          start_date: new Date(voucherData.start_date), // Convert ISO string to Date
          end_date: new Date(voucherData.end_date), // Convert ISO string to Date
          status: 'atv' // Set as active by default
        }
      });

      // Convert to domain model
      return {
        id: newVoucher.id,
        uuid: newVoucher.uuid,
        event_id: newVoucher.event_id,
        code: newVoucher.code,
        discount_type: newVoucher.discount_type,
        discount_amount: newVoucher.discount_amount.toNumber(), // Convert Decimal to number
        max_uses: newVoucher.max_uses,
        used_count: newVoucher.used_count || 0,
        start_date: newVoucher.start_date,
        end_date: newVoucher.end_date,
        created_at: newVoucher.created_at || new Date(),
        updated_at: newVoucher.updated_at || new Date(),
        status: newVoucher.status
      };
    } catch (error) {
      console.error('Detailed Prisma error in CreateVoucher:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');
      throw new Error(`Failed to create voucher: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetTransactionsByEvent(eventUuid: string): Promise<TransactionObject[]> {
    try {
      // First, find the event by UUID to get the event ID
      const event = await this.prisma.event.findUnique({
        where: {
          uuid: eventUuid,
        }
      });

      if (!event) {
        throw new Error('Event not found');
      }

      // Get all transactions for the event
      const transactions = await this.prisma.transaction.findMany({
        where: {
          event_id: event.id,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      
      return transactions.map(transaction => ({
        id: transaction.id,
        uuid: transaction.uuid,
        event_id: transaction.event_id,
        status: transaction.status,
        remaining_price: (transaction as any).remaining_price?.toNumber() || 0,
        created_at: transaction.created_at,
        created_by: transaction.created_by,
        confirmed_at: transaction.confirmed_at,
        confirmed_by: transaction.confirmed_by
      }));
    } catch (error) {
      console.error('Detailed Prisma error in GetTransactionsByEvent:', error);
      throw new Error(`Failed to retrieve transactions: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetTransactionByUuid(transactionUuid: string): Promise<TransactionObject | null> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: {
          uuid: transactionUuid,
        },
      });

      if (!transaction) {
        return null;
      }

      return {
        id: transaction.id,
        uuid: transaction.uuid,
        event_id: transaction.event_id,
        status: transaction.status,
        remaining_price: (transaction as any).remaining_price?.toNumber() || 0,
        created_at: transaction.created_at,
        created_by: transaction.created_by,
        confirmed_at: transaction.confirmed_at,
        confirmed_by: transaction.confirmed_by
      };
    } catch (error) {
      console.error('Detailed Prisma error in GetTransactionByUuid:', error);
      throw new Error(`Failed to retrieve transaction: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async CreateTransaction(transactionData: CreateTransactionRequest): Promise<TransactionObject> {
    try {
      // Generate UUID for the new transaction
      const transactionUuid = randomUUID();
      
      // Start a transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (prisma) => {
        // Check seat availability first - calculate total seats needed
        const seatCount = transactionData.ticket_ids ? 
          Object.values(transactionData.ticket_ids).reduce((total, quantity) => total + quantity, 0) : 0;
        if (seatCount === 0) {
          throw new Error('At least one ticket must be specified');
        }

        // Get current event seat availability
        const event = await prisma.event.findUnique({
          where: { id: transactionData.event_id }
        });

        if (!event) {
          throw new Error('Event not found');
        }

        if (event.available_seats < seatCount) {
          throw new Error(`Insufficient seats available. Requested: ${seatCount}, Available: ${event.available_seats}`);
        }

        // If user wants to use points, validate point availability
        let userPointsSum = 0;
        if (transactionData.points_to_use && transactionData.points_to_use > 0 && transactionData.created_by) {
          const now = new Date();
          
          // Get current non-expired points for the user
          const pointsResult = await (prisma as any).points.aggregate({
            where: {
              user_id: transactionData.created_by,
              OR: [
                { expiry: null }, // No expiry date
                { expiry: { gt: now } } // Expiry date is in the future
              ]
            },
            _sum: {
              points_count: true
            }
          });
          
          userPointsSum = pointsResult._sum.points_count || 0;
          
          // Check if user has enough points
          if (transactionData.points_to_use > userPointsSum) {
            throw new Error(`Insufficient points available. Requested: ${transactionData.points_to_use}, Available: ${userPointsSum}`);
          }
        }

        // Calculate total price for all tickets
        let totalPrice = 0;
        if (transactionData.ticket_ids && Object.keys(transactionData.ticket_ids).length > 0) {
          const ticketIds = Object.keys(transactionData.ticket_ids).map(id => parseInt(id));
          const tickets = await prisma.ticket.findMany({
            where: {
              id: { in: ticketIds },
              event_id: transactionData.event_id
            }
          });

          for (const ticket of tickets) {
            const quantity = transactionData.ticket_ids[ticket.id] || 0;
            totalPrice += ticket.price.toNumber() * quantity;
          }
        }

        // Calculate discounts from vouchers and coupons
        let voucherDiscountValue = 0;
        let couponDiscountValue = 0;
        const validVouchers: any[] = [];
        const validCoupons: any[] = [];

        // Validate and calculate voucher discounts
        if (transactionData.voucher_ids && transactionData.voucher_ids.length > 0) {
          for (const voucherId of transactionData.voucher_ids) {
            const voucher = await prisma.voucher.findUnique({
              where: { 
                id: voucherId,
                status: 'atv'
              }
            });

            if (!voucher) {
              throw new Error(`Voucher with ID ${voucherId} not found or inactive`);
            }

            // Check if voucher is valid for this event
            if (voucher.event_id !== transactionData.event_id) {
              throw new Error(`Voucher with ID ${voucherId} is not valid for this event`);
            }

            // Check if voucher is within date range
            const now = new Date();
            if (voucher.start_date > now || voucher.end_date < now) {
              throw new Error(`Voucher with ID ${voucherId} is not valid at this time`);
            }

            // Check usage limits
            if (voucher.max_uses && (voucher.used_count || 0) >= voucher.max_uses) {
              throw new Error(`Voucher with ID ${voucherId} has exceeded its usage limit`);
            }

            validVouchers.push(voucher);

            // Calculate discount amount
            if (voucher.discount_type === 'fixed') {
              voucherDiscountValue += voucher.discount_amount.toNumber();
            } else if (voucher.discount_type === 'percentage') {
              voucherDiscountValue += (totalPrice * voucher.discount_amount.toNumber()) / 100;
            }
          }
        }

        // Validate and calculate coupon discounts
        if (transactionData.coupon_ids && transactionData.coupon_ids.length > 0) {
          for (const couponId of transactionData.coupon_ids) {
            const coupon = await (prisma as any).coupon.findUnique({
              where: { 
                id: couponId,
                is_active: true
              }
            });

            if (!coupon) {
              throw new Error(`Coupon with ID ${couponId} not found or inactive`);
            }

            // Check if coupon belongs to the user creating the transaction
            if (transactionData.created_by && coupon.user_id !== transactionData.created_by) {
              throw new Error(`Coupon with ID ${couponId} does not belong to the user`);
            }

            validCoupons.push(coupon);
            couponDiscountValue += coupon.discount_amount;
          }
        }

        // Calculate remaining price after points and all discounts
        const pointsValue = transactionData.points_to_use || 0;
        const totalDiscountValue = voucherDiscountValue + couponDiscountValue;
        
        // Check if total discount + points exceeds the price (negative remaining price)
        const totalReduction = pointsValue + totalDiscountValue;
        if (totalReduction > totalPrice) {
          throw new Error(`Total discounts and points (${totalReduction}) exceed the total price (${totalPrice}). Remaining amount would be negative.`);
        }

        const remainingPrice = totalPrice - totalReduction;

        console.log(`Transaction pricing: Total=${totalPrice}, Points=${pointsValue}, Voucher Discount=${voucherDiscountValue}, Coupon Discount=${couponDiscountValue}, Total Discount=${totalDiscountValue}, Remaining=${remainingPrice}`);

        // Reserve seats by reducing available_seats
        await prisma.event.update({
          where: { id: transactionData.event_id },
          data: {
            available_seats: {
              decrement: seatCount
            }
          }
        });

        // Create the transaction record
        const newTransaction = await (prisma as any).transaction.create({
          data: {
            uuid: transactionUuid,
            event_id: transactionData.event_id,
            status: 1, // Default to "Waiting for Payment"
            created_by: transactionData.created_by,
            remaining_price: remainingPrice,
          }
        });

        // Create the ticket-transaction relationships with quantities
        if (transactionData.ticket_ids && Object.keys(transactionData.ticket_ids).length > 0) {
          const ticketTransactionData = Object.entries(transactionData.ticket_ids).map(([ticketId, quantity]) => ({
            transaction_id: newTransaction.id,
            ticket_id: parseInt(ticketId),
            quantity: quantity
          }));

          await prisma.ticketTransaction.createMany({
            data: ticketTransactionData
          });
        }

        // Deduct points if they were used
        if (transactionData.points_to_use && transactionData.points_to_use > 0 && transactionData.created_by) {
          // Add a negative points entry to deduct the used points
          await (prisma as any).points.create({
            data: {
              user_id: transactionData.created_by,
              points_count: -transactionData.points_to_use, // Negative to deduct
              expiry: null, // Deductions don't expire
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          console.log(`Deducted ${transactionData.points_to_use} points from user ${transactionData.created_by}`);
        }

        // Update voucher usage count for used vouchers
        for (const voucher of validVouchers) {
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: {
              used_count: {
                increment: 1
              }
            }
          });
          console.log(`Incremented usage count for voucher ${voucher.id}`);
        }

        // Mark used coupons as inactive
        for (const coupon of validCoupons) {
          await (prisma as any).coupon.update({
            where: { id: coupon.id },
            data: {
              is_active: false
            }
          });
          console.log(`Marked coupon ${coupon.id} as inactive`);
        }

        return { 
          ...newTransaction, 
          total_price: totalPrice,
          points_used: pointsValue,
          discount_applied: totalDiscountValue,
          remaining_price: remainingPrice
        };
      });

      // Convert to domain model and include pricing information
      return {
        id: result.id,
        uuid: result.uuid,
        event_id: result.event_id,
        status: result.status,
        created_at: result.created_at,
        created_by: result.created_by,
        confirmed_at: result.confirmed_at,
        confirmed_by: result.confirmed_by,
        total_price: result.total_price,
        points_used: result.points_used,
        discount_applied: result.discount_applied,
        remaining_price: result.remaining_price
      } as any;
    } catch (error) {
      console.error('Detailed Prisma error in CreateTransaction:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');
      throw new Error(`Failed to create transaction: ${(error as any)?.message || 'Unknown error'}`);
    }
  }


  private async RestoreSeatsForTransactionByPrisma(prisma: any, transactionId: number): Promise<void> {
    try {
      // Get the transaction and sum quantities of associated tickets
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          ticket_transactions: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const seatCount = transaction.ticket_transactions.reduce((total: number, tt: any) => total + tt.quantity, 0);
      
      // Restore seats to the event
      await prisma.event.update({
        where: { id: transaction.event_id },
        data: {
          available_seats: {
            increment: seatCount
          }
        }
      });

      console.log(`Restored ${seatCount} seats for transaction ${transactionId}`);
    } catch (error) {
      console.error('Error restoring seats for transaction:', error);
      throw new Error(`Failed to restore seats: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async UpdateTransaction(transactionUuid: string, updateData: UpdateTransactionRequest): Promise<TransactionObject> {
    try {
      // First get the current transaction to check if we need to restore seats
      const currentTransaction = await this.prisma.transaction.findUnique({
        where: { uuid: transactionUuid }
      });

      if (!currentTransaction) {
        throw new Error('Transaction not found');
      }

      const updatePayload: any = {};
      
      if (updateData.status !== undefined) {
        updatePayload.status = updateData.status;
      }
      
      if (updateData.confirmed_by !== undefined) {
        updatePayload.confirmed_by = updateData.confirmed_by;
      }
      
      if (updateData.confirmed_at !== undefined) {
        updatePayload.confirmed_at = new Date(updateData.confirmed_at);
      }
      
      if (updateData.image_url !== undefined) {
        updatePayload.image_url = updateData.image_url;
      }

      // Use transaction to ensure atomicity when restoring seats
      const result = await this.prisma.$transaction(async (prisma) => {
        // Update the transaction
        const updatedTransaction = await prisma.transaction.update({
          where: {
            uuid: transactionUuid,
          },
          data: updatePayload
        });

        // Restore seats if status changed to expired (4), canceled (5), or rejected (6)
        // and the previous status was not already a final state
        const newStatus = updateData.status;
        const oldStatus = currentTransaction.status;
        const finalStates = [3, 4, 5, 6]; // Completed, Expired, Canceled, Rejected
        const seatRestoreStates = [4, 5, 6]; // Expired, Canceled, Rejected

        if (newStatus !== undefined && 
            seatRestoreStates.includes(newStatus) && 
            !finalStates.includes(oldStatus)) {
          // Restore seats for this transaction (need to call outside of Prisma transaction)
          await this.RestoreSeatsForTransactionByPrisma(prisma, updatedTransaction.id);
        }

        return updatedTransaction;
      });

      return {
        id: result.id,
        uuid: result.uuid,
        event_id: result.event_id,
        status: result.status,
        remaining_price: (result as any).remaining_price?.toNumber() || 0,
        created_at: result.created_at,
        created_by: result.created_by,
        confirmed_at: result.confirmed_at,
        confirmed_by: result.confirmed_by,
        image_url: result.image_url || undefined
      };
    } catch (error) {
      console.error('Detailed Prisma error in UpdateTransaction:', error);
      throw new Error(`Failed to update transaction: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetTicketsByTransaction(transactionUuid: string): Promise<TicketObject[]> {
    try {
      // First, find the transaction by UUID
      const transaction = await this.prisma.transaction.findUnique({
        where: {
          uuid: transactionUuid,
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Get all tickets associated with this transaction
      const ticketTransactions = await this.prisma.ticketTransaction.findMany({
        where: {
          transaction_id: transaction.id,
        },
        include: {
          ticket: true
        }
      });

      return ticketTransactions.map(tt => {
        const now = new Date();
        return {
          id: tt.ticket.id,
          uuid: tt.ticket.uuid,
          event_id: tt.ticket.event_id,
          price: tt.ticket.price.toNumber(), // Convert Decimal to number
          created_at: tt.ticket.created_at || now,
          updated_at: tt.ticket.updated_at || now,
          status: tt.ticket.status
        };
      });
    } catch (error) {
      console.error('Detailed Prisma error in GetTicketsByTransaction:', error);
      throw new Error(`Failed to retrieve tickets for transaction: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async ExpireOverdueTransactions(): Promise<number> {
    try {
      // Calculate the cutoff time (2 hours ago)
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      // Find transactions to expire first
      const transactionsToExpire = await this.prisma.transaction.findMany({
        where: {
          status: 1, // Waiting for Payment
          created_at: {
            lt: twoHoursAgo // Less than (older than) 2 hours ago
          }
        }
      });

      if (transactionsToExpire.length === 0) {
        return 0;
      }

      // Process each transaction individually to restore seats
      let expiredCount = 0;
      for (const transaction of transactionsToExpire) {
        try {
          await this.prisma.$transaction(async (prisma) => {
            // Update transaction status to expired
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: { status: 4 } // Expired
            });

            // Restore seats
            await this.RestoreSeatsForTransactionByPrisma(prisma, transaction.id);
          });
          expiredCount++;
        } catch (error) {
          console.error(`Error expiring transaction ${transaction.id}:`, error);
          // Continue with other transactions
        }
      }

      console.log(`Expired ${expiredCount} overdue transactions`);
      return expiredCount;
    } catch (error) {
      console.error('Detailed Prisma error in ExpireOverdueTransactions:', error);
      throw new Error(`Failed to expire overdue transactions: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async CancelOverdueConfirmations(): Promise<number> {
    try {
      // Calculate the cutoff time (3 days ago)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Find transactions to cancel first
      const transactionsToCancel = await this.prisma.transaction.findMany({
        where: {
          status: 2, // Waiting for Confirmation
          created_at: {
            lt: threeDaysAgo // Less than (older than) 3 days ago
          }
        }
      });

      if (transactionsToCancel.length === 0) {
        return 0;
      }

      // Process each transaction individually to restore seats
      let canceledCount = 0;
      for (const transaction of transactionsToCancel) {
        try {
          await this.prisma.$transaction(async (prisma) => {
            // Update transaction status to canceled
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: { status: 5 } // Canceled
            });

            // Restore seats
            await this.RestoreSeatsForTransactionByPrisma(prisma, transaction.id);
          });
          canceledCount++;
        } catch (error) {
          console.error(`Error canceling transaction ${transaction.id}:`, error);
          // Continue with other transactions
        }
      }

      console.log(`Canceled ${canceledCount} overdue confirmation transactions`);
      return canceledCount;
    } catch (error) {
      console.error('Detailed Prisma error in CancelOverdueConfirmations:', error);
      throw new Error(`Failed to cancel overdue confirmation transactions: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async CreateReview(reviewData: CreateReviewRequest): Promise<ReviewObject> {
    try {
      // Insert new review to the DB
      const review = await this.prisma.review.create({
        data: {
          event_id: reviewData.event_id,
          created_by: reviewData.created_by,
          rating: reviewData.rating,
          comment: reviewData.comment || null,
        },
      });

      return review;
    } catch (error) {
      console.error('Detailed Prisma error in CreateReview:', error);
      throw new Error(`Failed to create review: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetTransactionsByUserIDAndEventID(userId: number, eventId: number): Promise<TransactionObject[]> {
    try {
      // Find the transaction by event_id and created_by
        const transactions = await this.prisma.transaction.findMany({
        where: {
          event_id: eventId,
          created_by: userId,
        },
      });

      return transactions.map((transaction: any) => ({
        id: transaction.id,
        uuid: transaction.uuid,
        event_id: transaction.event_id,
        status: transaction.status,
        remaining_price: transaction.remaining_price.toNumber(), // Convert Decimal to number
        created_at: transaction.created_at,
        created_by: transaction.created_by,
        confirmed_at: transaction.confirmed_at,
        confirmed_by: transaction.confirmed_by
      }));
    } catch (error) {
      console.error('Detailed Prisma error in GetTransactionsByUserAndEventUUID:', error);
      throw new Error(`Failed to retrieve transactions: ${(error as any)?.message || 'Unknown error'}`);
    }
  }
}
