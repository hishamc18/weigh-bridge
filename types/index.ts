export interface IUser {
  _id: string;
  username: string;
  password: string;
  sessionExpiryDays: number;
  createdAt: Date;
}

export interface IShop {
  _id: string;
  title: string;
  location: string;
  weight: number; // the tonne capacity number shown on bill
  createdAt: Date;
}

export interface IBill {
  _id: string;
  billNo: string;
  shop: IShop | string;
  vehicleNo: string;
  printDate: string;
  material: string;
  grossWeight: number;
  grossTime: string;
  tareWeight: number;
  tareTime: string;
  netWeight: number;
  weighmentCharges: number;
  operatorSign: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}