import { Router } from 'express';
import { LessonController } from '../controllers/LessonController';

const router = Router();

router.get('/messages/list', LessonController.getMessages);
router.get('/message/:roomId', LessonController.getMessage);
router.delete('/messages/clear', LessonController.clearMessages);
router.delete('/message/delete/:roomId', LessonController.deleteMessage);

export default router;
