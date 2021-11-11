import { Module } from '@nestjs/common';
import { FileUploadService } from './fileUpload.service';
import { FileUploadController } from './fileUpload.controller';
import { BullModule } from '@nestjs/bull';
import { AppGateway } from 'src/app.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'file-queue' // register queue name
    }),
    ConfigModule.forRoot()
  ],
  providers: [FileUploadService, AppGateway],
  controllers: [FileUploadController]
})
export class FileUploadModule {}
