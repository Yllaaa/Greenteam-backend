import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MarketType } from 'src/modules/db/schemas/schema';
export enum MarketTypeEnum {
  LocalBusiness = 'local_business',
  ValueDrivenBusiness = 'value_driven_business',
}

export class GetPageProductsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  topicId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsIn(Object.values(MarketTypeEnum), {
    message: `Invalid marketType. Must be one of: ${Object.values(MarketTypeEnum).join(', ')}`,
  })
  marketType?: MarketTypeEnum;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
