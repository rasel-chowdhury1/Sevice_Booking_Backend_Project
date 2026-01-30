import httpStatus from 'http-status';
import { PaypalUtils } from '../../utils/paypal';
import AppError from '../../error/AppError';

export const createCheckoutSessionUsingPaypalForSubscription = async (payload: any) => {
  try {

    const {_id,subcriptionId,subcriptionName, amount,duration} = payload;

    let payment;

    const formattedPrice = amount.toFixed(2);

    payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        // return_url: `http://10.0.70.112:8010/api/v1/subcription-payment-requests/confirm-payment?userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${isExist.duration}`,
        return_url: `http://10.0.70.112:8010/api/v1/subcription-payment-requests/confirm-payment?userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${duration}`,
        cancel_url: `http://10.0.70.112:8010/api/v1/payments/cancel?paymentId=${'paymentDummy'}`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: `${subcriptionName}` || "testing",
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

    return new Promise<string>((resolve, reject) => {
      PaypalUtils().payment.create(payment, (error: any, payment: any) => {
        if (error) {

          reject(new AppError(httpStatus.NOT_FOUND, 'User not found'));
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              // Return the approval URL
              resolve(payment.links[i].href);
            }
          }
          reject(new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Approval URL not found'));
        }
      });
    });

  } catch (error) {
    console.log('------------------- paypal payment error  ====>>>> ', error);
  }
};


// import Stripe from "stripe";
// import sendResponse from "../../utils/sendResponse";

// export const calculateAmount = (amount: any) => {
//     return Number(amount) * 100;
//   };
  

  
// export const stripe = new Stripe(
//   "sk_test_51P4idwCjdDPhGLVk4wkUW1mZfjsMslXcOxsjFhOH03fVzYHiwvotf0nmwFnDRb6TgNk5gGJMdGMkrgsSkjlNPr2o002S03JXYb",
//   {
//     apiVersion: "2025-01-27.acacia",
//     typescript: true,
//   }
// );

  
// export const createCheckoutSession = async (res: any, payload: any) => {

//   console.log("==== payload data ===>>>>", payload)
//   try {

//   const { _id, subcriptionId, amount, subcriptionName, duration } =
//   payload;


//   console.log("==== duration ===>>> ", duration)

//   let paymentGatewayData;

//   // Check if required fields are present
//   if (!_id || !subcriptionId || !amount) {
//     return sendResponse(res, {
//       statusCode: 400,
//       success: false,
//       message: "Missing required payment details.",
//       data: null,
//     });
//   }

//   paymentGatewayData = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: [
//       {
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: subcriptionName,
//             description: "Please,fill up your information",
//             images: payload?.images,
//           },
//           unit_amount: payload.amount * 100,
//         },
//         quantity: 1,
//       },
//     ],

//     // success_url: `https://google.com`,
//     // success_url: `http://10.0.70.87:8030/api/v1/payment-requests/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${duration}&noOfDispatches=${noOfDispatches}`,

//     success_url: `http://10.0.70.112:8010/api/v1/subcription-payment-requests/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${duration}`,

//     cancel_url: `http://10.0.70.112:8010/api/v1/payments/cancel?paymentId=${"paymentDummy"}`,
//     mode: "payment",

//     invoice_creation: {
//       enabled: true,
//     },
//   });

//   // console.log(paymentGatewayData, "paymentGatewayData");



//   return paymentGatewayData.url;
    
//   } catch (error) {
//     console.error("Error creating Stripe session:", error);
//   return sendResponse(res, {
//     statusCode: 500,
//     success: false,
//     message: "Stripe session creation failed.",
//     data: null,
//   });
//   }

// };
  