export type QueryObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type TLogin = {
  email: string;
  password: string;
};
export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type TResetPassword = {
  newPassword: string;
  confirmPassword: string;
};

export interface IJwtPayload {
  userId: string;
  role: string;
  email:string;
}
