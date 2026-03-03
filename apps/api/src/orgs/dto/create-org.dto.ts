import { IsString, MinLength, Matches } from 'class-validator';

export class CreateOrgDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric and hyphens only' })
  slug!: string;
}
