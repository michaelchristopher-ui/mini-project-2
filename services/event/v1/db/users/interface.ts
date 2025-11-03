import { UserObject, CreateUserRequest, UpdateUserRequest } from '../../../entities/entities';

export interface UsersRepo {
  GetUsers(): Promise<UserObject[]>;
  GetUserById(id: number): Promise<UserObject | null>;
  GetUserByUsername(username: string): Promise<UserObject | null>;
  GetUserByReferralCode(referralCode: string): Promise<UserObject | null>;
  CreateUser(userData: CreateUserRequest): Promise<UserObject>;
  UpdateUser(id: number, updateData: UpdateUserRequest): Promise<UserObject>;
  DeleteUser(id: number): Promise<void>;
  AddPointsToUser(userId: number, pointsCount: number, expiry?: Date): Promise<void>;
  CreateWelcomeCoupon(userId: number, discountAmount: number, expiry?: Date): Promise<void>;
  GetUserPoints(userId: number): Promise<any[]>;
  GetUserCoupons(userId: number): Promise<any[]>;
  GetUserPointsSum(userId: number): Promise<number>;
}