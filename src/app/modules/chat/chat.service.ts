import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IChat } from './chat.interface';
import { User } from '../user/user.models';
import Chat from './chat.model';
import Message from '../message/message.model';
import { deleteFromS3 } from '../../utils/s3';

// =========== Create chat start ===========
const createChat = async (payload: IChat) => {
  const user1 = await User.findById(payload?.participants[0]);

  if (!user1) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid user');
  }

  const user2 = await User.findById(payload?.participants[1]);

  if (!user2) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid user');
  }

  // console.log({user1,user2})

  // check user1-user2 already exist in chat
  const alreadyExists = await Chat.findOne({
    participants: { $all: payload.participants },
  }).populate(['participants']);

  if (alreadyExists) {
    return alreadyExists;
  }

  const result = await Chat.create(payload);


  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat creation failed');
  }

  // populate participants for the newly created chat
  const populatedResult = await Chat.findById(result._id).populate(['participants']);




  return populatedResult;
};


// =========== Create chat end ===========

// =========== Get my chat list start ===========
const getMyChatList = async (userId: string, query: any) => {



  // Build the query object to filter the chats
  const filterQuery: any = { participants: { $all: userId } };
  


  const chats = await Chat.find(filterQuery).populate({
    path: 'participants',
    select: 'fullName email image profile role _id phoneNumber',
    match: { 
      _id: { $ne: userId },
      ...(query?.search && { fullName: { $regex: query.search, $options: 'i' } }) },
  });



  if (!chats) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat list not found');
  }

  const data = [];
  for (const chatItem of chats) {


    if(chatItem.participants.length < 1) return data;
    const chatId = chatItem?._id;

    // Find the latest message in the chat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message: any = await Message.findOne({ chat: chatId }).sort({
      updatedAt: -1,
    });

    const unreadMessageCount = await Message.countDocuments({
      chat: chatId,
      seen: false,
      sender: { $ne: userId },
    });


    if (message) {
      data.push({ chat: chatItem, message: message, unreadMessageCount });
    }
    else{
      // Even if no message exists, push the chat with a null message
    data.push({
      chat: chatItem,
      message: message || null, // Handle case where message doesn't exist
      unreadMessageCount
    });
    }
  }
  
  data.sort((a, b) => {
    const dateA = (a.message && a.message.createdAt) || 0;
    const dateB = (b.message && b.message.createdAt) || 0;
    return dateB - dateA;
  });



  return data ;
};
// =========== Get my chat list end ===========

// =========== Get chat by ID start =============
const getChatById = async (id: string) => {
    const result = await Chat.findById(id).populate({
      path: 'participants',
      select: 'fullName email image role _id phoneNumber ',
    });
  
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
    }
    return result;
  };
// =========== Get chat by ID end =============

// =========== Get message by ID start =============
const getMessagesByChatId = async (chatId: string) => {
  // Find messages by chatId and populate sender and receiver fields with relevant user details
  const messages = await Message.find({ chat: chatId })
    .populate({
      path: 'sender',
      select: 'fullName email image role _id phoneNumber', // Select relevant fields of sender
    })
    .populate({
      path: 'receiver',
      select: 'fullName email image role _id phoneNumber', // Select relevant fields of receiver
    });


  
  return messages || [];
};

// =========== Get message by ID start =============

// =========== Update chat list start =============
const updateChatList = async (id: string, payload: Partial<IChat>) => {
    const result = await Chat.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
    }
    return result;
  };
// =========== Update chat list end =============

// =========== Delete chat list start =============
const deleteChatList = async (id: string) => {
    await deleteFromS3(`images/messages/${id}`);
    const result = await Chat.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
    }
    return result;
  };
// =========== Delete chat list end =============






export const chatService = {
  createChat,
  getMyChatList,
  getChatById,
  getMessagesByChatId,
  updateChatList,
  deleteChatList,
};