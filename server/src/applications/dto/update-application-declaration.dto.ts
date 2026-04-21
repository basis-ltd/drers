import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateApplicationDeclarationDto {
  @IsOptional()
  @IsString()
  declarationText?: string;

  @IsOptional()
  @IsBoolean()
  agreed?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  signerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  signerDesignation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  signatureCloudinaryUrl?: string;

  @IsOptional()
  @IsString()
  signatureData?: string;
}
