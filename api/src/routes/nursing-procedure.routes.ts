import { Router } from 'express';
import * as nursingProcedureController from '../controllers/nursing-procedure.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import {
  ROLES_CAN_ACCESS_NURSING_PROCEDURES,
  ROLES_CAN_CREATE_NURSING_PROCEDURE,
} from '../constants/roles';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  authorizeRoles(...ROLES_CAN_ACCESS_NURSING_PROCEDURES),
  nursingProcedureController.getProcedures
);

router.get(
  '/:id',
  authorizeRoles(...ROLES_CAN_ACCESS_NURSING_PROCEDURES),
  validate([param('id').isUUID().withMessage('Invalid procedure ID')]),
  nursingProcedureController.getProcedureById
);

router.post(
  '/',
  authorizeRoles(...ROLES_CAN_CREATE_NURSING_PROCEDURE),
  validate(nursingProcedureController.createProcedureValidation),
  nursingProcedureController.createProcedure
);

export default router;
