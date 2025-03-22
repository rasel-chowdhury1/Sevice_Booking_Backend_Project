import cron from 'node-cron';
import MySubscription from '../modules/mySubscription/mySubscription.model';
import { User } from '../modules/user/user.models';
import { createNotification } from '../modules/notification/notification.utils';

// Schedule the job to run every day at midnight (00:00)
const cronJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();

      const admin = await User.findOne({ role: 'admin' });

      // Find subscriptions that have expired
      const expiredSubscriptions = await MySubscription.find({
        expiryDate: { $lt: today },
        isExpired: { $ne: true }, // Ensure we don't check already expired subscriptions
        isNotified: { $ne: true }
      });

      if (expiredSubscriptions.length > 0) {
        for (const subscription of expiredSubscriptions) {
          const userId = subscription.user;

          // Find user details by ID
          const user = await User.findById(userId);
          if (user) {
            const NotificationData = {
              user_id: admin?._id || user._id,
              recipient_id: user._id,
              type: 'info',
              title: 'Subscription Expiry Alert',
              message: `Dear ${user.fullName}, your subscription has expired. Please renew to continue enjoying our service.`,
            };

            await createNotification(NotificationData);

            // Set user's subscription status to false
            user.isSubcription = false;
            await user.save();

            // Mark the subscription as expired
            subscription.isExpired = true;
            subscription.isNotified = true;
            await subscription.save();

            console.log(`Expired subscription handled for user: ${userId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  });
};

export default cronJob;
 