import { InjectQueue } from '@nestjs/bull';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';

@Controller('bulk')
export class FileUploadController {
    constructor(@InjectQueue('file-queue') private readonly fileUploadQueue: Queue) {};

    @Post('file')
    @UseInterceptors(FileInterceptor('file')) 
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const job = await this.fileUploadQueue.add('bulk', { file });
        return job;
    }
}
