import { Exclude, Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ReportType } from 'src/data';

export class CreateReportDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  source: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  source: string;
}

export class ReportResponseDto {
  id: string;
  source: string;
  amount: number;
  type: ReportType;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Expose({ name: 'createdAt' })
  transformCreatedAt() {
    return this.created_at;
  }

  constructor(partial: Partial<ReportResponseDto>) {
    Object.assign(this, partial);
  }
}
