export type User = {
  user_id: number;  // Number instead of string
  user_name: string;
  email: string;
  role: string;
};

export type Event = {
  event_id: string;
  admin_id: number | null; // Number instead of string
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
};
