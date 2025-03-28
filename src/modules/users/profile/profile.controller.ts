import { Body, Controller, Get, Param, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ProfileController {
    constructor(private profileService: ProfileService) { }

    @Get(':username')
    async getUserByUsername(@Param('username') username: string, @Req() req) {
        const userId: string = req.user.id;
        return await this.profileService.getUserByUsername(username, userId);
    }


    @Put('me')
    async updateProfile(
        @Req() req,
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        updateData: UpdateProfileDto
    ) {
        const userId: string = req.user.id;
        return await this.profileService.updateProfile(userId, updateData);
    }
}
