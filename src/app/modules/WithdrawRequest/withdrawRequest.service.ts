
import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import { IWithdrawRequest } from "./WithdrawRequest.interface";
import WithdrawRequest from "./withdrawRequest.model";
import httpStatus from 'http-status';
// Add Withdraw Request
const addWithdrawRequest = async (WithdrawRequestBody: IWithdrawRequest)=> {

  const userData = await User.findById(WithdrawRequestBody.user);
  //  console.log("userdata ====>>> ", userData)
    // Check if user exists
    if (!userData) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found",);
    }

  // Check if user's wallet balance is greater than or equal to the requested amount
  if (userData?.wallet.balance < WithdrawRequestBody.amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient funds. Your wallet balance is $${userData.wallet.balance}, but you requested $${WithdrawRequestBody.amount}.`
    );
  }

  const newWithdrawReq = new WithdrawRequest(WithdrawRequestBody);
  const result = await newWithdrawReq.save();

  // Check if the save operation was successful
  if (!result) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to save withdraw request");
  }
  return result;
};

// Update Withdraw Request
const updateWithdrawRequest = async (paymentId: string, updateData: Partial<IWithdrawRequest>): Promise<IWithdrawRequest | null> => {
  return await WithdrawRequest.findByIdAndUpdate(paymentId, updateData, { new: true });
};

// Get Withdraw Requests with pagination
const getWithdrawRequests = async (filter: Record<string, any>, options: { page: number; limit: number }) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  const WithdrawRequests = await WithdrawRequest.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('user', 'fullName image email role phone');
  const totalResults = await WithdrawRequest.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { currentPage: page, limit, totalResults, totalPages };
  return { WithdrawRequests, pagination };
};

const getSpeceficUserWithdrawRequests = async (filter: Record<string, any>, options: { page: number; limit: number }) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  const WithdrawRequests = await WithdrawRequest.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('user', 'fullName image email');
  const totalResults = await WithdrawRequest.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { currentPage: page, limit, totalResults, totalPages };
  return { WithdrawRequests, pagination };
};

// Get Withdraw Request by ID
const getWithdrawRequestsById = async (id: string): Promise<IWithdrawRequest | null> => {
  return await WithdrawRequest.findById(id);
};

export const withdrawRequestService = {
  addWithdrawRequest,
  updateWithdrawRequest,
  getWithdrawRequests,
  getWithdrawRequestsById,
  getSpeceficUserWithdrawRequests
};

