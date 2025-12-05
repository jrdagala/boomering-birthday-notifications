import { getEnvConfig } from '../config';
import axios from 'axios';

type NotificationType = 'pipedream' | 'email';
interface INotification {
  message: string;
  type: NotificationType;
}

class NotificationService {
  static async sendNotification(notification: INotification) {
    if (notification.type === 'pipedream') {
      return this.sendPipedreamNotification(notification.message);
    }
  }

  static async sendPipedreamNotification(message: string) {
    const { pipedreamURL } = getEnvConfig();
    const response = await axios.post(pipedreamURL, {
      message,
    });
    return response;
  }
}

export default NotificationService;
