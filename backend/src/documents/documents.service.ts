import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ImportDocumentDto } from './dto/import-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { isSupportedImportFile, textToHtml } from './file-import.util';

type UploadedFile = Express.Multer.File;

@Injectable()
export class DocumentsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Dummy document seeding removed
  }

  async findWorkspace(user_id: string) {
    if (!user_id) {
      throw new BadRequestException('user_id query parameter is required');
    }

    await this.ensureUser(user_id);

    const [owned_documents, shared_documents] = await Promise.all([
      this.prisma.document.findMany({
        where: { owner_id: user_id },
        include: { owner: true },
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.document.findMany({
        where: {
          shares: {
            some: { user_id },
          },
          owner_id: { not: user_id },
        },
        include: { owner: true },
        orderBy: { updated_at: 'desc' },
      }),
    ]);

    return { owned_documents, shared_documents };
  }

  async create(dto: CreateDocumentDto) {
    await this.ensureUser(dto.owner_id);

    return this.prisma.document.create({
      data: {
        title: dto.title.trim(),
        content_html: dto.content_html ?? '<p></p>',
        owner_id: dto.owner_id,
      },
      include: { owner: true },
    });
  }

  async findOne(id: string, user_id?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        owner: true,
        shares: {
          include: { user: true },
          orderBy: { created_at: 'asc' },
        },
        attachments: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (user_id && !this.canAccess(document, user_id)) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return document;
  }

  async update(id: string, dto: UpdateDocumentDto) {
    await this.ensureDocument(id);

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.content_html !== undefined ? { content_html: dto.content_html } : {}),
      },
      include: { owner: true },
    });
  }

  async share(id: string, dto: ShareDocumentDto) {
    const document = await this.ensureDocument(id);
    await this.ensureUser(dto.user_id);

    if (document.owner_id === dto.user_id) {
      throw new BadRequestException('Owner already has access');
    }

    return this.prisma.documentShare.upsert({
      where: {
        document_id_user_id: {
          document_id: id,
          user_id: dto.user_id,
        },
      },
      update: {},
      create: {
        document_id: id,
        user_id: dto.user_id,
      },
      include: { user: true },
    });
  }

  async listShares(id: string) {
    await this.ensureDocument(id);

    return this.prisma.documentShare.findMany({
      where: { document_id: id },
      include: { user: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async removeShare(id: string, user_id: string) {
    await this.ensureDocument(id);

    await this.prisma.documentShare.delete({
      where: {
        document_id_user_id: {
          document_id: id,
          user_id,
        },
      },
    });

    return { removed: true };
  }

  async importDocument(dto: ImportDocumentDto, file?: UploadedFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.validateImportFile(file);
    await this.ensureUser(dto.owner_id);

    const content = file.buffer.toString('utf8');
    const document = await this.prisma.document.create({
      data: {
        title: dto.title?.trim() || this.titleFromFileName(file.originalname),
        content_html: textToHtml(content),
        owner_id: dto.owner_id,
        attachments: {
          create: {
            file_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            content_text: content,
          },
        },
      },
      include: {
        owner: true,
        attachments: true,
      },
    });

    return document;
  }

  async uploadAttachment(id: string, file?: UploadedFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.validateImportFile(file);
    await this.ensureDocument(id);

    return this.prisma.attachment.create({
      data: {
        document_id: id,
        file_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        content_text: file.buffer.toString('utf8'),
      },
    });
  }

  private async ensureUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async ensureDocument(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  private validateImportFile(file: UploadedFile) {
    if (!isSupportedImportFile(file.originalname, file.mimetype)) {
      throw new BadRequestException('Only .txt and .md files are supported');
    }
  }

  private canAccess(
    document: { owner_id: string; shares: { user_id: string }[] },
    user_id: string,
  ) {
    return (
      document.owner_id === user_id ||
      document.shares.some((share) => share.user_id === user_id)
    );
  }

  private titleFromFileName(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim() || 'Imported document';
  }

  private async seedDemoDocuments() {
    // Seed documents removed so the DB starts clean for testing.
  }
}
