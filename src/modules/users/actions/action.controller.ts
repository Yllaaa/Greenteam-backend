import {
    Controller,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    Get,
    Req,
    Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ActionsService } from './actions.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('actions')
@UseGuards(JwtAuthGuard)
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) { }

    @Post('block')
    async blockEntity(
        @Req() req,
        @Body() createBlockDto: CreateBlockDto,
    ) {
        const userId: string = req.user.id;
        return await this.actionsService.blockEntity(
            userId,
            createBlockDto.blockedId,
            createBlockDto.blockedEntityType,
        );
    }

    @Delete('unblock/:blockedId')
    async unblockEntity(
        @Req() req,
        @Param('blockedId') blockedId: string,
    ) {
        const userId: string = req.user.id;
        const result = await this.actionsService.unblockEntity(userId, blockedId);
        if (!result) {
            throw new NotFoundException('Block not found');
        }
        return { message: 'Entity unblocked successfully' };
    }

    @Get('blocks')
    async getUserBlocks(@Req() req) {
        const userId: string = req.user.id;
        return this.actionsService.getUserBlocks(userId);
    }

    @Post('report')
    async reportEntity(
        @Req() req,
        @Body() createReportDto: CreateReportDto,
    ) {
        const userId: string = req.user.id;
        return await this.actionsService.reportEntity(
            userId,
            createReportDto.reportedId,
            createReportDto.reportedType,
            createReportDto.reason,
        );
    }

    @Get('reports')
    async getUserReports(@Req() req) {
        const userId: string = req.user.id;
        return this.actionsService.getUserReports(userId);
    }

    @Get('reports/all')
    async getAllReports() {
        return this.actionsService.getAllReports();
    }

    @Patch('reports/:reportId')
    async updateReportStatus(
        @Param('reportId') reportId: string,
        @Body() updateReportDto: UpdateReportDto,
    ) {
        return this.actionsService.updateReportStatus(
            reportId,
            updateReportDto.status,
            updateReportDto.adminNotes
        );
    }
}