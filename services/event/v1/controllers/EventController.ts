import { Request, Response } from 'express';
import { EventsRepo } from '../db/events/interface';
import { CreateEventRequest, CreateTicketRequest, VoucherObject, CreateVoucherRequest, TransactionObject } from '../../entities/entities';
import { NIL } from 'uuid';
import { UsersRepo } from '../db/users/interface';

export class EventController {
  private eventsRepo: EventsRepo;
  private usersRepo: UsersRepo;

  constructor(eventsRepo: EventsRepo, usersRepo: UsersRepo) {
    this.eventsRepo = eventsRepo;
    this.usersRepo = usersRepo;
  }

  async GetAttendees(req: Request, res: Response): Promise<void> {
    try {
      // Get all events
      const events = await this.eventsRepo.GetEvents();

      // For each event, get transactions with status 'completed' (status code 3)
      // TODO: Make this more efficient, through modifying the repo logic
      let eventAttendeesMap = new Map<string, any[]>(); // TODO: Define a proper type for attendees
      for (const event of events) {
        const transactions = await this.eventsRepo.GetTransactionsByEvent(event.uuid);
        const completedTransactions = transactions.filter(tx => tx.status === 3); //TODO: Use Enum for tx.status 3
      

        // Group the transactions by created_by to get unique attendees
        let createdByToTransactionsMap = new Map<number, TransactionObject[]>();
        for (const tx of completedTransactions) {
          if (tx.created_by === null || tx.created_by === undefined) {
            continue; // Skip transactions without a valid created_by
          }
          if (!createdByToTransactionsMap.has(tx.created_by)) {
            createdByToTransactionsMap.set(tx.created_by, []);
          }
          createdByToTransactionsMap.get(tx.created_by)!.push(tx);
        }

        // For each unique attendee's transaction, get the number of tickets and the price paid. Add them to the total for each.
        let attendees = []
        for (const [createdBy, txs] of createdByToTransactionsMap.entries()) {
          let totalTickets = 0;
          let totalAmountPaid = 0;
          for (const tx of txs) {
            const tickets = await this.eventsRepo.GetTicketsByTransaction(tx.uuid);
            totalTickets += tickets.length;
            for (const ticket of tickets) {
              totalAmountPaid += ticket.price;
            }
          }
          //TODO: Make this more efficient
          const user = await this.usersRepo.GetUserById(createdBy);
          if (!user) {
            res.status(500).json({
              success: false,
              data: null,
              message: `Failed to retrieve user with ID ${createdBy}`
            });
            return;
          }
          let name = user.username;
          attendees.push({ name, totalTickets, totalAmountPaid }); // TODO: have a new type here
        }
        eventAttendeesMap.set(event.uuid, attendees);
    } 
    // Return a list of attendees per event
    // An attendee is a struct with user name, total tickets, and total amount paid
    res.status(200).json({
      success: true,
      data: Object.fromEntries(eventAttendeesMap),
      message: 'Attendees retrieved successfully'
    });
    
  }catch (error) {
      console.error('Error in GetAttendees:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve attendees'
      });
    }
  }

  async GetReviewsByCreatedBy(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userIdNum = Number(userId);
      if (isNaN(userIdNum) || userIdNum <= 0) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Invalid user ID'
        });
        return;
      }

      const events = await this.eventsRepo.GetEvents(undefined, undefined, userIdNum); // Use undefined for optional parameters
      
      //TODO: Make this more efficient
      const reviews = [];
      for (const event of events) {
        const eventReviews = await this.eventsRepo.GetReviews({ event_id: event.id });
        reviews.push(...eventReviews);
      }
      res.status(200).json({
        success: true,
        data: reviews,
        message: 'Reviews retrieved successfully'
      });
    } catch (error) {
      console.error('Error in GetReviewsByUserID:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve reviews'
      });
    }
  }


  async GetEvents(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameters
      const { start_date, category, created_by} = req.query;
      
      let startDateFilter: Date | undefined;
      
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
      const createdByFilter = created_by ? Number(created_by) : undefined;
      const events = await this.eventsRepo.GetEvents(startDateFilter, categoryFilter, createdByFilter);
      
      const filterInfo: any = {};
      if (startDateFilter) filterInfo.start_date = startDateFilter.toISOString();
      if (categoryFilter) filterInfo.category_id = categoryFilter;
      
      res.status(200).json({
        success: true,
        data: events,
        message: `Events retrieved successfully${Object.keys(filterInfo).length > 0 ? ` (filtered)` : ''}`,
        filters: Object.keys(filterInfo).length > 0 ? filterInfo : null
      });
    } catch (error) {
      console.error('Error in GetEvents controller:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve events'
      });
    }
  }

  async GetEventByUuid(req: Request, res: Response): Promise<void> {
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

      const event = await this.eventsRepo.GetEventByUuid(uuid);
      
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
    } catch (error) {
      console.error('Error in GetEventByUuid controller:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve event'
      });
    }
  }

  async CreateEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData: CreateEventRequest = req.body;
      
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

      // Validate created_at field
      if (!eventData.created_by || typeof eventData.created_by !== 'number') {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Created by is required and must be a number'
        });
        return;
      }

      // Create the event
      const newEvent = await this.eventsRepo.CreateEvent(eventData);

      res.status(201).json({
        success: true,
        data: newEvent,
        message: 'Event created successfully'
      });
    } catch (error) {
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
  }

  async CreateTicket(req: Request, res: Response): Promise<void> {
    try {
      // Get event UUID from URL parameters
      const { uuid } = req.params;
      const ticketData: CreateTicketRequest = req.body;
      
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
      const newTicket = await this.eventsRepo.CreateTicket(uuid, ticketData);

      res.status(201).json({
        success: true,
        data: newTicket,
        message: 'Ticket created successfully'
      });
    } catch (error) {
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
  }

  async GetVouchersByEvent(req: Request, res: Response): Promise<void> {
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

      const vouchers = await this.eventsRepo.GetVouchersByEvent(uuid);
      
      res.status(200).json({
        success: true,
        data: vouchers,
        message: 'Vouchers retrieved successfully'
      });
    } catch (error) {
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
  }
  
  async CreateReview(req: Request, res: Response): Promise<void> {
    try {
      const { uuid } = req.params;
      const { rating, comment, created_by } = req.body;
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

      // Validate Created By
      if (created_by === undefined || typeof created_by !== 'number') {
        res.status(400).json({
          success: false,
          data: null,
          message: 'created_by is required and must be a number'
        });
        return;
      }

      // Validate Rating
      if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Rating is required and must be a number between 1 and 5'
        });
        return;
      }

      // Validate Comment
      if (comment !== undefined && (typeof comment !== 'string' || comment.trim() === '')) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Comment must be a non-empty string if provided'
        });
        return;
      }

      // Get Event to ensure it exists and is finished
      const event = await this.eventsRepo.GetEventByUuid(uuid);
      if (!event) {
        res.status(404).json({
          success: false,
          data: null,
          message: 'Event not found'
        });
        return;
      }

      const nowTime = new Date();
      if (event.end_date === null) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Cannot create review for an event without an end date'
        });
        return;
      }
      const eventEndTime = new Date(event.end_date);
      if (eventEndTime > nowTime) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Cannot create review for an event that has not finished'
        });
        return;
      }

      // Get Transaction to ensure user attended the event
      const transactions = await this.eventsRepo.GetTransactionsByUserIDAndEventID(created_by, event.id);
      const attended = transactions.some(tx => tx.event_id === event.id && tx.status === 3); //TODO: Use Enum for tx.status 3

      if (!attended) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'User did not attend the event'
        });
        return;
      }

      // Create Review
      const event_id = event.id;
      const reviewData = {
        event_id,
        rating,
        comment: comment ? comment.trim() : undefined,
        created_by
      };

      const newReview = await this.eventsRepo.CreateReview(reviewData);
      
      res.status(201).json({
        success: true,
        data: newReview,
        message: 'Review created successfully'
      });

    } catch (error) {
      console.error('Error in CreateReview:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to create review'
      });
    }
  }

  async CreateVoucher(req: Request, res: Response): Promise<void> {
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

      const voucherData: CreateVoucherRequest = {
        code: code.trim(),
        discount_type,
        discount_amount,
        max_uses,
        start_date,
        end_date
      };

      const newVoucher = await this.eventsRepo.CreateVoucher(uuid, voucherData);
      
      res.status(201).json({
        success: true,
        data: newVoucher,
        message: 'Voucher created successfully'
      });
    } catch (error) {
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
  }

  async GetTransactionsByEvent(req: Request, res: Response): Promise<void> {
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

      const transactions = await this.eventsRepo.GetTransactionsByEvent(uuid);
      
      res.status(200).json({
        success: true,
        data: transactions,
        message: 'Transactions retrieved successfully'
      });
    } catch (error) {
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
  }








}