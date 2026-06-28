import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ImportDocumentDto } from './dto/import-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findWorkspace(@Query('user_id') user_id: string) {
    return this.documentsService.findWorkspace(user_id);
  }

  @Post()
  create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importDocument(
    @Body() dto: ImportDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.importDocument(dto, file);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('user_id') user_id?: string) {
    return this.documentsService.findOne(id, user_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Get(':id/shares')
  listShares(@Param('id') id: string) {
    return this.documentsService.listShares(id);
  }

  @Post(':id/shares')
  share(@Param('id') id: string, @Body() dto: ShareDocumentDto) {
    return this.documentsService.share(id, dto);
  }

  @Delete(':id/shares/:user_id')
  removeShare(@Param('id') id: string, @Param('user_id') user_id: string) {
    return this.documentsService.removeShare(id, user_id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.uploadAttachment(id, file);
  }
}
