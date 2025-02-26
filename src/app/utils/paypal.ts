import axios from 'axios';
import httpStatus from 'http-status';
import paypal from 'paypal-rest-sdk';
import config from '../config';
import AppError from '../error/AppError';

export const PaypalUtils = () => {
  // Configure PayPal SDK
  paypal.configure({
    mode: 'sandbox', // Use 'sandbox' for testing and 'live' for production
    client_id: config.paypal_client_id as string,
    client_secret: config.paypal_client_secret as string,
  });

  // Return the configured paypal instance
  return paypal;
};

const retrievePayment = async (paymentId: string, payerId: string) => {
  try {
    console.log("Client ID -->>> ", config.paypal_client_id);
    console.log("Client Secret -->>> ", config.paypal_client_secret);

    // Ensure client credentials are correctly encoded
    const authHeader = {
      Authorization: `Basic ${Buffer.from(
        `${config.paypal_client_id}:${config.paypal_client_secret}`
      ).toString("base64")}`,
      "Content-Type": "application/json",
    };

    // Ensure valid paymentId and payerId
    if (!paymentId || !payerId) {
      console.log({paymentId,payerId})
      throw new AppError(httpStatus.BAD_REQUEST, "Missing paymentId or payerId");
    }

    // Debugging: Log the paymentId and payerId
    // console.log("Executing payment for:", { paymentId, payerId });

    // Correct PayPal API URL
    const PAYPAL_API_URL = "https://api-m.sandbox.paypal.com";

    // Execute PayPal payment
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/payments/payment/${paymentId}/execute`,
      { payer_id: payerId },
      { headers: authHeader }
    );

    // console.log("PayPal Response:", response.data);

    return response.data;
  } catch (error: any) {
    console.error("Error executing payment:", error?.response?.data || error.message);

    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      error?.response?.data?.message || "Failed to execute PayPal payment"
    );
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
      paypal.payout.create(payoutData, (error: any, payout: any) => {
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


export default retrievePayment;
