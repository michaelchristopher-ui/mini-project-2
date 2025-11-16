import { EventObject, CreateEventRequest, TicketObject, CreateTicketRequest, VoucherObject, CreateVoucherRequest, TransactionObject, CreateTransactionRequest, UpdateTransactionRequest, CreateReviewRequest, ReviewObject, GetReviewRequest } from '../../../entities/entities';

export interface EventsRepo {
  GetEvents(startDateFilter?: Date, category?: number, createdBy?: number): Promise<EventObject[]>;
  GetEventByUuid(uuid: string): Promise<EventObject | null>;
  CreateEvent(eventData: CreateEventRequest): Promise<EventObject>;
  CreateTicket(eventUuid: string, ticketData: CreateTicketRequest): Promise<TicketObject>;
  GetVouchersByEvent(eventUuid: string): Promise<VoucherObject[]>;
  GetVoucherById(voucherId: number): Promise<VoucherObject | null>;
  CreateVoucher(eventUuid: string, voucherData: CreateVoucherRequest): Promise<VoucherObject>;
  
  // Review methods
  CreateReview(reviewData: CreateReviewRequest): Promise<ReviewObject>;
  GetReviews(reviewFilterData: GetReviewRequest): Promise<ReviewObject[]>;
  
  // Transaction methods
  GetTransactionsByEvent(eventUuid: string): Promise<TransactionObject[]>;
  GetTransactionByUuid(transactionUuid: string): Promise<TransactionObject | null>;
  GetTransactionsByUserIDAndEventID(userId: number, eventId: number): Promise<TransactionObject[]>;
  CreateTransaction(transactionData: CreateTransactionRequest): Promise<TransactionObject>;
  UpdateTransaction(transactionUuid: string, updateData: UpdateTransactionRequest): Promise<TransactionObject>;
  GetTicketsByTransaction(transactionUuid: string): Promise<TicketObject[]>;
  ExpireOverdueTransactions(): Promise<number>; // Returns count of expired transactions
  CancelOverdueConfirmations(): Promise<number>; // Returns count of canceled transactions
  
  dispose(): Promise<void>;
}