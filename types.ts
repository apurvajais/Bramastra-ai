
export type Role = "user" | "model";

export interface Message {
  role: Role;
  text: string;
}

export type Language = "Hinglish" | "English" | "Hindi";
