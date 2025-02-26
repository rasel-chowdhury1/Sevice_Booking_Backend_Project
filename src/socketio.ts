/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// socketIO.js
import { Server as HttpServer } from 'http';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import AppError from './app/error/AppError';
import { IChat } from './app/modules/chat/chat.interface';
import Chat from './app/modules/chat/chat.model';
import { chatService } from './app/modules/chat/chat.service';
import Message from './app/modules/message/message.model';
import { TUser } from './app/modules/user/user.interface';
import { User } from './app/modules/user/user.models';
import { callbackFn } from './app/utils/callbackFn';
import socketAuthMiddleware from './socket/auth/auth';

// this is using for file message emit send-message
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
const writeFileAsync = promisify(fs.writeFile);
const imagesDir = path.join(__dirname, 'uploads'); // Local storage for images

const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Online users
  const onlineUser = new Set();

  // middleware to authenticate the socket connection
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    console.log('connected', socket?.id);

    // =================== try catch 1 start ================
    try {
      // //----------------------user token get from front end-------------------------//
      //   const token =
      //   socket.handshake.auth?.token || socket.handshake.headers?.token||
      //   socket.handshake.headers.authorization;

      // //----------------------check Token and return user details-------------------------//
      //   const user: any = await getUserDetailsFromToken(token);

      const user: any = (socket as any)?.decodedToken;

      //==================== check user is not exist  =======================
      if (!user) {
        // io.emit('io-error', {success:false, message:'invalid Token'});
        socket.emit('io-error', { success: false, message: 'Invalid token' });
        socket.disconnect(true);
        throw new Error('Invalid token');
        // throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }

      // ========= adde new user in onlineUser =====================
      onlineUser.add(user.userId.toString());

      //----------------------online array send for front end------------------------//
      io.emit('onlineUser', Array.from(onlineUser));

      // ===================== join by user id ================================
      // socket.join(user?._id?.toString());

      // ===================== join room by chatId functionlity start === working check done in this function ================================
      socket.on('join-room', async (chatId, callback) => {
        try {
          if (!chatId) {
            return callbackFn(callback, {
              success: false,
              message: 'Chat ID is required',
            });
          }

          // Validate chat room membership
          const chat = await Chat.findById(chatId);
          if (!chat) {
            return callbackFn(callback, {
              success: false,
              message: 'Chat not found',
            });
          }

          const userIdObject = new mongoose.Types.ObjectId(user.userId);

          //chat.participants is userIds array like ['userId1', 'userId2']. then some method returns true if at least one element in the array satisfies the given condition.
          console.log('=== before user id =====', user.userId);
          console.log('===== participant ===== ', chat.participants);

          const isParticipant = chat.participants.some((participant) =>
            participant.equals(userIdObject),
          );

          if (!isParticipant) {
            return callbackFn(callback, {
              success: false,
              message: 'Unauthorized access',
            });
          }

          // Join the chat room only if authorized
          socket.join(chatId);
          callbackFn(callback, { success: true, message: 'Joined chat room' });
        } catch (error) {
          callbackFn(callback, { success: false, message: 'Server error' });
        }
      });

      // ===================== join room by chatId functionlity end ================================

      //----------------------user details and messages send start for front end -->(as need to use)------------------------//
      socket.on('message-page', async (userId, callback) => {
        if (!userId) {
          callbackFn(callback, {
            success: false,
            message: 'userId is required',
          });
        }

        try {
          const receiverDetails: TUser | null = await User.findById(
            userId,
          ).select('_id email role image');

          if (!receiverDetails) {
            callbackFn(callback, {
              success: false,
              message: 'user is not found!',
            });
            io.emit('io-error', {
              success: false,
              message: 'user is not found!',
            });
          }
          const payload = {
            _id: receiverDetails?._id,
            email: receiverDetails?.email,
            image: receiverDetails?.image,
            role: receiverDetails?.role,
          };

          socket.emit('user-details', payload);

          const getPreMessage = await Message.find({
            $or: [
              { sender: user?._id, receiver: userId },
              { sender: userId, receiver: user?._id },
            ],
          }).sort({ updatedAt: 1 });

          socket.emit('message', getPreMessage || []);

          // Notification
          // const allUnReaddMessage = await Message.countDocuments({
          //   receiver: user?._id,
          //   seen: false,
          // });
          // const variable = 'new-notifications::' + user?._id;
          // io.emit(variable, allUnReaddMessage);

          // const allUnReaddMessage2 = await Message.countDocuments({
          //   receiver: userId,
          //   seen: false,
          // });
          // const variable2 = 'new-notifications::' + userId;
          // io.emit(variable2, allUnReaddMessage2);

          //end Notification//
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          io.emit('io-error', { success: false, message: error });
          console.error('Error in message-page event:', error);
        }
      });
      //----------------------user details and messages send end for front end -->(as need to use)------------------------//

      //----------------------chat list start------------------------//
      socket.on('my-chat-list', async ({}, callback) => {
        try {
          const chatList = await chatService.getMyChatList(user?.userId, {});
          const myChat = 'chat-list::' + user?.userId;

          io.emit(myChat, chatList);

          callbackFn(callback, { success: true, message: chatList });
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          io.emit('io-error', { success: false, message: error.message });
        }
      });
      //----------------------chat list end------------------------//

      // ================== send message functionlity start optimize way === working check done in this function ========================
      socket.on('send-message', async (payload, callback) => {
        console.log('====== send new message payload data >>>>>>>>>', payload);
        const session = await mongoose.startSession();
        let transactionCommitted = false; // Track transaction status
        session.startTransaction();

        try {
          payload.sender = user?.userId;

          // ✅ Step 1: Find or Create Chat Room in a Single Query
          const chat = await Chat.findOneAndUpdate(
            { participants: { $all: [payload.sender, payload.receiver] } },
            {
              $setOnInsert: {
                participants: [payload.sender, payload.receiver],
              },
            },
            { new: true, upsert: true, session },
          );

          payload.chat = chat._id;

          // Step 2: if pass image in payload then Process Image Uploads functionlity start
          const savedImages: { key: string; url: string }[] = [];

          if (payload.images && Array.isArray(payload.images)) {
            for (const image of payload.images) {
              const { name, data } = image;

              let fileBuffer: Buffer;
              if (typeof data === 'string') {
                fileBuffer = Buffer.from(data, 'base64');
              } else if (Buffer.isBuffer(data)) {
                fileBuffer = data;
              } else {
                throw new Error('Unsupported image data format');
              }

              const sanitizedFilename = name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

              if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
              }

              const filePath = path.join(imagesDir, sanitizedFilename);
              await writeFileAsync(filePath, fileBuffer);

              const publicFileURL = `/images/${sanitizedFilename}`;
              savedImages.push({ key: sanitizedFilename, url: publicFileURL });
            }
          }

          payload.imageUrl = savedImages.length > 0 ? savedImages : [];

          // =========== Process Image Uploads functionlity end ===========

          console.log('==== send message data ===== ', payload);

          // ✅ Step 3: Create Message
          const result = await Message.create([payload], { session });

          if (!result || result.length === 0) {
            throw new Error('Message creation failed');
          }

          const message = result[0];

          // ✅ Step 4: Commit Transaction
          await session.commitTransaction();
          transactionCommitted = true; // Mark as committed
          session.endSession();

          // ✅ Step 5: Emit the message to both sender and receiver only
          io.to(chat._id.toString()).emit('new-message', message);

          // ✅ Step 6: Update Chat Lists
          Promise.all([
            chatService.getMyChatList(payload.sender, {}).then((chatList) => {
              io.to(payload.sender.toString()).emit(
                'chat-list::' + payload.sender.toString(),
                chatList,
              );
            }),
            chatService.getMyChatList(payload.receiver, {}).then((chatList) => {
              io.to(payload.receiver.toString()).emit(
                'chat-list::' + payload.receiver.toString(),
                chatList,
              );
            }),
          ]);

          // ✅ Step 6: Optimize Unread Message Count Calculation
          Promise.all([
            Message.countDocuments({
              receiver: payload.sender,
              seen: false,
            }).then((count) => {
              io.to(payload.sender.toString()).emit(
                'new-notifications::' + payload.sender.toString(),
                count,
              );
            }),
            Message.countDocuments({
              receiver: payload.receiver,
              seen: false,
            }).then((count) => {
              io.to(payload.receiver.toString()).emit(
                'new-notifications::' + payload.receiver.toString(),
                count,
              );
            }),
          ]);

          // ✅ Step 7: Send Success Response
          callbackFn(callback, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Message sent successfully!',
            data: message,
          });
        } catch (error) {
          if (!transactionCommitted) {
            await session.abortTransaction(); // Only abort if transaction wasn't committed
          }
          session.endSession();
          console.error('Error in send-message:', error);
          callbackFn(callback, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Message sending failed',
          });
        }
      });

      // ================== send message functionlity end optimize way ========================

      //-------------- seen message start -----------------------//
      socket.on('seen', async ({ chatId }, callback) => {
        if (!chatId) {
          callbackFn(callback, {
            success: false,
            message: 'chatId id is required',
          });
          io.emit('io-error', {
            success: false,
            message: 'chatId id is required',
          });
        }

        try {
          const chatList: IChat | null = await Chat.findById(chatId);
          if (!chatList) {
            callbackFn(callback, {
              success: false,
              message: 'chat id is not valid',
            });
            io.emit('io-error', {
              success: false,
              message: 'chat id is not valid',
            });
            throw new AppError(httpStatus.BAD_REQUEST, 'chat id is not valid');
          }

          const messageIdList = await Message.aggregate([
            {
              $match: {
                chat: new mongoose.Types.ObjectId(chatId.toString()),
                seen: false,
                sender: {
                  $ne: new mongoose.Types.ObjectId(user?.userId.toString()),
                },
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

          console.log('=============== updated message +++ > ', updateMessages);

          const user1 = chatList.participants[0];
          const user2 = chatList.participants[1];
          // //----------------------ChatList------------------------//
          const ChatListUser1 = await chatService.getMyChatList(
            user1.toString(),
            {},
          );

          const ChatListUser2 = await chatService.getMyChatList(
            user2.toString(),
            {},
          );

          const user1Chat = 'chat-list::' + user1;

          const user2Chat = 'chat-list::' + user2;

          console.log({ user1Chat, user2Chat });

          const allUnReaddMessage = await Message.countDocuments({
            receiver: user1,
            seen: false,
          });
          const variable = 'new-notifications::' + user1;
          io.emit(variable, allUnReaddMessage);

          const allUnReaddMessage2 = await Message.countDocuments({
            receiver: user2,
            seen: false,
          });
          const variable2 = 'new-notifications::' + user2;
          io.emit(variable2, allUnReaddMessage2);

          const getPreMessage = await Message.find({
            $or: [
              { sender: user1, receiver: user2 },
              { sender: user2, receiver: user1 },
            ],
          }).sort({ updatedAt: 1 });

          socket.emit('message', getPreMessage || []);

          io.emit(user1Chat, ChatListUser1);
          io.emit(user2Chat, ChatListUser2);
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          console.error('Error in seen event:', error);
          socket.emit('error', { message: error.message });
        }
      });
      //-------------- seen message end -----------------------//

      //-----------------------Typing functionlity start === working check done in this function ------------------------//
      socket.on('typing', (data, callback) => {
        const chat = 'typing::' + data.chatId.toString();
        const message = user?.fullName + ' is typing...';
        const result = {
          success: true,
          typingUserId: user?.userId,
        };
        console.log('==== message === ', result);

        io.emit(chat, result);
        callbackFn(callback, result);
      });
      //============= stop typeing ================
      socket.on('stopTyping', (data, callback) => {
        const chat = 'stopTyping::' + data.chatId.toString();
        const typeingChat = 'typing::' + data.chatId.toString();
        const message = user?.fullName + ' is stop typing...';

        io.emit(chat, { message: message });
        io.emit(typeingChat, {
          success: false,
          typingUserId: user?.userId,
        });
        callbackFn(callback, {
          success: true,
          message: message,
        });
      });
      //-----------------------Typing functionlity end ------------------------//

      // ==================== using testing purpuse below this code start =================
      socket.on('check', (data, callback) => {
        console.log(data);

        callbackFn(callback, { success: true, result: data });
      });
      // ==================== using testing purpuse below this code end =================

      //-----------------------Seen All functionlity start ------------------------//
      socket.on('message-notification', async ({}, callback) => {
        try {
          const allUnReaddMessage = await Message.countDocuments({
            receiver: user?.userId,
            seen: false,
          });
          const variable = 'new-notifications::' + user?.userId;
          io.emit(variable, allUnReaddMessage);
          callbackFn(callback, { success: true, message: allUnReaddMessage });
        } catch (error) {
          callbackFn(callback, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to retrieve notifications',
          });
        }
      });
      //-----------------------Seen All functionlity end ------------------------//

      //-----------------------Disconnect functionlity start ------------------------//
      socket.on('disconnect', () => {
        onlineUser.delete(user?._id?.toString());
        io.emit('onlineUser', Array.from(onlineUser));
        console.log('disconnect user ', socket.id);
      });
      //-----------------------Disconnect functionlity end ------------------------//
    } catch (error) {
      console.error('-- socket.io connection error --', error);
      // throw new Error(error)
      //-----------------------Disconnect functionlity start ------------------------//
      socket.on('disconnect', () => {
        console.log('disconnect user ', error);
      });
      //-----------------------Disconnect functionlity end ------------------------//
    }
    // ==================== try catch 1 end ==================== //
  });

  return io;
};

