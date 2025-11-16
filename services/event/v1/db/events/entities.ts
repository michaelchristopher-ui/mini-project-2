export type Entity = {
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
  created_at: Date | null;
  created_by: number;
};
