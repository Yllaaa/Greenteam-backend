import { Controller, Param, Query, Get, UseGuards, Req } from '@nestjs/common';
import { GetMessagesDto } from '../messages/dtos/get-messages.dto';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GetConversationsDto } from './dtos/get-conversations.dto';
import { SQL } from 'drizzle-orm';

@UseGuards(JwtAuthGuard)
@Controller('')
export class ConversationsController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  @Get()
  async getConversations(@Req() req, @Query() query: GetConversationsDto) {
    const participantId = query.pageId || req.user.id;
    const participantType = query.pageId ? 'page' : 'user';

    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    return this.conversationsService.listUserConversations(
      participantId,
      participantType as unknown as SQL<'user' | 'page'>,
      pagination,
    );
  }

  @Get(':conversationId/messages')
  async messagesController(
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const participantId = query.pageId || userId;
    const participantType = query.pageId
      ? ('page' as unknown as SQL<'user' | 'page'>)
      : ('user' as unknown as SQL<'user' | 'page'>);
    const participant = { id: participantId, type: participantType };
    const messages = await this.messagesService.getMessages(
      conversationId,
      participant,
      query.cursor,
      query.limit,
    );

    const nextCursor =
      messages.length === query.limit
        ? {
            sentAt: messages[messages.length - 1].sentAt,
            id: messages[messages.length - 1].id,
          }
        : null;

    return {
      messages,
      nextCursor,
    };
  }
}
