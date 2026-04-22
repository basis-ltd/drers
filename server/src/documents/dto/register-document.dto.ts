import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class RegisterDocumentDto {
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  @MaxLength(500)
  originalFilename: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @IsString()
  @MaxLength(500)
  publicId: string;

  @IsString()
  @MaxLength(1000)
  secureUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  resourceType?: string;

  @IsString()
  @MaxLength(50)
  format: string;

  @IsInt()
  @Min(1)
  fileSizeBytes: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  checksum?: string;
}
