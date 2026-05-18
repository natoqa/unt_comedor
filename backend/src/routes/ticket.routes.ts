import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate, authorize, validate } from '../middlewares';
import { createTicketSchema, updateTicketStatusSchema, createTicketResponseSchema } from '../validators/ticket.validator';
import { Role } from '../types';

const router = Router();
const ticketController = new TicketController();

router.use(authenticate);

router.post('/', validate(createTicketSchema), ticketController.create.bind(ticketController));
router.get('/my', ticketController.getMyTickets.bind(ticketController));
router.get('/stats', authorize(Role.ADMIN), ticketController.getStats.bind(ticketController));
router.get('/export', authorize(Role.ADMIN), ticketController.exportExcel.bind(ticketController));
router.get('/', authorize(Role.ADMIN), ticketController.getAll.bind(ticketController));
router.get('/:id', ticketController.getById.bind(ticketController));
router.patch('/:id/status', authorize(Role.ADMIN), validate(updateTicketStatusSchema), ticketController.updateStatus.bind(ticketController));
router.post('/:id/responses', validate(createTicketResponseSchema), ticketController.addResponse.bind(ticketController));

export default router;
