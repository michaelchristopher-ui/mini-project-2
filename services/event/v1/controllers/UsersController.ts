import { Request, Response } from 'express';
import { UserObject, CreateUserRequest, UpdateUserRequest } from '../../entities/entities';
import { UsersRepo } from '../db/users/interface';

export class UsersController {
  private usersRepo: UsersRepo;

  constructor(usersRepo: UsersRepo) {
    this.usersRepo = usersRepo;
  }

  async GetUsers(req: Request, res: Response): Promise<void> {
    // TODO: Implement GetUsers handler
    res.status(501).json({
      success: false,
      data: null,
      message: 'GetUsers not implemented yet'
    });
  }

  async GetUserById(req: Request, res: Response): Promise<void> {
    // TODO: Implement GetUserById handler
    res.status(501).json({
      success: false,
      data: null,
      message: 'GetUserById not implemented yet'
    });
  }

  async GetUserByUsername(req: Request, res: Response): Promise<void> {
    // TODO: Implement GetUserByUsername handler
    res.status(501).json({
      success: false,
      data: null,
      message: 'GetUserByUsername not implemented yet'
    });
  }

  async CreateUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, profile_picture, role, referred_by_code } = req.body;

      // Validate required fields
      if (!username || typeof username !== 'string' || username.trim() === '') {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Username is required and must be a non-empty string'
        });
        return;
      }

      // Validate username length (considering database VARCHAR(255) limit)
      if (username.length > 255) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Username cannot exceed 255 characters'
        });
        return;
      }

      // Validate username format (alphanumeric, underscore, hyphen only)
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Username can only contain letters, numbers, underscores, and hyphens'
        });
        return;
      }

      // Validate profile_picture if provided
      if (profile_picture !== undefined && typeof profile_picture !== 'string') {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Profile picture must be a string URL if provided'
        });
        return;
      }

      // Validate role if provided
      if (role !== undefined) {
        if (typeof role !== 'number' || !Number.isInteger(role) || (role !== 1 && role !== 2)) {
          res.status(400).json({
            success: false,
            data: null,
            message: 'Role must be 1 (customer) or 2 (event_organizer)'
          });
          return;
        }
      }

      // Validate referral code if provided
      let referringUser = null;
      if (referred_by_code !== undefined) {
        if (typeof referred_by_code !== 'string' || referred_by_code.trim() === '') {
          res.status(400).json({
            success: false,
            data: null,
            message: 'Referral code must be a non-empty string if provided'
          });
          return;
        }

        // Check if the referral code exists
        referringUser = await this.usersRepo.GetUserByReferralCode(referred_by_code.trim());
        if (!referringUser) {
          res.status(400).json({
            success: false,
            data: null,
            message: 'Invalid referral code. The referring user does not exist.'
          });
          return;
        }
      }

      const userData: CreateUserRequest = {
        username: username.trim(),
        profile_picture: profile_picture?.trim() || undefined,
        role: role || 1, // Default to customer role if not provided
        referred_by_code: referred_by_code?.trim() || undefined
      };

      const newUser = await this.usersRepo.CreateUser(userData);

      // If there's a valid referral, credit points to the referring user and create welcome coupon for new user
      if (referringUser) {
        try {
          // Set expiry to 3 months from now
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          
          await this.usersRepo.AddPointsToUser(referringUser.id, 10000, expiryDate); // Credit 10,000 points with 3-month expiry
          console.log(`Referral bonus credited: ${10000} points to user ${referringUser.id} (${referringUser.username}) for referring ${newUser.username}, expires: ${expiryDate.toISOString()}`);
          
          // Create welcome discount coupon for the new user
          try {
            await this.usersRepo.CreateWelcomeCoupon(newUser.id, 10000);
            console.log(`Welcome coupon created: 10000 discount coupon for new user ${newUser.id} (${newUser.username})`);
          } catch (couponError) {
            console.error('Failed to create welcome coupon:', couponError);
            // Don't fail if coupon creation fails, it's a bonus feature
          }
        } catch (pointsError) {
          console.error('Failed to credit referral points:', pointsError);
          // Don't fail the user creation if points crediting fails
        }
      }

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error in CreateUser:', error);

      const errorMessage = (error as Error)?.message || 'Unknown error';

      // Check for duplicate username error
      if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
        res.status(409).json({
          success: false,
          data: null,
          message: 'Username already exists. Please choose a different username.'
        });
        return;
      }

      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to create user'
      });
    }
  }

  async UpdateUser(req: Request, res: Response): Promise<void> {
    // TODO: Implement UpdateUser handler
    res.status(501).json({
      success: false,
      data: null,
      message: 'UpdateUser not implemented yet'
    });
  }

  async DeleteUser(req: Request, res: Response): Promise<void> {
    // TODO: Implement DeleteUser handler (soft delete)
    res.status(501).json({
      success: false,
      data: null,
      message: 'DeleteUser not implemented yet'
    });
  }

  async LoginUser(req: Request, res: Response): Promise<void> {
    // TODO: Implement LoginUser handler (username-only authentication)
    res.status(501).json({
      success: false,
      data: null,
      message: 'LoginUser not implemented yet'
    });
  }

  async GetUserPoints(req: Request, res: Response): Promise<void> {
    try {
      const userIdStr = req.params.userId;
      
      if (!userIdStr) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'User ID is required'
        });
        return;
      }

      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Invalid User ID format'
        });
        return;
      }

      // Get user points from database
      const points = await this.usersRepo.GetUserPoints(userId);
      
      res.status(200).json({
        success: true,
        data: { points },
        message: 'User points retrieved successfully'
      });
    } catch (error) {
      console.error('Error in GetUserPoints:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve user points'
      });
    }
  }

  async GetUserCoupons(req: Request, res: Response): Promise<void> {
    try {
      const userIdStr = req.params.userId;
      
      if (!userIdStr) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'User ID is required'
        });
        return;
      }

      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Invalid User ID format'
        });
        return;
      }

      // Get user coupons from database
      const coupons = await this.usersRepo.GetUserCoupons(userId);
      
      res.status(200).json({
        success: true,
        data: { coupons },
        message: 'User coupons retrieved successfully'
      });
    } catch (error) {
      console.error('Error in GetUserCoupons:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve user coupons'
      });
    }
  }

  async GetUserPointsSum(req: Request, res: Response): Promise<void> {
    try {
      const userIdStr = req.params.userId;
      
      if (!userIdStr) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'User ID is required'
        });
        return;
      }

      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Invalid User ID format'
        });
        return;
      }

      // Check if user exists
      const user = await this.usersRepo.GetUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          data: null,
          message: 'User not found'
        });
        return;
      }

      // Get sum of non-expired points for the user
      const pointsSum = await this.usersRepo.GetUserPointsSum(userId);
      
      res.status(200).json({
        success: true,
        data: {
          user_id: userId,
          username: user.username,
          total_points: pointsSum
        },
        message: 'User points sum retrieved successfully'
      });
    } catch (error) {
      console.error('Error in GetUserPointsSum:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to retrieve user points sum'
      });
    }
  }
}
