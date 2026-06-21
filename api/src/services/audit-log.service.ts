import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export class AuditLogService {
  /**
   * Create a new audit log entry
   */
  createAuditLog(data: {
    userId: string;
    action: string;
    tableName: string;
    recordId: string;
    oldValues?: object;
    newValues?: object;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        tableName: data.tableName,
        recordId: data.recordId,
        oldValues: data.oldValues ? (data.oldValues as Prisma.InputJsonValue) : Prisma.JsonNull,
        newValues: data.newValues ? (data.newValues as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }

  /**
   * Get audit logs with filtering and pagination.
   * Si userRole es coordinador_psicologia, solo se devuelven logs de usuarios del departamento de psicología (psicologo, coordinador_psicologia).
   */
  async getAuditLogs(
    page: number = 1,
    limit: number = 10,
    filters?: {
      userId?: string;
      action?: string;
      tableName?: string;
      role?: string;
      startDate?: Date;
      endDate?: Date;
    },
    userRole?: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (userRole === 'coordinador_psicologia') {
      where.user = { role: { in: ['coordinador_psicologia', 'psicologo'] } };
    }
    if (userRole === 'coordinador_enfermeria') {
      where.user = { role: { in: ['coordinador_enfermeria', 'enfermero'] } };
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.tableName) {
      where.tableName = filters.tableName;
    }

    if (filters?.role && userRole === 'admin') {
      where.user = { role: filters.role };
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              sex: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const detailedLogs = await Promise.all(
      auditLogs.map(async (log) => {
        const eventDetail = await resolveLogDetail(log);
        return {
          ...log,
          eventDetail,
        };
      })
    );

    return {
      auditLogs: detailedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

async function resolveLogDetail(log: any): Promise<string> {
  const actor = log.user;
  if (!actor) return 'Acción realizada por el sistema.';

  const actorGender = actor.sex || '';
  const isFemale = /female|femenino|f/i.test(actorGender);

  let actorTitle = 'El usuario';
  if (actor.role === 'admin') {
    actorTitle = isFemale ? 'La Administradora' : 'El Administrador';
  } else if (actor.role === 'coordinador_psicologia' || actor.role === 'coordinador_enfermeria') {
    actorTitle = isFemale ? 'La Coordinadora' : 'El Coordinador';
  } else if (actor.role === 'psicologo') {
    actorTitle = isFemale ? 'La Psicóloga' : 'El Psicólogo';
  } else if (actor.role === 'enfermero') {
    actorTitle = isFemale ? 'La Enfermera' : 'El Enfermero';
  } else if (actor.role === 'patient') {
    actorTitle = isFemale ? 'La Paciente' : 'El Paciente';
  }

  const actorName = `${actor.firstName} ${actor.lastName}`.trim();
  const actorWithTitle = `${actorTitle} ${actorName}`;

  const action = log.action.toUpperCase();
  const table = log.tableName.toLowerCase();

  const newVals = log.newValues && typeof log.newValues === 'object' ? (log.newValues as Record<string, any>) : {};
  const oldVals = log.oldValues && typeof log.oldValues === 'object' ? (log.oldValues as Record<string, any>) : {};

  // 1. Auth Actions
  if (action === 'LOGIN') {
    return `${actorWithTitle} inició sesión en el sistema.`;
  }
  if (action === 'LOGOUT') {
    return `${actorWithTitle} cerró sesión en el sistema.`;
  }

  const friendlyTableNames: Record<string, string> = {
    users: 'usuarios',
    user: 'usuarios',
    careers: 'carreras',
    career: 'carreras',
    patients: 'pacientes',
    patient: 'pacientes',
    medical_records: 'expedientes médicos',
    medicalrecord: 'expedientes médicos',
    psychology_records: 'expedientes psicológicos',
    psychologyrecord: 'expedientes psicológicos',
    nursing_consultations: 'consultas de enfermería',
    nursingconsultation: 'consultas de enfermería',
    prescriptions: 'recetas',
    prescription: 'recetas',
    medication_administrations: 'administraciones de medicamentos',
    medicationadministration: 'administraciones de medicamentos',
    appointments: 'citas',
    appointment: 'citas',
    therapy_sessions: 'sesiones de terapia',
    therapysession: 'sesiones de terapia',
    treatment_plans: 'planes de tratamiento',
    treatmentplan: 'planes de tratamiento',
    interconsultations: 'interconsultas',
    interconsultation: 'interconsultas',
    medications: 'medicamentos',
    medication: 'medicamentos',
    system_settings: 'configuración del sistema',
    systemsetting: 'configuración del sistema',
    reports: 'reportes',
    report: 'reportes',
    notifications: 'notificaciones',
    notification: 'notificaciones',
    blog_posts: 'publicaciones de blog',
    blogpost: 'publicaciones de blog',
    emergency_contacts: 'contactos de emergencia',
    emergencycontact: 'contactos de emergencia',
  };

  const friendlyTable = friendlyTableNames[table] || table;

  if (action === 'EXPORT') {
    return `${actorWithTitle} exportó registros de la tabla de ${friendlyTable}.`;
  }

  // 2. Resource specific actions
  try {
    const formatPatientPhrases = (name: string) => {
      const isDefault = name === 'un paciente';
      return {
        delPaciente: isDefault ? 'de un paciente' : `del paciente ${name}`,
        paraElPaciente: isDefault ? 'para un paciente' : `para el paciente ${name}`,
        conElPaciente: isDefault ? 'con un paciente' : `con el paciente ${name}`,
        alPaciente: isDefault ? 'a un paciente' : `al paciente ${name}`,
      };
    };

    // A. Users
    if (table === 'users' || table === 'user') {
      const targetFirstName = newVals.firstName || oldVals.firstName || '';
      const targetLastName = newVals.lastName || oldVals.lastName || '';
      const targetName = `${targetFirstName} ${targetLastName}`.trim() || 'un usuario';

      if (action === 'CREATE') {
        return `${actorWithTitle} creó al usuario ${targetName}.`;
      }
      if (action === 'UPDATE') {
        if (log.userId === log.recordId) {
          return `${actorWithTitle} actualizó su perfil.`;
        }
        return `${actorWithTitle} modificó al usuario ${targetName}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó permanentemente al usuario ${targetName}.`;
      }
    }

    // B. Careers
    if (table === 'careers' || table === 'career') {
      const careerName = newVals.name || oldVals.name || 'una carrera';
      if (action === 'CREATE') {
        return `${actorWithTitle} creó la carrera ${careerName}.`;
      }
      if (action === 'UPDATE') {
        return `${actorWithTitle} modificó la carrera ${careerName}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó la carrera ${careerName}.`;
      }
    }

    // C. Interconsultations
    if (table === 'interconsultations' || table === 'interconsultation') {
      const patientId = newVals.patientId || oldVals.patientId;
      const assignedPsychologistId = newVals.assignedPsychologistId || oldVals.assignedPsychologistId;

      let patientName = 'un paciente';
      if (patientId) {
        const patientRecord = await prisma.patient.findUnique({
          where: { id: patientId },
          include: { user: true }
        });
        if (patientRecord?.user) {
          patientName = `${patientRecord.user.firstName} ${patientRecord.user.lastName}`.trim();
        }
      }

      let psychologistName = '';
      if (assignedPsychologistId) {
        const psychRecord = await prisma.user.findUnique({
          where: { id: assignedPsychologistId }
        });
        if (psychRecord) {
          psychologistName = `${psychRecord.firstName} ${psychRecord.lastName}`.trim();
        }
      }

      const phrases = formatPatientPhrases(patientName);

      if (action === 'CREATE') {
        return `${actorWithTitle} creó la interconsulta ${phrases.delPaciente}.`;
      }
      if (action === 'UPDATE') {
        if (psychologistName) {
          return `${actorWithTitle} asignó la interconsulta ${phrases.delPaciente} al especialista ${psychologistName}.`;
        }
        return `${actorWithTitle} modificó la interconsulta ${phrases.delPaciente}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó la interconsulta ${phrases.delPaciente}.`;
      }
    }

    // D. Therapy Sessions
    if (table === 'therapy_sessions' || table === 'therapysession') {
      const psychologyRecordId = newVals.psychologyRecordId || oldVals.psychologyRecordId;
      let patientName = 'un paciente';
      if (psychologyRecordId) {
        const psychologyRecord = await prisma.psychologyRecord.findUnique({
          where: { id: psychologyRecordId },
          include: {
            medicalRecord: {
              include: {
                patient: {
                  include: { user: true }
                }
              }
            }
          }
        });
        const userObj = psychologyRecord?.medicalRecord?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      } else if (log.recordId) {
        const session = await prisma.therapySession.findUnique({
          where: { id: log.recordId },
          include: {
            psychologyRecord: {
              include: {
                medicalRecord: {
                  include: {
                    patient: {
                      include: { user: true }
                    }
                  }
                }
              }
            }
          }
        });
        const userObj = session?.psychologyRecord?.medicalRecord?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      }

      const phrases = formatPatientPhrases(patientName);

      if (action === 'CREATE') {
        return `${actorWithTitle} inició una sesión de terapia ${phrases.conElPaciente}.`;
      }
      if (action === 'UPDATE') {
        return `${actorWithTitle} actualizó una sesión de terapia ${phrases.conElPaciente}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó una sesión de terapia ${phrases.conElPaciente}.`;
      }
      if (action === 'VIEW_RECORD' || action === 'READ') {
        return `${actorWithTitle} consultó una sesión de terapia ${phrases.conElPaciente}.`;
      }
    }

    // E. Clinical Records (nursing_consultations)
    if (table === 'nursing_consultations' || table === 'nursingconsultation') {
      const medicalRecordId = newVals.medicalRecordId || oldVals.medicalRecordId;
      let patientName = 'un paciente';
      if (medicalRecordId) {
        const medicalRecord = await prisma.medicalRecord.findUnique({
          where: { id: medicalRecordId },
          include: {
            patient: {
              include: { user: true }
            }
          }
        });
        const userObj = medicalRecord?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      } else if (log.recordId) {
        const consultation = await prisma.nursingConsultation.findUnique({
          where: { id: log.recordId },
          include: {
            medicalRecord: {
              include: {
                patient: {
                  include: { user: true }
                }
              }
            }
          }
        });
        const userObj = consultation?.medicalRecord?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      }

      const phrases = formatPatientPhrases(patientName);

      if (action === 'CREATE') {
        return `${actorWithTitle} registró los signos vitales e historial de enfermería ${phrases.paraElPaciente}.`;
      }
      if (action === 'UPDATE') {
        return `${actorWithTitle} modificó la consulta de enfermería ${phrases.paraElPaciente}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó la consulta de enfermería ${phrases.paraElPaciente}.`;
      }
      if (action === 'VIEW_RECORD' || action === 'READ') {
        return `${actorWithTitle} consultó la consulta de enfermería ${phrases.delPaciente}.`;
      }
    }

    // F. Medical Records
    if (table === 'medical_records' || table === 'medicalrecord') {
      const patientId = newVals.patientId || oldVals.patientId;
      let patientName = 'un paciente';
      if (patientId) {
        const patientRecord = await prisma.patient.findUnique({
          where: { id: patientId },
          include: { user: true }
        });
        if (patientRecord?.user) {
          patientName = `${patientRecord.user.firstName} ${patientRecord.user.lastName}`.trim();
        }
      } else if (log.recordId) {
        const medicalRecord = await prisma.medicalRecord.findUnique({
          where: { id: log.recordId },
          include: {
            patient: {
              include: { user: true }
            }
          }
        });
        const userObj = medicalRecord?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      }

      const phrases = formatPatientPhrases(patientName);

      if (action === 'CREATE') {
        return `${actorWithTitle} creó el expediente médico ${phrases.paraElPaciente}.`;
      }
      if (action === 'UPDATE') {
        return `${actorWithTitle} actualizó el expediente médico ${phrases.paraElPaciente}.`;
      }
      if (action === 'VIEW_RECORD' || action === 'READ') {
        return `${actorWithTitle} consultó el expediente médico ${phrases.delPaciente}.`;
      }
    }

    // G. Reports
    if (table === 'reports' || table === 'report') {
      const typeMap: Record<string, string> = {
        statistics: 'estadísticas',
        consultations: 'consultas',
        diagnoses: 'diagnósticos',
      };
      const rawType = newVals.reportType || oldVals.reportType || '';
      const reportTypeFriendly = typeMap[rawType] || rawType || 'general';

      if (action === 'CREATE') {
        return `${actorWithTitle} generó el reporte de ${reportTypeFriendly}.`;
      }
      if (action === 'UPDATE') {
        return `${actorWithTitle} actualizó el reporte de ${reportTypeFriendly}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó el reporte de ${reportTypeFriendly}.`;
      }
      if (action === 'VIEW_RECORD' || action === 'READ') {
        return `${actorWithTitle} consultó el reporte de ${reportTypeFriendly}.`;
      }
    }

    // H. Appointments
    if (table === 'appointments' || table === 'appointment') {
      const patientId = newVals.patientId || oldVals.patientId;
      let patientName = 'un paciente';
      if (patientId) {
        const patientRecord = await prisma.patient.findUnique({
          where: { id: patientId },
          include: { user: true }
        });
        if (patientRecord?.user) {
          patientName = `${patientRecord.user.firstName} ${patientRecord.user.lastName}`.trim();
        }
      } else if (log.recordId) {
        const appointment = await prisma.appointment.findUnique({
          where: { id: log.recordId },
          include: {
            patient: {
              include: { user: true }
            }
          }
        });
        const userObj = appointment?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      }

      const phrases = formatPatientPhrases(patientName);

      if (action === 'CREATE') {
        return `${actorWithTitle} agendó una cita ${phrases.paraElPaciente}.`;
      }
      if (action === 'UPDATE') {
        const status = newVals.status || oldVals.status || '';
        if (status === 'cancelled') {
          return `${actorWithTitle} canceló la cita ${phrases.delPaciente}.`;
        }
        if (newVals.scheduledDate && oldVals.scheduledDate && newVals.scheduledDate !== oldVals.scheduledDate) {
          return `${actorWithTitle} reprogramó la cita ${phrases.delPaciente}.`;
        }
        return `${actorWithTitle} modificó la cita ${phrases.delPaciente}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó la cita ${phrases.delPaciente}.`;
      }
      if (action === 'VIEW_RECORD' || action === 'READ') {
        return `${actorWithTitle} consultó la cita ${phrases.delPaciente}.`;
      }
    }

    // I. Prescriptions
    if (table === 'prescriptions' || table === 'prescription') {
      const patientId = newVals.patientId || oldVals.patientId;
      const medicationId = newVals.medicationId || oldVals.medicationId;

      let patientName = 'un paciente';
      if (patientId) {
        const patientRecord = await prisma.patient.findUnique({
          where: { id: patientId },
          include: { user: true }
        });
        if (patientRecord?.user) {
          patientName = `${patientRecord.user.firstName} ${patientRecord.user.lastName}`.trim();
        }
      } else if (log.recordId) {
        const prescription = await prisma.prescription.findUnique({
          where: { id: log.recordId },
          include: {
            patient: {
              include: { user: true }
            }
          }
        });
        const userObj = prescription?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      }

      let medicationName = 'un medicamento';
      if (medicationId) {
        const medicationRecord = await prisma.medication.findUnique({
          where: { id: medicationId }
        });
        if (medicationRecord) {
          medicationName = medicationRecord.name;
        }
      } else if (log.recordId) {
        const prescription = await prisma.prescription.findUnique({
          where: { id: log.recordId },
          include: { medication: true }
        });
        if (prescription?.medication) {
          medicationName = prescription.medication.name;
        }
      }

      const phrases = formatPatientPhrases(patientName);

      if (action === 'CREATE') {
        return `${actorWithTitle} recetó ${medicationName} ${phrases.alPaciente}.`;
      }
      if (action === 'UPDATE') {
        return `${actorWithTitle} modificó la receta de ${medicationName} ${phrases.paraElPaciente}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó la receta de ${medicationName} ${phrases.paraElPaciente}.`;
      }
      if (action === 'VIEW_RECORD' || action === 'READ') {
        return `${actorWithTitle} consultó la receta de ${medicationName} ${phrases.delPaciente}.`;
      }
    }

    // J. Medication Administrations
    if (table === 'medication_administrations' || table === 'medicationadministration') {
      const medicationId = newVals.medicationId || oldVals.medicationId;
      const nursingConsultationId = newVals.nursingConsultationId || oldVals.nursingConsultationId;

      let patientName = 'un paciente';
      if (nursingConsultationId) {
        const consultation = await prisma.nursingConsultation.findUnique({
          where: { id: nursingConsultationId },
          include: {
            medicalRecord: {
              include: {
                patient: {
                  include: { user: true }
                }
              }
            }
          }
        });
        const userObj = consultation?.medicalRecord?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      } else if (log.recordId) {
        const adminRecord = await prisma.medicationAdministration.findUnique({
          where: { id: log.recordId },
          include: {
            consultation: {
              include: {
                medicalRecord: {
                  include: {
                    patient: {
                      include: { user: true }
                    }
                  }
                }
              }
            }
          }
        });
        const userObj = adminRecord?.consultation?.medicalRecord?.patient?.user;
        if (userObj) {
          patientName = `${userObj.firstName} ${userObj.lastName}`.trim();
        }
      }

      let medicationName = 'un medicamento';
      if (medicationId) {
        const medicationRecord = await prisma.medication.findUnique({
          where: { id: medicationId }
        });
        if (medicationRecord) {
          medicationName = medicationRecord.name;
        }
      } else if (log.recordId) {
        const adminRecord = await prisma.medicationAdministration.findUnique({
          where: { id: log.recordId },
          include: { medication: true }
        });
        if (adminRecord?.medication) {
          medicationName = adminRecord.medication.name;
        }
      }

      const phrases = formatPatientPhrases(patientName);

      if (action === 'CREATE') {
        return `${actorWithTitle} administró ${medicationName} ${phrases.alPaciente}.`;
      }
      if (action === 'UPDATE') {
        return `${actorWithTitle} modificó la administración de ${medicationName} ${phrases.paraElPaciente}.`;
      }
      if (action === 'DELETE') {
        return `${actorWithTitle} eliminó la administración de ${medicationName} ${phrases.paraElPaciente}.`;
      }
      if (action === 'VIEW_RECORD' || action === 'READ') {
        return `${actorWithTitle} consultó la administración de ${medicationName} ${phrases.delPaciente}.`;
      }
    }

  } catch (err) {
    // Ignore errors resolving detail, fallback below
  }

  // Fallback for other resources / actions
  const actionText = action === 'CREATE' ? 'creó' : action === 'UPDATE' ? 'modificó' : action === 'DELETE' ? 'eliminó' : action === 'READ' || action === 'VIEW_RECORD' ? 'consultó' : action.toLowerCase();
  return `${actorWithTitle} ${actionText} un registro en la tabla de ${friendlyTable}.`;
}

export default new AuditLogService();
