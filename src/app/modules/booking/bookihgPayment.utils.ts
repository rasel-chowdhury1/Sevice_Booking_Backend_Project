import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { PaypalUtils } from '../../utils/paypal';
import { convertTo24HourFormat } from './booking.validation';
import Payment from '../payment/payment.model';
import { User } from '../user/user.models';
import { IWalletTransaction } from '../WithdrawRequest/WithdrawRequest.interface';

export const createCheckoutSessionUsingPaypalForBooking = async (
  payload: any,
) => {

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
        return_url: `http://10.0.70.112:9010/api/v1/booking/confirm-payment?user_id=${user_id}&guide_id=${guide_id}&amount=${total_price}&booking_date=${booking_date}&booking_time=${formetDate}`,
        cancel_url: `http://10.0.70.112:9010/api/v1/payments/cancel?paymentId=${'paymentDummy'}`,
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
          console.error('Error creating payout:', error);
          reject(new Error(error.message));
        } else {
          console.log('Payout created successfully:', payout);
          resolve(payout); // Return the payout response on success
        }
      });
    });
    
  } catch (err: any) {
    console.error('Error during payout process:', err);
    throw new Error(err.message);
  }
}


export async function refundMoneyToUserAccount(
  bookingId: string,
  paymentId: any,
  userId: any
) {
  // Fetch the payment record based on the paymentId
  const payment = await Payment.findOne({ _id: paymentId });

  // Check if the payment exists and its status is 'paid'
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found.");
  }
  if (payment.paymentStatus !== "paid") {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment is not paid yet.");
  }

  // Fetch user data based on userId
  const userData = await User.findById(userId);
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  // Amount to refund is equal to the payment amount
  const transferAmount = payment.amount;

  // Update the user's wallet balance
  userData.wallet.balance += transferAmount;

  // Create a new transaction record for the refund
  const transaction = {
    type: "refund",
    amount: transferAmount,
    referenceId: bookingId,  // Reference to the booking
    date: new Date(),
  };

  // Push the new transaction into the user's wallet transactions array
  userData.wallet.transactions.push(transaction as any);

  // Save the user's wallet updates to the database
  await User.updateOne(
    { _id: userData._id },
    {
      $set: { "wallet.balance": userData.wallet.balance },
      $push: { "wallet.transactions": transaction },
    }
  );

  // Update the payment status to 'refund'
  await Payment.findByIdAndUpdate(paymentId, { paymentStatus: "refunded" }, { new: true });

  // Optionally, you can return the updated data or any other info
  return { message: "Refund successful", newBalance: userData.wallet.balance };
}
