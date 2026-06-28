import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ImportDocumentDto {
  @IsUUID()
  owner_id!: string;

  @IsString()
  @IsOptional()
  title?: string;
}
