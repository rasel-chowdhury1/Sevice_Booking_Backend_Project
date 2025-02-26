
import httpStatus from 'http-status';
import AppError from '../error/AppError';
import { PaypalUtils } from './paypal';

export const createCheckoutSessionUsingPaypal = async (payload: any) => {
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
          console.log('=== paypal payment error ==>>>>> ', error);
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



// import { Response } from 'express';
// import httpStatus from 'http-status';
// import paypal from 'paypal-rest-sdk';
// import AppError from '../error/AppError';
// import sendResponse from './sendResponse';

// paypal.configure({
//   mode: 'sandbox',
//   client_id:
//     'AWoXWsM1MnM8-MEU_9cTKYWnrSG_BA6HGRuSTIurNerWFFSI3LBkSeEx8H7MllFgANIDpVuUqnGifgO5',
//   client_secret:
//     'EGIqPprFPsEpcaEKe0LseUUMbnv0-IMxAar8fbrN75plv2r1eF4DfSWcZK038mhzfAdBVecszMEFA-lS',
// });

// export const createCheckoutSessionUsingPaypal = async (
//   res: Response,
//   payload: any,
// ) => {
//   try {
//     const { _id, subcriptionId, amount, subcriptionName, duration } = payload;

//     console.log('==== duration ===>>> ', duration);

//     let payment;

//     // Check if required fields are present
//     if (!_id || !subcriptionId || !amount) {
//       return sendResponse(res, {
//         statusCode: 400,
//         success: false,
//         message: 'Missing required payment details.',
//         data: null,
//       });
//     }

//     const formattedPrice = amount.toFixed(2);

//     payment = {
//       intent: 'sale',
//       payer: {
//         payment_method: 'paypal',
//       },
//       redirect_urls: {
//         // http://localhost:3000/payment/paypal/success?app=U2FsdGVkX1/W0OEYqkDDooRyGcj23kavmEj7xiedIVIWPAGID8IG1ZaQiYlkUBkTWbXF0CMarK9yjqgXRB7wL0QIfFYyfdgt4FIZNPB8Dcy84ZY+NRGtWx3nkosUhbHXnxHxot79HolUb/a12AAKdQ==&paymentId=PAYID-MWUGVTY45C10167TA709600D&token=EC-0FV098435R815293J&PayerID=L3CREV92USD28
//         // this url to get -->paymentId  , PayerID
//         return_url: `http://10.0.70.112:8010/api/v1/subcription-payment-requests/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&userId=${_id}&amount=${amount}&subcriptionId=${subcriptionId}&duration=${duration}`,
//         // return_url: `${process.env.LOCALHOST_SERVER_SIDE}/api/v1/payment/success?app=${encriptData}`,
//         cancel_url: `http://10.0.70.112:8010/api/v1/payments/cancel?paymentId=${'paymentDummy'}`,
//       },
//       transactions: [
//         {
//           item_list: {
//             items: [
//               {
//                 name: subcriptionName,
//                 quantity: 1,
//                 price: formattedPrice,
//                 currency: 'EUR',
//               },
//             ],
//           },
//           amount: {
//             currency: 'EUR',
//             total: formattedPrice,
//           },
//           description: '',
//           // Here we add the custom metadata
//         },
//       ],
//     };

//     paypal.payment.create(payment, (error: any, payment: any) => {
//       if (error) {
//         console.log('=== paypal payment error ==>>>>> ', error);

//         throw new AppError(httpStatus.NOT_FOUND, 'user not found');
//       } else {
//         for (let i = 0; i < payment.links.length; i++) {
//           if (payment.links[i].rel === 'approval_url') {
//             console.log('==== url ====>>>  ', payment.links[i].href);
//             return payment.links[i].href;
//           }
//         }
//       }
//     });

//     console.log('------------------- paypal payment ====>>>> ', payment);
//   } catch (error) {
//     console.log('------------------- paypal payment error  ====>>>> ', error);
//   }
// };
