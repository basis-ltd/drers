import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({ where: { isActive: true } });
  }

  findOne(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOneBy({ id });
  }
}
