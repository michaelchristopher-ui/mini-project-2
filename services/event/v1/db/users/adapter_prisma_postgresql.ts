import { PrismaClient } from '@prisma/client';
import { UserObject, CreateUserRequest, UpdateUserRequest } from '../../../entities/entities';
import { UsersRepo } from './interface';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';

export class PostgresUsersRepository implements UsersRepo {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async GetUsers(): Promise<UserObject[]> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: { created_at: 'desc' }
      });

      return users.map(user => ({
        id: user.id,
        username: user.username,
        password: (user as any).password,
        profile_picture: user.profile_picture,
        password: (user as any).password,
        role: (user as any).role,
        referral_code: (user as any).referral_code,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
    } catch (error) {
      console.error('Detailed Prisma error in GetUsers:', error);
      throw new Error(`Failed to retrieve users: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetUserById(id: number): Promise<UserObject | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        password: (user as any).password,
        profile_picture: user.profile_picture,
        password: (user as any).password,
        role: (user as any).role,
        referral_code: (user as any).referral_code,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Detailed Prisma error in GetUserById:', error);
      throw new Error(`Failed to retrieve user: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetUserByUsername(username: string): Promise<UserObject | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        password: (user as any).password,
        profile_picture: user.profile_picture,
        password: (user as any).password,
        role: (user as any).role,
        referral_code: (user as any).referral_code,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Detailed Prisma error in GetUserByUsername:', error);
      throw new Error(`Failed to retrieve user by username: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async CreateUser(userData: CreateUserRequest): Promise<UserObject> {
    try {
      // Hash the password using Argon2
      const hashedPassword = await argon2.hash(userData.password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      });

      const newUser = await this.prisma.user.create({
        data: {
          username: userData.username,
          password: hashedPassword,
          profile_picture: userData.profile_picture || null,
          password: userData.password || 'password123', // Default password
          role: userData.role || 1 // Default to customer role
        } as any
      });

      return {
        id: newUser.id,
        username: newUser.username,
        password: (newUser as any).password,
        profile_picture: newUser.profile_picture,
        password: (newUser as any).password,
        role: (newUser as any).role,
        referral_code: (newUser as any).referral_code,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      };
    } catch (error) {
      console.error('Detailed Prisma error in CreateUser:', error);
      console.error('Error message:', (error as any)?.message || 'Unknown error');

      const message: string = (error as any)?.message || '';
      // Fallback path: if Prisma client schema is stale and doesn't recognize `password` column
      // (e.g. due to failed `prisma generate` on Windows/OneDrive causing EPERM), attempt raw SQL insert.
      if (/Unknown arg|Argument .*password|Invalid value .* password|Field does not exist/i.test(message)) {
        console.warn('[CreateUser] Prisma client appears stale. Attempting raw SQL fallback insert for user.');
        try {
          const rawInserted: any[] = await (this.prisma as any).$queryRaw`\n            INSERT INTO event.users (username, password, profile_picture, role)\n            VALUES (${userData.username}, ${await argon2.hash(userData.password)}, ${userData.profile_picture || null}, ${userData.role || 1})\n            RETURNING id, username, password, profile_picture, role, referral_code, created_at, updated_at;\n          `;
          const row = rawInserted[0];
          return {
            id: row.id,
            username: row.username,
            password: row.password,
            profile_picture: row.profile_picture,
            role: row.role,
            referral_code: row.referral_code,
            created_at: row.created_at,
            updated_at: row.updated_at
          };
        } catch (rawError) {
          console.error('[CreateUser] Raw SQL fallback failed:', rawError);
          throw new Error(`Failed to create user (raw fallback also failed): ${(rawError as any)?.message || message || 'Unknown error'}`);
        }
      }
      throw new Error(`Failed to create user: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async UpdateUser(id: number, updateData: UpdateUserRequest): Promise<UserObject> {
    try {
      const updatePayload: any = {};

      if (updateData.username !== undefined) {
        updatePayload.username = updateData.username;
      }

      if (updateData.password !== undefined) {
        // Hash the new password using Argon2
        updatePayload.password = await argon2.hash(updateData.password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16, // 64 MB
          timeCost: 3,
          parallelism: 1,
        });
      }

      if (updateData.profile_picture !== undefined) {
        updatePayload.profile_picture = updateData.profile_picture;
      }

      if (updateData.password !== undefined) {
        updatePayload.password = updateData.password;
      }

      if (updateData.role !== undefined) {
        updatePayload.role = updateData.role;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updatePayload
      });

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        password: (updatedUser as any).password,
        profile_picture: updatedUser.profile_picture,
        password: (updatedUser as any).password,
        role: (updatedUser as any).role,
        referral_code: (updatedUser as any).referral_code,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      };
    } catch (error) {
      console.error('Detailed Prisma error in UpdateUser:', error);
      const message: string = (error as any)?.message || '';
      if (/Unknown arg|Argument .*password|Field does not exist/i.test(message)) {
        console.warn('[UpdateUser] Prisma client appears stale. Attempting raw SQL fallback update for user.');
        try {
          // Build dynamic SET clauses
          const sets: string[] = [];
          const values: any[] = [];
          let paramIndex = 1;
          if (updateData.username !== undefined) {
            sets.push(`username = $${paramIndex++}`); values.push(updateData.username);
          }
          if (updateData.password !== undefined) {
            sets.push(`password = $${paramIndex++}`); values.push(await argon2.hash(updateData.password));
          }
            if (updateData.profile_picture !== undefined) {
            sets.push(`profile_picture = $${paramIndex++}`); values.push(updateData.profile_picture || null);
          }
          if (updateData.role !== undefined) {
            sets.push(`role = $${paramIndex++}`); values.push(updateData.role);
          }
          if (sets.length === 0) {
            // Nothing to update, just fetch existing user
            const existing: any[] = await (this.prisma as any).$queryRaw`SELECT id, username, password, profile_picture, role, referral_code, created_at, updated_at FROM event.users WHERE id = ${id}`;
            if (!existing[0]) throw new Error('User not found');
            const row = existing[0];
            return {
              id: row.id,
              username: row.username,
              password: row.password,
              profile_picture: row.profile_picture,
              role: row.role,
              referral_code: row.referral_code,
              created_at: row.created_at,
              updated_at: row.updated_at
            };
          }
          const setClause = sets.join(', ');
          // Construct raw SQL with parameters via template to avoid injection
          const sql = `UPDATE event.users SET ${setClause}, updated_at = NOW() WHERE id = $${paramIndex++} RETURNING id, username, password, profile_picture, role, referral_code, created_at, updated_at;`;
          values.push(id);
          // Use $executeRawUnsafe for dynamic parameter count, then fetch row via $queryRawUnsafe
          // Instead we can compose using pg formatting, but simplest is using node-postgres parameterization through Prisma: not exposed, so fall back to unsafe with manual escaping caution.
          // Minimal escaping: rely on pg parameterization isn't available here, so reject if any string contains single quotes as ultra-safety (could enhance later).
          for (const v of values) {
            if (typeof v === 'string' && v.includes("'")) {
              throw new Error('Unsafe character detected in input value for raw fallback.');
            }
          }
          const paramLiteralValues = values.map(v => v === null ? 'NULL' : (typeof v === 'number' ? v : `'${v}'`));
          // Replace $1.. with literal values for execution
          let finalSql = sql;
          values.forEach((_, idx) => {
            finalSql = finalSql.replace(new RegExp(`\$${idx + 1}`, 'g'), String(paramLiteralValues[idx]));
          });
          const updatedRows: any[] = await (this.prisma as any).$queryRawUnsafe(finalSql);
          const row = updatedRows[0];
          return {
            id: row.id,
            username: row.username,
            password: row.password,
            profile_picture: row.profile_picture,
            role: row.role,
            referral_code: row.referral_code,
            created_at: row.created_at,
            updated_at: row.updated_at
          };
        } catch (rawError) {
          console.error('[UpdateUser] Raw SQL fallback failed:', rawError);
          throw new Error(`Failed to update user (raw fallback also failed): ${(rawError as any)?.message || message || 'Unknown error'}`);
        }
      }
      throw new Error(`Failed to update user: ${message || 'Unknown error'}`);
    }
  }

  async DeleteUser(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Detailed Prisma error in DeleteUser:', error);
      throw new Error(`Failed to delete user: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetUserByReferralCode(referralCode: string): Promise<UserObject | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { referral_code: referralCode }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        password: (user as any).password,
        profile_picture: user.profile_picture,
        password: (user as any).password,
        role: (user as any).role,
        referral_code: (user as any).referral_code,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Detailed Prisma error in GetUserByReferralCode:', error);
      throw new Error(`Failed to retrieve user by referral code: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async AddPointsToUser(userId: number, pointsCount: number, expiry?: Date): Promise<void> {
    try {
      await this.prisma.point.create({
        data: {
          user_id: userId,
          points_count: pointsCount,
          expiry: expiry || null
        }
      });
    } catch (error) {
      console.error('Detailed Prisma error in AddPointsToUser:', error);
      throw new Error(`Failed to add points to user: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async CreateWelcomeCoupon(userId: number, discountAmount: number, expiry?: Date): Promise<void> {
    try {
      await (this.prisma as any).coupon.create({
        data: {
          user_id: userId,
          discount_amount: discountAmount
        }
      });
    } catch (error) {
      console.error('Detailed Prisma error in CreateWelcomeCoupon:', error);
      throw new Error(`Failed to create welcome coupon: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetUserPoints(userId: number): Promise<any[]> {
    try {
      const points = await (this.prisma as any).points.findMany({
        where: {
          user_id: userId
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      return points || [];
    } catch (error) {
      console.error('Detailed Prisma error in GetUserPoints:', error);
      throw new Error(`Failed to get user points: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetUserCoupons(userId: number): Promise<any[]> {
    try {
      const coupons = await (this.prisma as any).coupon.findMany({
        where: {
          user_id: userId
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      return coupons || [];
    } catch (error) {
      console.error('Detailed Prisma error in GetUserCoupons:', error);
      throw new Error(`Failed to get user coupons: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetCouponById(couponId: number): Promise<any | null> {
    try {
      const coupon = await (this.prisma as any).coupon.findUnique({
        where: {
          id: couponId,
          is_active: true  // Only return active coupons
        }
      });
      return coupon || null;
    } catch (error) {
      console.error('Detailed Prisma error in GetCouponById:', error);
      throw new Error(`Failed to get coupon: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async GetUserPointsSum(userId: number): Promise<number> {
    try {
      const now = new Date();
      
      // Get all points that are either not expired or have no expiry date
      const result = await (this.prisma as any).points.aggregate({
        where: {
          user_id: userId,
          OR: [
            { expiry: null }, // No expiry date
            { expiry: { gt: now } } // Expiry date is in the future
          ]
        },
        _sum: {
          points_count: true
        }
      });
      
      return result._sum.points_count || 0;
    } catch (error) {
      console.error('Detailed Prisma error in GetUserPointsSum:', error);
      throw new Error(`Failed to get user points sum: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async ResetUserPassword(userId: number): Promise<UserObject> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { password: 'password123' } as any // Reset to default password
      });

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        profile_picture: updatedUser.profile_picture,
        password: (updatedUser as any).password,
        role: (updatedUser as any).role,
        referral_code: (updatedUser as any).referral_code,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      };
    } catch (error) {
      console.error('Detailed Prisma error in ResetUserPassword:', error);
      throw new Error(`Failed to reset user password: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }
}