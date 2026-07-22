import auditLogService from '../../../services/audit-log.service';
import prisma from '../../../config/database';

jest.mock('../../../config/database', () => ({
  __esModule: true,
  default: {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    therapySession: {
      findUnique: jest.fn(),
    },
    nursingConsultation: {
      findUnique: jest.fn(),
    },
    prescription: {
      findUnique: jest.fn(),
    },
    medication: {
      findUnique: jest.fn(),
    },
    medicationAdministration: {
      findUnique: jest.fn(),
    },
  },
}));

describe('AuditLogService (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('debe llamar a prisma.auditLog.create con los valores correctos', async () => {
      const mockData = {
        userId: 'user-id-123',
        action: 'CREATE',
        tableName: 'patients',
        recordId: 'record-id-123',
        oldValues: { name: 'Old' },
        newValues: { name: 'New' },
        ipAddress: '127.0.0.1',
        userAgent: 'JestTest',
      };

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 'log-id-1', ...mockData });

      await auditLogService.createAuditLog(mockData);

      expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: mockData.userId,
          action: mockData.action,
          tableName: mockData.tableName,
          recordId: mockData.recordId,
          oldValues: mockData.oldValues,
          newValues: mockData.newValues,
          ipAddress: mockData.ipAddress,
          userAgent: mockData.userAgent,
        },
      });
    });
  });

  describe('getAuditLogs', () => {
    const mockUserActor = {
      id: 'actor-id-1',
      firstName: 'Juan',
      lastName: 'Perez',
      role: 'admin',
      sex: 'male',
      email: 'juan@utcare.com',
    };

    const mockAuditLogEntry = {
      id: 'log-id-1',
      userId: 'actor-id-1',
      action: 'LOGIN',
      tableName: 'users',
      recordId: 'actor-id-1',
      oldValues: null,
      newValues: null,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla',
      createdAt: new Date(),
      user: mockUserActor,
    };

    it('debe retornar logs formateados y paginación correcta', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([mockAuditLogEntry]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await auditLogService.getAuditLogs(1, 10, {}, 'admin');

      expect(prisma.auditLog.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.auditLog.count).toHaveBeenCalledTimes(1);
      expect(result.auditLogs).toHaveLength(1);
      expect(result.auditLogs[0]).toHaveProperty('eventDetail');
      expect(result.auditLogs[0].eventDetail).toBe('El Administrador Juan Perez inició sesión en el sistema.');
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('debe filtrar logs para el coordinador de psicología', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await auditLogService.getAuditLogs(1, 10, {}, 'coordinador_psicologia');

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user: {
              role: {
                in: ['coordinador_psicologia', 'psicologo'],
              },
            },
          },
        })
      );
    });

    it('debe filtrar logs para el coordinador de enfermería', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await auditLogService.getAuditLogs(1, 10, {}, 'coordinador_enfermeria');

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user: {
              role: {
                in: ['coordinador_enfermeria', 'enfermero'],
              },
            },
          },
        })
      );
    });
  });

  describe('resolveLogDetail - Redacción y fallbacks', () => {
    const baseActor = {
      id: 'actor-id-1',
      firstName: 'Daniela',
      lastName: 'Gomez',
      role: 'psicologo',
      sex: 'female',
    };

    const buildLog = (action: string, tableName: string, oldValues: any = null, newValues: any = null) => ({
      id: 'log-id-x',
      userId: 'actor-id-1',
      action,
      tableName,
      recordId: 'record-id-x',
      oldValues,
      newValues,
      user: baseActor,
      createdAt: new Date(),
    });

    it('debe formatear correctamente cuando la relación viene en newValues (inmune a borrados)', async () => {
      // Caso 1: Cita con patientName en newValues
      const logCita = buildLog('CREATE', 'appointments', null, { patientName: 'Carlos Alexis' });
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([logCita]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await auditLogService.getAuditLogs(1, 10, {}, 'admin');
      expect(result.auditLogs[0].eventDetail).toBe(
        'La Psicóloga Daniela Gomez agendó una cita para el paciente Carlos Alexis.'
      );
    });

    it('debe formatear correctamente el fallback genérico de tablas en español', async () => {
      const logGenerico = buildLog('UPDATE', 'careers', { name: 'Sistemas' }, { name: 'TI' });
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([logGenerico]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await auditLogService.getAuditLogs(1, 10, {}, 'admin');
      expect(result.auditLogs[0].eventDetail).toBe(
        'La Psicóloga Daniela Gomez modificó la carrera TI.'
      );
    });

    it('debe formatear la lista de espera virtual de forma correcta (Kiosko)', async () => {
      const logKiosko = buildLog('CREATE', 'waiting_list', null, { patientName: 'Estudiante Anonimo' });
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([logKiosko]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await auditLogService.getAuditLogs(1, 10, {}, 'admin');
      expect(result.auditLogs[0].eventDetail).toBe(
        'La Psicóloga Daniela Gomez se registró en la fila virtual de espera (Kiosko).'
      );
    });

    it('debe formatear publicaciones de blog en el mural del Kiosko', async () => {
      const logBlog = buildLog('CREATE', 'blog_posts', null, { title: 'Mundial 2026 en Monterrey' });
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([logBlog]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await auditLogService.getAuditLogs(1, 10, {}, 'admin');
      expect(result.auditLogs[0].eventDetail).toBe(
        "La Psicóloga Daniela Gomez publicó el artículo 'Mundial 2026 en Monterrey' en el mural del Kiosko."
      );
    });
  });
});
