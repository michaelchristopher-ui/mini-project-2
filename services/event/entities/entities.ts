export type EventObject = {
  id: number;
  uuid: string;
  name: string;
  start_date: Date;
  end_date: Date | null;
  available_seats: number;
  description: string | null;
  ticket_type_id: string | null;
  event_type: string | null;
  category_id: number | null;
  status: string; // 'atv' | 'del'
  created_at: Date;
  created_by : number;
};

export type CreateEventRequest = {
  name: string;
  start_date: string; // ISO string format
  end_date?: string; // ISO string format, optional
  available_seats: number;
  description?: string;
  ticket_type_id?: string;
  event_type?: string;
  category_id?: number;
  created_by: number;
};

export type TicketObject = {
  id: number;
  uuid: string;
  event_id: number;
  price: number;
  created_at: Date;
  updated_at: Date;
  status: string; // 'atv' | 'del'
};

export type CreateTicketRequest = {
  price: number;
};

export type VoucherObject = {
  id: number;
  uuid: string;
  event_id: number;
  code: string;
  discount_type: string; // 'percentage' | 'fixed'
  discount_amount: number;
  max_uses: number | null;
  used_count: number;
  start_date: Date;
  end_date: Date;
  status: string; // 'atv' | 'del'
  created_at: Date;
  updated_at: Date;
};

export type CreateVoucherRequest = {
  code: string;
  discount_type: string; // 'percentage' | 'fixed'
  discount_amount: number;
  max_uses?: number;
  start_date: string; // ISO string format
  end_date: string; // ISO string format
};

export type TransactionObject = {
  id: number;
  uuid: string;
  event_id: number;
  status: number; // 1=Waiting for Payment, 2=Waiting for Confirmation, 3=Completed, 4=Expired, 5=Canceled, 6=Rejected
  remaining_price: number;
  created_at: Date;
  created_by: number | null;
  confirmed_at: Date | null;
  confirmed_by: number | null;
  // Optional pricing information (only present on transaction creation)
  total_price?: number;
  points_used?: number;
  discount_applied?: number;
  // image_url of uploaded payment proof
  image_url?: string;
};

export type TicketTransactionObject = {
  transaction_id: number;
  ticket_id: number;
  quantity: number;
};

export type CreateTransactionRequest = {
  event_id: number;
  created_by?: number;
  ticket_ids: { [ticketId: number]: number }; // Object mapping ticket ID to quantity
  points_to_use?: number; // Optional points to use for payment
  voucher_ids?: number[]; // Optional array of voucher IDs to apply
  coupon_ids?: number[]; // Optional array of coupon IDs to apply
};

export type UpdateTransactionRequest = {
  status?: number;
  confirmed_by?: number;
  confirmed_at?: string; // ISO string format
  image_url?: string; // URL of uploaded payment proof
};

export type PointObject = {
  id: number;
  user_id: number;
  points_count: number;
  expiry: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CreatePointRequest = {
  user_id: number;
  points_count: number;
  expiry?: string; // ISO string format, optional
};

export type UpdatePointRequest = {
  points_count?: number;
  expiry?: string; // ISO string format, optional
};

export type UserObject = {
  id: number;
  username: string;
  password: string; // Argon2 hashed password
  profile_picture: string | null;

  role: number; // 1 = customer, 2 = event_organizer
  referral_code: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateUserRequest = {
  username: string;
  profile_picture?: string;
  password?: string; // Optional, defaults to 'password123'
  role?: number; // Optional, defaults to 1 (customer)
  referred_by_code?: string; // Optional referral code from existing user
};

export type UpdateUserRequest = {
  username?: string;
  profile_picture?: string;
  password?: string;
  role?: number; // 1 = customer, 2 = event_organizer
};

export type CouponObject = {
  id: number;
  user_id: number;
  discount_amount: number;
  created_at: Date;
};

export type CreateCouponRequest = {
  user_id: number;
  discount_amount: number;
};

export type UpdateCouponRequest = {
  discount_amount?: number;
};

export type CreateReviewRequest = {
  event_id: number;
  created_by: number;
  rating: number;
  comment?: string;
};

export type GetReviewRequest = {
  created_by?: number;
  event_id?: number;
};

export type ReviewObject = {
  id: number;
  event_id: number;
  created_by: number;
  rating: number;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
};