import { Controller, Get, Param } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOneRole(id);
  }

  @Get(':id/permissions')
  findPermissions(@Param('id') id: string) {
    return this.rolesService.findOneRole(id);
  }
}
