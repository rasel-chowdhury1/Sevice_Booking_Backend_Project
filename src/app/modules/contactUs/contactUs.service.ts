import AppError from "../../error/AppError";
import httpStatus from 'http-status';
import { ContactUs } from "./contactUs.model";

const getContactUs = async () => {
  const settings = await ContactUs.findOne();

  if (!settings) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact us not found');
  }

  return settings;
};

const updateContactUs = async (data: any) => {
  let contactUs = await ContactUs.findOne();

  if (!contactUs) {
    // If settings don't exist, create a new one
    contactUs = new ContactUs(data);
  } else {
    // If settings exist, update the existing document
    Object.assign(contactUs, data);
  }

  const result = await contactUs.save();

//   console.log('====== Admin settings updated data ===== >>> ', result);

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Contact us update failed',
    );
  }

  return result;
};


export const ContactUsService = {
    getContactUs,
    updateContactUs
};