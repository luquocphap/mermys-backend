import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";


const prisma = new PrismaClient({ 
  omit: { 
    admins: {
      password: true
    }
 } });

try {
  await prisma.$queryRaw`SELECT 1+1 AS result`;
  console.log('✅ [prisma] Connection has been established successfully.');
} catch (error) {
  console.error('❌ [prisma] Unable to connect to the database:', error);
}
export { prisma };