import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export class SeedService {
  private prisma: PrismaClient;
  private seedPath: string;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
    this.seedPath = path.join(process.cwd(), 'migration', 'seed');
  }

  async runSeedsUp(): Promise<{ executedFiles: string[], errors: any[] }> {
    const executedFiles: string[] = [];
    const errors: any[] = [];

    try {
      // Get all .up.sql files and sort them
      const files = fs.readdirSync(this.seedPath)
        .filter(file => file.endsWith('.up.sql'))
        .sort();

      console.log('Found seed files:', files);

      for (const file of files) {
        try {
          const filePath = path.join(this.seedPath, file);
          const sqlContent = fs.readFileSync(filePath, 'utf8');
          
          console.log(`Executing seed: ${file}`);
          
          // Execute the SQL content
          await this.prisma.$executeRawUnsafe(sqlContent);
          
          executedFiles.push(file);
          console.log(`✓ Successfully executed seed: ${file}`);
        } catch (error) {
          const errorMsg = `Failed to execute seed ${file}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push({ file, error: errorMsg });
        }
      }

      return { executedFiles, errors };
    } catch (error) {
      const errorMsg = `Seed up failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      return {
        executedFiles,
        errors: [{ file: 'system', error: errorMsg }]
      };
    }
  }

  async runSeedsDown(): Promise<{ executedFiles: string[], errors: any[] }> {
    const executedFiles: string[] = [];
    const errors: any[] = [];

    try {
      // Get all .down.sql files and sort them in reverse order
      const files = fs.readdirSync(this.seedPath)
        .filter(file => file.endsWith('.down.sql'))
        .sort()
        .reverse();

      console.log('Found seed rollback files:', files);

      for (const file of files) {
        try {
          const filePath = path.join(this.seedPath, file);
          const sqlContent = fs.readFileSync(filePath, 'utf8');
          
          console.log(`Executing seed rollback: ${file}`);
          
          // Execute the SQL content
          await this.prisma.$executeRawUnsafe(sqlContent);
          
          executedFiles.push(file);
          console.log(`✓ Successfully executed seed rollback: ${file}`);
        } catch (error) {
          const errorMsg = `Failed to execute seed rollback ${file}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push({ file, error: errorMsg });
        }
      }

      return { executedFiles, errors };
    } catch (error) {
      const errorMsg = `Seed down failed: ${error instanceof Error ? error.message : String(error)}`;
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