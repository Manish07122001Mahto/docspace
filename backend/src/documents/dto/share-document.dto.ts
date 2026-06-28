import { IsUUID } from 'class-validator';

export class ShareDocumentDto {
  @IsUUID()
  user_id!: string;
}
