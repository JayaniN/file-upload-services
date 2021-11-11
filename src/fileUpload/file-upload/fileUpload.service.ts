import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Student } from 'src/model/student.input';
import * as Excel from 'exceljs';
import { Stream } from 'stream';
import { request } from 'graphql-request';
import { gql } from 'apollo-server-core';
import { AppGateway } from 'src/app.gateway';

@Injectable()
@Processor('file-queue')
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor( private gatewayService: AppGateway ) {};

  @Process('bulk')
  async handleFileUpload(job: Job) {
    try {
      let studentData: Student[] = [];
      let workbook = new Excel.Workbook();
      let stream = new Stream.Readable();

      let arrayBuffer = job.data.file.buffer.data;
      stream.push(new Uint8Array(arrayBuffer)); // ArrayBuffer variable
      stream.push(null);

      await workbook.xlsx.read(stream).then((workbook)=> {
        // get worksheet, read rows, etc
        const workSheet = workbook.getWorksheet(1);

        workSheet.eachRow((row, index) => {
          if(index !== 1) {
            let studentObj = {
              name: row.values[1],
              dateOfBirth: row.values[2],
              email: row.values[3]
            };

            studentData.push(studentObj);
          }
        });
      });

      const query = gql 
      `mutation createStudents($createStudents: [CreateStudentDTO!]!) {
        createStudents(createStudents: $createStudents) 
      }`;
      
      await request(process.env.STUDENT_SERVICE , query, {
        createStudents: studentData
      });

      this.logger.log('Job Completed');

    } catch (error) {
      this.logger.log('Job Failed', error);
      throw new Error(error);
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.gatewayService.server.emit('events', { status: 1 });
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    this.gatewayService.server.emit('events', { status: 0 });
  }

}
