import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        await prisma.$connect();
        console.log('Successfully connected to database!');

        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        const deviceCount = await prisma.deviceList.count();
        console.log(`Device count: ${deviceCount}`);

        console.log('Database check passed.');
    } catch (e) {
        console.error('Database connection failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
