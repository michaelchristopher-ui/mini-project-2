"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
class UsersController {
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
    }
    GetUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement GetUsers handler
            res.status(501).json({
                success: false,
                data: null,
                message: 'GetUsers not implemented yet'
            });
        });
    }
    GetUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                // Validate user ID parameter
                if (isNaN(userId) || userId <= 0) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid user ID. Must be a positive number.'
                    });
                    return;
                }
                // Get the user
                const user = yield this.usersRepo.GetUserById(userId);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'User not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: user,
                    message: 'User retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetUserById:', error);
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve user'
                });
            }
        });
    }
    GetUserByUsername(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement GetUserByUsername handler
            res.status(501).json({
                success: false,
                data: null,
                message: 'GetUserByUsername not implemented yet'
            });
        });
    }
    CreateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[UsersController.CreateUser] Incoming body:', req.body);
                const { username, password, profile_picture, role, referred_by_code } = req.body;
                // Validate required fields
                if (!username || typeof username !== 'string' || username.trim() === '') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Username is required and must be a non-empty string'
                    });
                    return;
                }
                // Validate password
                if (!password || typeof password !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Password is required and must be a string'
                    });
                    return;
                }
                // Validate password strength
                if (password.length < 8) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Password must be at least 8 characters long'
                    });
                    return;
                }
                if (password.length > 128) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Password cannot exceed 128 characters'
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
                    referringUser = yield this.usersRepo.GetUserByReferralCode(referred_by_code.trim());
                    if (!referringUser) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Invalid referral code. The referring user does not exist.'
                        });
                        return;
                    }
                }
                const userData = {
                    username: username.trim(),
                    password: password,
                    profile_picture: (profile_picture === null || profile_picture === void 0 ? void 0 : profile_picture.trim()) || undefined,
                    role: role || 1, // Default to customer role if not provided
                    referred_by_code: (referred_by_code === null || referred_by_code === void 0 ? void 0 : referred_by_code.trim()) || undefined
                };
                console.log('[UsersController.CreateUser] Prepared userData:', userData);
                const newUser = yield this.usersRepo.CreateUser(userData);
                console.log('[UsersController.CreateUser] Created user id:', newUser.id);
                // If there's a valid referral, credit points to the referring user and create welcome coupon for new user
                if (referringUser) {
                    try {
                        // Set expiry to 3 months from now
                        const expiryDate = new Date();
                        expiryDate.setMonth(expiryDate.getMonth() + 3);
                        yield this.usersRepo.AddPointsToUser(referringUser.id, 10000, expiryDate); // Credit 10,000 points with 3-month expiry
                        console.log(`Referral bonus credited: ${10000} points to user ${referringUser.id} (${referringUser.username}) for referring ${newUser.username}, expires: ${expiryDate.toISOString()}`);
                        // Create welcome discount coupon for the new user
                        try {
                            yield this.usersRepo.CreateWelcomeCoupon(newUser.id, 10000);
                            console.log(`Welcome coupon created: 10000 discount coupon for new user ${newUser.id} (${newUser.username})`);
                        }
                        catch (couponError) {
                            console.error('Failed to create welcome coupon:', couponError);
                            // Don't fail if coupon creation fails, it's a bonus feature
                        }
                    }
                    catch (pointsError) {
                        console.error('Failed to credit referral points:', pointsError);
                        // Don't fail the user creation if points crediting fails
                    }
                }
                res.status(201).json({
                    success: true,
                    data: newUser,
                    message: 'User created successfully'
                });
            }
            catch (error) {
                console.error('Error in CreateUser:', error);
                console.error('[UsersController.CreateUser] Error stack:', error === null || error === void 0 ? void 0 : error.stack);
                const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error';
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
                    message: 'Failed to create user',
                    debug: errorMessage
                });
            }
        });
    }
    UpdateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                const { username, password, profile_picture, role } = req.body;
                // Validate user ID parameter
                if (isNaN(userId) || userId <= 0) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Invalid user ID. Must be a positive number.'
                    });
                    return;
                }
                // Validate that at least one field is provided for update
                if (username === undefined && password === undefined && profile_picture === undefined && role === undefined) {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'At least one field (username, password, profile_picture, or role) must be provided for update'
                    });
                    return;
                }
                // Validate username if provided
                if (username !== undefined) {
                    if (typeof username !== 'string' || username.trim() === '') {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Username must be a non-empty string if provided'
                        });
                        return;
                    }
                }
                // Validate profile_picture if provided
                if (profile_picture !== undefined && typeof profile_picture !== 'string') {
                    res.status(400).json({
                        success: false,
                        data: null,
                        message: 'Profile picture must be a string if provided'
                    });
                    return;
                }
                // Validate role if provided
                if (role !== undefined) {
                    if (typeof role !== 'number' || ![1, 2].includes(role)) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Role must be 1 (customer) or 2 (event_organizer) if provided'
                        });
                        return;
                    }
                }
                // Validate password if provided
                if (password !== undefined) {
                    if (typeof password !== 'string') {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Password must be a string if provided'
                        });
                        return;
                    }
                    if (password.length < 8) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Password must be at least 8 characters long'
                        });
                        return;
                    }
                    if (password.length > 128) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Password cannot exceed 128 characters'
                        });
                        return;
                    }
                    // Optional basic strength check (at least one letter and one number)
                    const hasLetter = /[A-Za-z]/.test(password);
                    const hasNumber = /\d/.test(password);
                    if (!hasLetter || !hasNumber) {
                        res.status(400).json({
                            success: false,
                            data: null,
                            message: 'Password must contain at least one letter and one number'
                        });
                        return;
                    }
                }
                // Check if user exists
                const existingUser = yield this.usersRepo.GetUserById(userId);
                if (!existingUser) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'User not found'
                    });
                    return;
                }
                // Prepare update data
                const updateData = {};
                if (username !== undefined) {
                    updateData.username = username.trim();
                }
                if (password !== undefined) {
                    updateData.password = password; // Hashing handled in repository
                }
                if (profile_picture !== undefined) {
                    updateData.profile_picture = profile_picture;
                }
                if (role !== undefined) {
                    updateData.role = role;
                }
                // Update the user
                const updatedUser = yield this.usersRepo.UpdateUser(userId, updateData);
                res.status(200).json({
                    success: true,
                    data: updatedUser,
                    message: 'User updated successfully'
                });
            }
            catch (error) {
                console.error('Error in UpdateUser:', error);
                const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error';
                // Check for specific error types
                if (errorMessage.includes('Unique constraint')) {
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
                    message: 'Failed to update user'
                });
            }
        });
    }
    DeleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement DeleteUser handler (soft delete)
            res.status(501).json({
                success: false,
                data: null,
                message: 'DeleteUser not implemented yet'
            });
        });
    }
    LoginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement LoginUser handler (username-only authentication)
            res.status(501).json({
                success: false,
                data: null,
                message: 'LoginUser not implemented yet'
            });
        });
    }
    GetUserPoints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const points = yield this.usersRepo.GetUserPoints(userId);
                res.status(200).json({
                    success: true,
                    data: { points },
                    message: 'User points retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetUserPoints:', error);
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve user points'
                });
            }
        });
    }
    GetUserCoupons(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const coupons = yield this.usersRepo.GetUserCoupons(userId);
                res.status(200).json({
                    success: true,
                    data: { coupons },
                    message: 'User coupons retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetUserCoupons:', error);
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve user coupons'
                });
            }
        });
    }
    GetUserPointsSum(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const user = yield this.usersRepo.GetUserById(userId);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        data: null,
                        message: 'User not found'
                    });
                    return;
                }
                // Get sum of non-expired points for the user
                const pointsSum = yield this.usersRepo.GetUserPointsSum(userId);
                res.status(200).json({
                    success: true,
                    data: {
                        user_id: userId,
                        username: user.username,
                        total_points: pointsSum
                    },
                    message: 'User points sum retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error in GetUserPointsSum:', error);
                res.status(500).json({
                    success: false,
                    data: null,
                    message: 'Failed to retrieve user points sum'
                });
            }
        });
    }
}
exports.UsersController = UsersController;
