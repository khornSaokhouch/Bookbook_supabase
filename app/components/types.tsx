// types.ts
export type Event = {
    event_id: string;
    admin_id: string | null; // Make sure it's nullable
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    image_url: string;
  };

export type User = {
    user_id: string;
    name: string;
  };