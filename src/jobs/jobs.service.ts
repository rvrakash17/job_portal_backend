import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) { }

  create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create(createJobDto);
    return this.jobsRepository.save(job);
  }

  async findAll(filters: any): Promise<Job[]> {
    const query = this.jobsRepository.createQueryBuilder('job');

    if (filters?.title?.trim()) {
      query.andWhere('job.title ILIKE :title', { title: `%${filters.title.trim()}%` });
    }

    if (filters?.location?.trim()) {
      query.andWhere('job.location ILIKE :location', { location: `%${filters.location.trim()}%` });
    }

    if (filters?.jobType?.trim()) {
      query.andWhere('job.jobType = :jobType', { jobType: filters.jobType.trim() });
    }

    const salaryMin = Number(filters?.salaryMin ?? 0);
    const salaryMax = Number(filters?.salaryMax ?? 2000000);

    // 🔥 Key Fix: Salary range OVERLAP check
    query.andWhere('job.minSalary <= :salaryMax AND job.maxSalary >= :salaryMin', {
      salaryMin,
      salaryMax,
    });
    const jobs = await query.getMany();
    return jobs.map(job => {
      let logo = 'logo.svg';
      if (job.companyName === 'Tesla') {
        logo = 'tesla.png';
      } else if (job.companyName === 'Amazon') {
        logo = 'amazon.png';
      } else if (job.companyName === 'Swiggy') {
        logo = 'swiggy.png';
      }
      return { ...job, logo, };
    });
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOneBy({ id });
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }


  update(id: number, updateJobDto: UpdateJobDto): Promise<any> {
    return this.jobsRepository.update(id, updateJobDto);
  }

  remove(id: number): Promise<any> {
    return this.jobsRepository.delete(id);
  }
}
