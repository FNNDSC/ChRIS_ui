import type { ID } from "./id";

export interface User {
  id: ID;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface AuthToken {
  token: string;
}
