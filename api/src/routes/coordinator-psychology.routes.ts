import { Router } from 'express';
import {
  getPsychologists,
  createPsychologist,
  updatePsychologist,
  deactivatePsychologist,
  deletePsychologistPermanently,
  getStaffProgressHandler,
  getConsultationsOverTimeHandler,
  getWorkloadDistributionHandler,
  getCareersWithAssignments,
  getPsychologistCareers,
  setPsychologistCareers,
  listPsychologistsValidation,
  createPsychologistValidation,
  updatePsychologistValidation,
  deactivatePsychologistValidation,
  staffProgressValidation,
  analyticsConsultationsValidation,
  analyticsWorkloadValidation,
  getPsychologistCareersValidation,
  setPsychologistCareersValidation,
} from '../controllers/coordinator-psychology.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(ROLES.COORDINADOR_PSICOLOGIA));

router.get(
  '/psychologists',
  validate(listPsychologistsValidation),
  getPsychologists
);

router.get(
  '/staff-progress',
  validate(staffProgressValidation),
  getStaffProgressHandler
);
router.get(
  '/analytics/consultations-over-time',
  validate(analyticsConsultationsValidation),
  getConsultationsOverTimeHandler
);
router.get(
  '/analytics/workload-distribution',
  validate(analyticsWorkloadValidation),
  getWorkloadDistributionHandler
);
router.get('/careers-with-assignments', getCareersWithAssignments);

router.post(
  '/psychologists',
  validate(createPsychologistValidation),
  createPsychologist
);

router.put(
  '/psychologists/:id',
  validate(updatePsychologistValidation),
  updatePsychologist
);

router.delete(
  '/psychologists/:id',
  validate(deactivatePsychologistValidation),
  deactivatePsychologist
);

router.delete(
  '/psychologists/:id/permanent',
  validate(deactivatePsychologistValidation),
  deletePsychologistPermanently
);

router.get(
  '/psychologists/:id/careers',
  validate(getPsychologistCareersValidation),
  getPsychologistCareers
);

router.put(
  '/psychologists/:id/careers',
  validate(setPsychologistCareersValidation),
  setPsychologistCareers
);

export default router;
