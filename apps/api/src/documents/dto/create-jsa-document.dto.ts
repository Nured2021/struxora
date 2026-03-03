import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateJsaDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  task!: string;

  @IsString()
  @IsNotEmpty()
  orgId!: string;

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

  @IsOptional()
  severity?: number;

  @IsOptional()
  probability?: number;
}
