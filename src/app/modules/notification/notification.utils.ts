

import { ObjectId } from "mongoose"
import Notification from "./notification.model";


interface ICreateNotification {
    user_id: string | ObjectId,
    recipient_id: string | ObjectId,
    type: string,
    title: string,
    message: string,
    data?: string
}

export const createNotification  = async(notificationData: ICreateNotification) => {

    const {user_id, recipient_id, type, title, message,data} = notificationData;

     // Notification for the user
     const userNotification = new Notification({
        user_id,
        recipient_id,
        type,
        title,
        message,
        data
      });
      await userNotification.save();


    return;
}

