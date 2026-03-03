import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJsaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  task!: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  location?: string;

  @IsArray()
  @IsOptional()
  tools?: string[];

  @IsArray()
  @IsOptional()
  hazards?: string[];

  // simple numeric scoring inputs (1-5)
  @IsOptional()
  severity?: number;

  @IsOptional()
  probability?: number;
}
