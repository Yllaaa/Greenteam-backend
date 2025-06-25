import { InteractionType } from '../db/schemas/schema';

export interface NotificationMessage {
  en: string;
  es: string;
}

export const getNotificationMessage = (
  type: InteractionType,
  userName: string,
  additionalData?: Record<string, string>,
): NotificationMessage => {
  const templates =
    notificationTemplates[type] || notificationTemplates.default;

  let enMessage = templates.en.replace('{userName}', userName);
  let esMessage = templates.es.replace('{userName}', userName);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      enMessage = enMessage.replace(`{${key}}`, value);
      esMessage = esMessage.replace(`{${key}}`, value);
    });
  }

  return {
    en: enMessage,
    es: esMessage,
  };
};

const notificationTemplates: Record<
  InteractionType | 'default',
  NotificationMessage
> = {
  // Comments
  comment: {
    en: '{userName} commented on your post',
    es: '{userName} comentó en tu publicación',
  },

  // Replies
  reply: {
    en: '{userName} replied to your comment',
    es: '{userName} respondió a tu comentario',
  },

  // Likes
  reaction: {
    en: '{userName} liked your post',
    es: '{userName} le gustó tu publicación',
  },

  // Followed User
  followed_user: {
    en: '{userName} started following you',
    es: '{userName} comenzó a seguirte',
  },

  // Followed Page
  followed_page: {
    en: '{userName} started following your page {pageName}',
    es: '{userName} comenzó a seguir tu página {pageName}',
  },

  // Joined Group
  joined_group: {
    en: '{userName} joined your group',
    es: '{userName} se unió a tu grupo',
  },

  // Joined Event
  joined_event: {
    en: '{userName} joined your event',
    es: '{userName} se unió a tu evento',
  },

  // Default
  default: {
    en: '{userName} performed an action',
    es: '{userName} realizó una acción',
  },
};
