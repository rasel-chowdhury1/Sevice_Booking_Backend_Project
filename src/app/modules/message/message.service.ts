import httpStatus from 'http-status';
import { io } from '../../../server';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { deleteFromS3 } from '../../utils/s3';
import Chat from '../chat/chat.model';
import { chatService } from '../chat/chat.service';
import { IMessage } from './message.interface';
import Message from './message.model';

const createMessages = async (payload: IMessage) => {
  const alreadyExists = await Chat.findOne({
    participants: { $all: [payload.sender, payload.receiver] },
  }).populate(['participants']);

  if (!alreadyExists) {
    const chatList = await Chat.create({
      participants: [payload.sender, payload.receiver],
    });
    //@ts-ignore
    payload.chat = chatList?._id;
  } else {
    //@ts-ignore
    payload.chat = alreadyExists?._id;
  }

  const result = await Message.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message creation failed');
  }

  if (io) {
    const senderMessage = 'new-message::' + result.chat.toString();

    io.emit(senderMessage, result);

    // //----------------------ChatList------------------------//
    const ChatListSender = await chatService.getMyChatList(
      result?.sender.toString(),
      {},
    );
    const ChatListReceiver = await chatService.getMyChatList(
      result?.receiver.toString(),
      {},
    );

    const senderChat = 'chat-list::' + result.sender.toString();
    const receiverChat = 'chat-list::' + result.receiver.toString();
    io.emit(receiverChat, ChatListSender);
    io.emit(senderChat, ChatListReceiver);
  }

  return result;
};

// Get all messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllMessages = async (query: Record<string, any>) => {
  const MessageModel = new QueryBuilder(
    Message.find().populate([
      {
        path: 'sender',
        select: 'name email image role _id phoneNumber ',
      },
      {
        path: 'receiver',
        select: 'name email image role _id phoneNumber ',
      },
    ]),
    query,
  )
    .filter()
    // .paginate()
    .sort()
    .fields();

  const data = await MessageModel.modelQuery;
  const meta = await MessageModel.countTotal();
  return {
    data,
    meta,
  };
};

// Update messages
const updateMessages = async (id: string, payload: Partial<IMessage>) => {
  const result = await Message.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message update failed');
  }
  return result;
};

// Get messages by chat ID
const getMessagesByChatId = async (chatId: string) => {
  const result = await Message.find({ chat: chatId }).sort({ createdAt: -1 });
  return result;
};

// Get message by ID
const getMessagesById = async (id: string) => {
  const result = await Message.findById(id).populate([
    {
      path: 'sender',
      select: 'name email image role _id phoneNumber ',
    },
    {
      path: 'receiver',
      select: 'name email image role _id phoneNumber ',
    },
  ]);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Message not found');
  }
  return result;
};

const deleteMessages = async (id: string) => {
  const message = await Message.findById(id);
  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Message not found');
  }
  if (message?.imageUrl) {
    await deleteFromS3(
      `images/messages/${message?.chat.toString()}/${message?.id}`,
    );
  }

  const result = await Message.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Message not found');
  }
  return result;
};

const seenMessage = async (userId: string, chatId: string) => {
  const messageIdList = await Message.aggregate([
    {
      $match: {
        chat: chatId,
        seen: false,
        sender: { $ne: userId },
      },
    },
    { $group: { _id: null, ids: { $push: '$_id' } } },
    { $project: { _id: 0, ids: 1 } },
  ]);
  const unseenMessageIdList =
    messageIdList.length > 0 ? messageIdList[0].ids : [];

  const updateMessages = await Message.updateMany(
    { _id: { $in: unseenMessageIdList } },
    { $set: { seen: true } },
  );
  return updateMessages;
};

export const messagesService = {
  createMessages,
  getMessagesByChatId,
  getMessagesById,
  updateMessages,
  getAllMessages,
  deleteMessages,
  seenMessage,
};
