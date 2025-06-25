import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MarketType } from 'src/modules/marketplace/dtos/getAllProducts.dto';

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
  @IsIn(Object.values(MarketType), {
    message: `Invalid marketType. Must be one of: ${Object.values(MarketType).join(', ')}`,
  })
  marketType?: MarketType;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
