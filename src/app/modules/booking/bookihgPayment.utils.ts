import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { PaypalUtils } from '../../utils/paypal';
import { convertTo24HourFormat } from './booking.validation';

export const createCheckoutSessionUsingPaypalForBooking = async (
  payload: any,
) => {

  console.log("payload ->> ", payload)
  try {
    const {
      user_id,
      guide_id,
      guideName,
      booking_date,
      booking_time,
      total_price,
    } = payload;

    let payment;

    const formattedPrice = total_price.toFixed(2);

    const formetDate= convertTo24HourFormat(booking_time)

    payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        // return_url: `http://10.0.70.112:8010/api/v1/subcription-payment-requests/confirm-payment?userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${isExist.duration}`,
        return_url: `http://10.0.70.112:8010/api/v1/booking/confirm-payment?user_id=${user_id}&guide_id=${guide_id}&amount=${total_price}&booking_date=${booking_date}&booking_time=${formetDate}`,
        cancel_url: `http://10.0.70.112:8010/api/v1/payments/cancel?paymentId=${'paymentDummy'}`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: guideName,
                quantity: 1,
                price: formattedPrice,
                currency: 'EUR',
              },
            ],
          },
          amount: {
            currency: 'EUR',
            total: formattedPrice,
          },
          description: '',
          // Here we add the custom metadata
        },
      ],
    };

    console.log('payment -:>>>>>', payment);

    return new Promise<string>((resolve, reject) => {
      PaypalUtils().payment.create(payment, (error: any, payment: any) => {
        if (error) {
          console.log('=== paypal payment error ==>>>>> ', error);
          reject(new AppError(httpStatus.NOT_FOUND, 'User not found'));
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              // Return the approval URL
              resolve(payment.links[i].href);
            }
          }
          reject(
            new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'Approval URL not found',
            ),
          );
        }
      });
    });
  } catch (error) {
    console.log('------------------- paypal payment error  ====>>>> ', error);
  }
};



//-- delivery complete--
export async function sendMoneyToPaypalAccount(
  amount: number,
  recipientEmail: string,
  option: Partial<{ currency: string; purchaseId: string }>,
): Promise<any | void> {
  // Create payout payload
  const payoutData = {
    sender_batch_header: {
      email_subject: 'You have a payout!',
      email_message: `You have received a payout of $${amount}. Thank you!`,
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2), // Amount to transfer
          currency: option?.currency || 'EUR',
        },
        receiver: recipientEmail, // Recipient's PayPal email
        note: `Payment of $${amount} to ${recipientEmail}`,
        sender_item_id: option?.purchaseId || `item_${Date.now()}`,
      },
    ],
  };

  try {
    // Create the payout using the PayPal SDK
    return new Promise((resolve, reject) => {
      PaypalUtils().payout.create(payoutData, (error: any, payout: any) => {
        if (error) {
          // console.error('Error creating payout:', error);
          reject(new Error(error.message));
        } else {
          // console.log('Payout created successfully:', payout);
          resolve(payout); // Return the payout response on success
        }
      });
    });
  } catch (err: any) {
    console.error('Error during payout process:', err);
    throw new Error(err.message);
  }
}
