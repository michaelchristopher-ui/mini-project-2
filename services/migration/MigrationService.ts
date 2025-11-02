import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export class MigrationService {
  private prisma: PrismaClient;
  private migrationPath: string;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
    this.migrationPath = path.join(process.cwd(), 'migration', 'migrate');
  }

  async runMigrationsUp(): Promise<{ executedFiles: string[], errors: any[] }> {
    const executedFiles: string[] = [];
    const errors: any[] = [];

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
          await this.prisma.$executeRawUnsafe(sqlContent);
          
          executedFiles.push(file);
          console.log(`✓ Successfully executed: ${file}`);
        } catch (error) {
          const errorMsg = `Failed to execute ${file}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push({ file, error: errorMsg });
        }
      }

      return { executedFiles, errors };
    } catch (error) {
      const errorMsg = `Migration up failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      return {
        executedFiles,
        errors: [{ file: 'system', error: errorMsg }]
      };
    }
  }

  async runMigrationsDown(): Promise<{ executedFiles: string[], errors: any[] }> {
    const executedFiles: string[] = [];
    const errors: any[] = [];

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
          await this.prisma.$executeRawUnsafe(sqlContent);
          
          executedFiles.push(file);
          console.log(`✓ Successfully executed: ${file}`);
        } catch (error) {
          const errorMsg = `Failed to execute ${file}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push({ file, error: errorMsg });
        }
      }

      return { executedFiles, errors };
    } catch (error) {
      const errorMsg = `Migration down failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      return {
        executedFiles,
        errors: [{ file: 'system', error: errorMsg }]
      };
    }
  }

  async dispose(): Promise<void> {
    await this.prisma.$disconnect();
  }
}