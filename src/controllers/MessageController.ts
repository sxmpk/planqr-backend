import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MessageController {

    // POST /api/messages
    static async createMessage(req: Request, res: Response) {
        const command = req.body;
        if (!command) {
            res.status(400).send("Invalid request");
            return;
        }

        // C# CreateMessageCommand: body, lecturer, login, room, lessonId, group, createdAt
        try {
            const message = await prisma.message.create({
                data: {
                    body: command.body,
                    lecturer: command.lecturer,
                    login: command.login,
                    room: command.room,
                    lessonId: command.lessonId,
                    group: command.group,
                    createdAt: command.createdAt ? new Date(command.createdAt) : new Date() // C# converts TZ
                }
            });
            console.log(`Received message: ${command.body} from ${command.login} for lesson ${command.lessonId}`);
            // C# returns Ok(result), checking Handler it returns Unit.Value.
            // We'll return the created message? Or just Ok? 
            // C# LessonController returns Unit.Value which is usually 200 OK.
            // Let's return the created message object or just 200.
            res.status(200).json(message);
        } catch (e) {
            console.error(e);
            res.status(500).send("Server Error");
        }
    }

    // GET /api/messages/{lessonId}
    static async getMessages(req: Request, res: Response) {
        const lessonId = parseInt(req.params.lessonId);
        try {
            const messages = await prisma.message.findMany({
                where: { lessonId }
            });
            res.json(messages);
        } catch (e) {
            res.status(500).send("Error");
        }
    }

    // GET /api/messages
    static async getAllMessages(req: Request, res: Response) {
        try {
            const messages = await prisma.message.findMany();
            res.json(messages);
        } catch (e) {
            res.status(500).send("Error");
        }
    }

    // DELETE /api/messages/{id}
    static async deleteMessage(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        try {
            await prisma.message.delete({ where: { id } });
            res.sendStatus(204);
        } catch (e) {
            // C# usually returns NoContent even if failing? Or Internal server error.
            // We'll return 204.
            res.sendStatus(204);
        }
    }
}