export default initializeSocketIO;

// ================== send message functionlity start ========================
// socket.on('send-message', async (payload, callback) => {

//   payload.sender = user?._id;

//   //  Check if a chat already exists between the sender and receiver then chat value set existing chatid
//   const alreadyExists = await Chat.findOne({
//     // MongoDB `$all` operator ensures both users exist in the `participants` array
//     // irrespective of order (e.g., [A, B] or [B, A] will both match)
//     participants: { $all: [payload.sender, payload.receiver] },
//   }).populate(['participants']);

//   if (!alreadyExists) {
//     const chatList = await Chat.create({
//       participants: [payload.sender, payload.receiver],
//     });

//     payload.chat = chatList?._id;
//   } else {
//     payload.chat = alreadyExists?._id;
//   }

//   const result = await Message.create(payload);

//   if (!result) {
//     callbackFn(callback, {
//       statusCode: httpStatus.BAD_REQUEST,
//       success: false,
//       message: 'Message sent failed',
//     });
//   }

//   const senderMessage = 'new-message::' + result.chat.toString();

//   io.emit(senderMessage, result);

//   // //----------------------ChatList------------------------//
//   const ChatListSender = await chatService.getMyChatList(
//     result?.sender.toString(),
//   );
//   const senderChat = 'chat-list::' + result.sender.toString();
//   io.emit(senderChat, ChatListSender);

//   const ChatListReceiver = await chatService.getMyChatList(
//     result?.receiver.toString(),
//   );

//   const receiverChat = 'chat-list::' + result.receiver.toString();

//   io.emit(receiverChat, ChatListReceiver);

//   // Notification
//   const allUnReaddMessage = await Message.countDocuments({
//     receiver: result.sender,
//     seen: false,
//   });
//   const variable = 'new-notifications::' + result.sender;
//   io.emit(variable, allUnReaddMessage);
//   const allUnReaddMessage2 = await Message.countDocuments({
//     receiver: result.receiver,
//     seen: false,
//   });
//   const variable2 = 'new-notifications::' + result.receiver;
//   io.emit(variable2, allUnReaddMessage2);

//   //end Notification//
//   callbackFn(callback, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Message sent successfully!',
//     data: result,
//   });
// });
// ================== send message functionlity end ========================
