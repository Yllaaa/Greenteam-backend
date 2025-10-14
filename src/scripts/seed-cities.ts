import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { CityImportService } from 'src/modules/common/city-seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(CityImportService);

  await seedService.importAllCities();

  console.log('✅ City import finished');
  await app.close();
}
bootstrap();
