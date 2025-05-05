import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { InteractionType } from 'src/modules/db/schemas/schema';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');

      if (!serviceAccount) {
        this.logger.warn(
          'Firebase service account not configured. Push notifications will be disabled.',
        );
        return;
      }

      let serviceAccountJson;
      try {
        serviceAccountJson = JSON.parse(serviceAccount);
      } catch (e) {
        serviceAccountJson = serviceAccount;
      }

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });

      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
    }
  }

  /**
   * Send a push notification to a specific device
   */
  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<void> {
    if (!this.firebaseApp) {
      this.logger.warn(
        'Firebase not initialized. Cannot send push notification.',
      );
      return;
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      };

      await admin.messaging().send(message);
      this.logger.debug(`Push notification sent to ${token}`);
    } catch (error) {
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        this.logger.warn(`Invalid or expired FCM token: ${token}`);
      } else {
        this.logger.error(
          `Failed to send push notification to ${token}:`,
          error,
        );
      }
    }
  }

  generatePushNotificationContent(
    type: InteractionType,
    actorName: string,
    additionalData?: Record<string, string>,
    language: string = 'en',
  ): { title: string; body: string } {
    let title: string;
    let body: string;

    switch (type) {
      case 'comment':
        title = language === 'es' ? 'Nuevo comentario' : 'New Comment';
        body =
          language === 'es'
            ? `${actorName} comentó en tu publicación`
            : `${actorName} commented on your post`;
        break;
      case 'reply':
        title = language === 'es' ? 'Nueva respuesta' : 'New Reply';
        body =
          language === 'es'
            ? `${actorName} respondió a tu comentario`
            : `${actorName} replied to your comment`;
        break;
      case 'reaction':
        title = language === 'es' ? 'Nueva reacción' : 'New Reaction';
        body =
          language === 'es'
            ? `A ${actorName} le gustó tu publicación`
            : `${actorName} liked your post`;
        break;
      case 'followed_user':
        title = language === 'es' ? 'Nuevo seguidor' : 'New Follower';
        body =
          language === 'es'
            ? `${actorName} comenzó a seguirte`
            : `${actorName} started following you`;
        break;
      case 'followed_page':
        title =
          language === 'es' ? 'Nuevo seguidor de página' : 'New Page Follower';
        body =
          language === 'es'
            ? `${actorName} comenzó a seguir tu página ${additionalData?.pageName || ''}`
            : `${actorName} started following your page ${additionalData?.pageName || ''}`;
        break;
      case 'joined_group':
        title =
          language === 'es' ? 'Nuevo miembro del grupo' : 'New Group Member';
        body =
          language === 'es'
            ? `${actorName} se unió a tu grupo ${additionalData?.groupName || ''}`
            : `${actorName} joined your group ${additionalData?.groupName || ''}`;
        break;
      case 'joined_event':
        title =
          language === 'es'
            ? 'Nuevo participante del evento'
            : 'New Event Participant';
        body =
          language === 'es'
            ? `${actorName} se unió a tu evento ${additionalData?.eventName || ''}`
            : `${actorName} joined your event ${additionalData?.eventName || ''}`;
        break;
      default:
        title = language === 'es' ? 'Nueva notificación' : 'New Notification';
        body =
          language === 'es'
            ? `${actorName} realizó una acción`
            : `${actorName} performed an action`;
    }

    return { title, body };
  }
}
