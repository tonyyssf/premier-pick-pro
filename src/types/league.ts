
export interface League {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  max_members: number | null;
  created_at: string;
  member_count?: number;
  is_creator?: boolean;
  is_member?: boolean;
}

export interface LeagueMember {
  id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    username: string | null;
    name: string | null;
    email: string | null;
  } | null;
}
