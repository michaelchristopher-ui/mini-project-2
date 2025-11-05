"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const argon2 = __importStar(require("argon2"));
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
                    password: user.password,
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
                    password: user.password,
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
                    password: user.password,
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
                // Hash the password using Argon2
                const hashedPassword = yield argon2.hash(userData.password, {
                    type: argon2.argon2id,
                    memoryCost: 2 ** 16, // 64 MB
                    timeCost: 3,
                    parallelism: 1,
                });
                const newUser = yield this.prisma.user.create({
                    data: {
                        username: userData.username,
                        password: hashedPassword,
                        profile_picture: userData.profile_picture || null,
                        role: userData.role || 1 // Default to customer role
                    }
                });
                return {
                    id: newUser.id,
                    username: newUser.username,
                    password: newUser.password,
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
                const message = (error === null || error === void 0 ? void 0 : error.message) || '';
                // Fallback path: if Prisma client schema is stale and doesn't recognize `password` column
                // (e.g. due to failed `prisma generate` on Windows/OneDrive causing EPERM), attempt raw SQL insert.
                if (/Unknown arg|Argument .*password|Invalid value .* password|Field does not exist/i.test(message)) {
                    console.warn('[CreateUser] Prisma client appears stale. Attempting raw SQL fallback insert for user.');
                    try {
                        const rawInserted = yield this.prisma.$queryRaw `\n            INSERT INTO event.users (username, password, profile_picture, role)\n            VALUES (${userData.username}, ${yield argon2.hash(userData.password)}, ${userData.profile_picture || null}, ${userData.role || 1})\n            RETURNING id, username, password, profile_picture, role, referral_code, created_at, updated_at;\n          `;
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
                    }
                    catch (rawError) {
                        console.error('[CreateUser] Raw SQL fallback failed:', rawError);
                        throw new Error(`Failed to create user (raw fallback also failed): ${(rawError === null || rawError === void 0 ? void 0 : rawError.message) || message || 'Unknown error'}`);
                    }
                }
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
                if (updateData.password !== undefined) {
                    // Hash the new password using Argon2
                    updatePayload.password = yield argon2.hash(updateData.password, {
                        type: argon2.argon2id,
                        memoryCost: 2 ** 16, // 64 MB
                        timeCost: 3,
                        parallelism: 1,
                    });
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
                    password: updatedUser.password,
                    profile_picture: updatedUser.profile_picture,
                    role: updatedUser.role,
                    referral_code: updatedUser.referral_code,
                    created_at: updatedUser.created_at,
                    updated_at: updatedUser.updated_at
                };
            }
            catch (error) {
                console.error('Detailed Prisma error in UpdateUser:', error);
                const message = (error === null || error === void 0 ? void 0 : error.message) || '';
                if (/Unknown arg|Argument .*password|Field does not exist/i.test(message)) {
                    console.warn('[UpdateUser] Prisma client appears stale. Attempting raw SQL fallback update for user.');
                    try {
                        // Build dynamic SET clauses
                        const sets = [];
                        const values = [];
                        let paramIndex = 1;
                        if (updateData.username !== undefined) {
                            sets.push(`username = $${paramIndex++}`);
                            values.push(updateData.username);
                        }
                        if (updateData.password !== undefined) {
                            sets.push(`password = $${paramIndex++}`);
                            values.push(yield argon2.hash(updateData.password));
                        }
                        if (updateData.profile_picture !== undefined) {
                            sets.push(`profile_picture = $${paramIndex++}`);
                            values.push(updateData.profile_picture || null);
                        }
                        if (updateData.role !== undefined) {
                            sets.push(`role = $${paramIndex++}`);
                            values.push(updateData.role);
                        }
                        if (sets.length === 0) {
                            // Nothing to update, just fetch existing user
                            const existing = yield this.prisma.$queryRaw `SELECT id, username, password, profile_picture, role, referral_code, created_at, updated_at FROM event.users WHERE id = ${id}`;
                            if (!existing[0])
                                throw new Error('User not found');
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
                        const updatedRows = yield this.prisma.$queryRawUnsafe(finalSql);
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
                    }
                    catch (rawError) {
                        console.error('[UpdateUser] Raw SQL fallback failed:', rawError);
                        throw new Error(`Failed to update user (raw fallback also failed): ${(rawError === null || rawError === void 0 ? void 0 : rawError.message) || message || 'Unknown error'}`);
                    }
                }
                throw new Error(`Failed to update user: ${message || 'Unknown error'}`);
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
                    password: user.password,
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
    GetCouponById(couponId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coupon = yield this.prisma.coupon.findUnique({
                    where: {
                        id: couponId,
                        is_active: true // Only return active coupons
                    }
                });
                return coupon || null;
            }
            catch (error) {
                console.error('Detailed Prisma error in GetCouponById:', error);
                throw new Error(`Failed to get coupon: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
            }
        });
    }
    GetUserPointsSum(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                // Get all points that are either not expired or have no expiry date
                const result = yield this.prisma.points.aggregate({
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
            }
            catch (error) {
                console.error('Detailed Prisma error in GetUserPointsSum:', error);
                throw new Error(`Failed to get user points sum: ${(error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'}`);
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
