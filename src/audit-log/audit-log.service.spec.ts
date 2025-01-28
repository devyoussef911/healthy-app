import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './AuditLog.entity';
import { User } from '../users/user.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let auditLogRepository: Repository<AuditLog>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLog),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    auditLogRepository = module.get<Repository<AuditLog>>(
      getRepositoryToken(AuditLog),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log an action', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as User);
    jest.spyOn(auditLogRepository, 'save').mockResolvedValue({} as AuditLog);

    await expect(
      service.logAction(1, 'register', { email: 'test@example.com' }),
    ).resolves.not.toThrow();
  });
});
