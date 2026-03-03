import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { CreateOrgDto } from './dto/create-org.dto';

@Controller('orgs')
@UseGuards(JwtAuthGuard)
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrgDto) {
    return this.orgsService.createOrganization({
      name: dto.name,
      slug: dto.slug,
      createdByUserId: user.sub,
    });
  }
}
