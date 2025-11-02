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
exports.MigrationService = void 0;
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MigrationService {
    constructor(prismaClient) {
        this.prisma = prismaClient || new client_1.PrismaClient();
        this.migrationPath = path.join(process.cwd(), 'migration', 'migrate');
    }
    runMigrationsUp() {
        return __awaiter(this, void 0, void 0, function* () {
            const executedFiles = [];
            const errors = [];
            try {
                // Get all .up.sql files and sort them
                const files = fs.readdirSync(this.migrationPath)
                    .filter(file => file.endsWith('.up.sql'))
                    .sort();
                console.log('Found migration files:', files);
                for (const file of files) {
                    try {
                        const filePath = path.join(this.migrationPath, file);
                        const sqlContent = fs.readFileSync(filePath, 'utf8');
                        console.log(`Executing migration: ${file}`);
                        // Execute the SQL content
                        yield this.prisma.$executeRawUnsafe(sqlContent);
                        executedFiles.push(file);
                        console.log(`✓ Successfully executed: ${file}`);
                    }
                    catch (error) {
                        const errorMsg = `Failed to execute ${file}: ${error instanceof Error ? error.message : String(error)}`;
                        console.error(errorMsg);
                        errors.push({ file, error: errorMsg });
                    }
                }
                return { executedFiles, errors };
            }
            catch (error) {
                const errorMsg = `Migration up failed: ${error instanceof Error ? error.message : String(error)}`;
                console.error(errorMsg);
                return {
                    executedFiles,
                    errors: [{ file: 'system', error: errorMsg }]
                };
            }
        });
    }
    runMigrationsDown() {
        return __awaiter(this, void 0, void 0, function* () {
            const executedFiles = [];
            const errors = [];
            try {
                // Get all .down.sql files and sort them in reverse order
                const files = fs.readdirSync(this.migrationPath)
                    .filter(file => file.endsWith('.down.sql'))
                    .sort()
                    .reverse();
                console.log('Found rollback files:', files);
                for (const file of files) {
                    try {
                        const filePath = path.join(this.migrationPath, file);
                        const sqlContent = fs.readFileSync(filePath, 'utf8');
                        console.log(`Executing rollback: ${file}`);
                        // Execute the SQL content
                        yield this.prisma.$executeRawUnsafe(sqlContent);
                        executedFiles.push(file);
                        console.log(`✓ Successfully executed: ${file}`);
                    }
                    catch (error) {
                        const errorMsg = `Failed to execute ${file}: ${error instanceof Error ? error.message : String(error)}`;
                        console.error(errorMsg);
                        errors.push({ file, error: errorMsg });
                    }
                }
                return { executedFiles, errors };
            }
            catch (error) {
                const errorMsg = `Migration down failed: ${error instanceof Error ? error.message : String(error)}`;
                console.error(errorMsg);
                return {
                    executedFiles,
                    errors: [{ file: 'system', error: errorMsg }]
                };
            }
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.$disconnect();
        });
    }
}
exports.MigrationService = MigrationService;
