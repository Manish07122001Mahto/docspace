import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsUUID()
  owner_id!: string;

  @IsString()
  @IsOptional()
  content_html?: string;
}
