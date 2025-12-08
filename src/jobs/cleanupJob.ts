import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startCleanupJob = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running cleanup job...');
        try {
            const result = await prisma.message.deleteMany({
                where: {
                    validUntil: {
                        lt: new Date()
                    }
                }
            });
            console.log(`Deleted ${result.count} expired messages.`);
        } catch (error) {
            console.error('Error during cleanup job:', error);
        }
    });
};
