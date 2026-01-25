export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  session_id: string;
}
