export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  GUEST = "GUEST",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
