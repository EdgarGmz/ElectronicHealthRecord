import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ROLES_CAN_CREATE_NURSING_PROCEDURE, ROLES_CAN_READ_NURSING_HISTORY } from '../constants/roles';
import {
  listMyNursingAttentions,
  getNursingAttentionById,
  getNursingAttentionByIdValidation,
  createNursingAttention,
  createNursingAttentionValidation,
} from '../controllers/nursing-attention.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRoles(...ROLES_CAN_READ_NURSING_HISTORY), listMyNursingAttentions);
router.get(
  '/:id',
  authorizeRoles(...ROLES_CAN_READ_NURSING_HISTORY),
  validate(getNursingAttentionByIdValidation),
  getNursingAttentionById
);

router.post(
  '/',
  authorizeRoles(...ROLES_CAN_CREATE_NURSING_PROCEDURE),
  validate(createNursingAttentionValidation),
  createNursingAttention
);

export default router;

