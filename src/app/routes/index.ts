import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { bookingRoutes } from '../modules/booking/booking.route';
import { calendarRoutes } from '../modules/calender/calender.route';
import { chatRoutes } from '../modules/chat/chat.route';
import { eventRoutes } from '../modules/event/event.route';
import { messagesRoutes } from '../modules/message/message.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { participantRoutes } from '../modules/participant/participant.route';
import { reportRoutes } from '../modules/report/report.route';
import { reviewRoutes } from '../modules/review/review.route';
import { subscriptionRoutes } from '../modules/subscription/subscription.route';
import { subcriptionPaymentRoutes } from '../modules/subscriptionPayment/subscriptionPayment.route';
import { userRoutes } from '../modules/user/user.route';
import { faqRoutes } from '../modules/faq/faq.route';
import { privacyPolicyRoutes } from '../modules/privacyPolicy/privacyPolicy.route';
import { ContactUsRoutes } from '../modules/contactUs/contactus.route';
import { notificationRoutes } from '../modules/notification/notification.route';
import { withdrawRequestRoutes } from '../modules/WithdrawRequest/withdrawRequest.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { settingsRoutes } from '../modules/setting/setting.route';
import { staticPagesRoutes } from '../modules/staticPages/staticPages.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },

  {
    path: '/otp',
    route: otpRoutes,
  },

  {
    path: '/event',
    route: eventRoutes,
  },

  {
    path: '/booking',
    route: bookingRoutes,
  },

  {
    path: '/chat',
    route: chatRoutes,
  },
  {
    path: '/participant',
    route: participantRoutes,
  },
  {
    path: '/review',
    route: reviewRoutes,
  },
  {
    path: '/calendar',
    route: calendarRoutes,
  },
  {
    path: '/message',
    route: messagesRoutes,
  },
  {
    path: '/report',
    route: reportRoutes,
  },
  {
    path: '/subscription',
    route: subscriptionRoutes,
  },
  {
    path: "/notifications",
    route: notificationRoutes
  },
  {
    path: '/subcription-payment-requests',
    route: subcriptionPaymentRoutes,
  },
  {
    path: '/payments',
    route: paymentRoutes,
  },
  {
    path: "/withdraw-requests",
    route: withdrawRequestRoutes
  },
  {
    path: "/faq",
    route: faqRoutes
  },
  {
    path: "/settings",
    route: settingsRoutes
  },
  {
    path: "/privacyPolicy",
    route: privacyPolicyRoutes
  },
  {
    path: "/contactUs",
    route: ContactUsRoutes
  },
  {
    path: "/static",
    route: staticPagesRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
