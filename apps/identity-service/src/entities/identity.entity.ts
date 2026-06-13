export interface IUserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleEntity {
  id: string;
  name: string;
  description: string | null;
}

export interface IPermissionEntity {
  id: string;
  action: string;
}
