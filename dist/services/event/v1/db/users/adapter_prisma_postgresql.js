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
exports.PostgresUsersRepository = void 0;
class PostgresUsersRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    GetUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.prisma.user.findMany({
                    orderBy: { created_at: 'desc' }
                });
                return users.map(user => ({
                    id: user.id,
                    username: user.username,
                    profile_picture: user.profile_picture,
                    role: user.role,
                    referral_code: user.referral_code,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                }));
            }
            catch (error) {
                console.error('Detailed Prisma error in GetUsers:', error);
                throw new Error(`Failed to retrieve users: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    GetUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.prisma.user.findUnique({
                    where: { id }
                });
                if (!user) {
                    return null;
                }
                return {
                    id: user.id,
                    username: user.username,
                    profile_picture: user.profile_picture,
                    role: user.role,
                    referral_code: user.referral_code,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                };
            }
            catch (error) {
                console.error('Detailed Prisma error in GetUserById:', error);
                throw new Error(`Failed to retrieve user: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    GetUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.prisma.user.findUnique({
                    where: { username }
                });
                if (!user) {
                    return null;
                }
                return {
                    id: user.id,
                    username: user.username,
                    profile_picture: user.profile_picture,
                    role: user.role,
                    referral_code: user.referral_code,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                };
            }
            catch (error) {
                console.error('Detailed Prisma error in GetUserByUsername:', error);
                throw new Error(`Failed to retrieve user by username: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    CreateUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = yield this.prisma.user.create({
                    data: {
                        username: userData.username,
                        profile_picture: userData.profile_picture || null,
                        role: userData.role || 1 // Default to customer role
                    }
                });
                return {
                    id: newUser.id,
                    username: newUser.username,
                    profile_picture: newUser.profile_picture,
                    role: newUser.role,
                    referral_code: newUser.referral_code,
                    created_at: newUser.created_at,
                    updated_at: newUser.updated_at
                };
            }
            catch (error) {
                console.error('Detailed Prisma error in CreateUser:', error);
                console.error('Error message:', (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error');
                throw new Error(`Failed to create user: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    UpdateUser(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatePayload = {};
                if (updateData.username !== undefined) {
                    updatePayload.username = updateData.username;
                }
                if (updateData.profile_picture !== undefined) {
                    updatePayload.profile_picture = updateData.profile_picture;
                }
                if (updateData.role !== undefined) {
                    updatePayload.role = updateData.role;
                }
                const updatedUser = yield this.prisma.user.update({
                    where: { id },
                    data: updatePayload
                });
                return {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    profile_picture: updatedUser.profile_picture,
                    role: updatedUser.role,
                    referral_code: updatedUser.referral_code,
                    created_at: updatedUser.created_at,
                    updated_at: updatedUser.updated_at
                };
            }
            catch (error) {
                console.error('Detailed Prisma error in UpdateUser:', error);
                throw new Error(`Failed to update user: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    DeleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.user.delete({
                    where: { id }
                });
            }
            catch (error) {
                console.error('Detailed Prisma error in DeleteUser:', error);
                throw new Error(`Failed to delete user: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    GetUserByReferralCode(referralCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.prisma.user.findUnique({
                    where: { referral_code: referralCode }
                });
                if (!user) {
                    return null;
                }
                return {
                    id: user.id,
                    username: user.username,
                    profile_picture: user.profile_picture,
                    role: user.role,
                    referral_code: user.referral_code,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                };
            }
            catch (error) {
                console.error('Detailed Prisma error in GetUserByReferralCode:', error);
                throw new Error(`Failed to retrieve user by referral code: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    AddPointsToUser(userId, pointsCount, expiry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.point.create({
                    data: {
                        user_id: userId,
                        points_count: pointsCount,
                        expiry: expiry || null
                    }
                });
            }
            catch (error) {
                console.error('Detailed Prisma error in AddPointsToUser:', error);
                throw new Error(`Failed to add points to user: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    CreateWelcomeCoupon(userId, discountAmount, expiry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.coupon.create({
                    data: {
                        user_id: userId,
                        discount_amount: discountAmount
                    }
                });
            }
            catch (error) {
                console.error('Detailed Prisma error in CreateWelcomeCoupon:', error);
                throw new Error(`Failed to create welcome coupon: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    GetUserPoints(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const points = yield this.prisma.points.findMany({
                    where: {
                        user_id: userId
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                return points || [];
            }
            catch (error) {
                console.error('Detailed Prisma error in GetUserPoints:', error);
                throw new Error(`Failed to get user points: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    GetUserCoupons(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coupons = yield this.prisma.coupon.findMany({
                    where: {
                        user_id: userId
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                return coupons || [];
            }
            catch (error) {
                console.error('Detailed Prisma error in GetUserCoupons:', error);
                throw new Error(`Failed to get user coupons: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.$disconnect();
        });
    }
}
exports.PostgresUsersRepository = PostgresUsersRepository;
