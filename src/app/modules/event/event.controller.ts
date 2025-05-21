import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { storeFiles } from '../../utils/fileHelper';
import { eventService } from './event.service';

const createEvent = catchAsync(async (req: Request, res: Response) => {
    console.log('====== req files data ======', req.files);
    console.log('====== req users data ======', req.user);
  
    try {
      // Check if there are uploaded files
      let filePaths: { [fieldName: string]: string[] } = {};
      if (req.files) {
        filePaths = storeFiles('event', req.files as { [fieldName: string]: Express.Multer.File[] });
      }
  
      console.log('==== file paths =====', filePaths);
  
      // Process and assign uploaded files to `req.body`
      req.body.bannerImage = filePaths.bannerImage ? filePaths.bannerImage[0] : undefined;
      req.body.descriptionImage = filePaths.descriptionImage ? filePaths.descriptionImage[0] : undefined;

      console.log('raw coHosts:', req.body.coHosts); // Log raw coHosts string
      try {
        // const parsedCoHosts = JSON.parse(req.body.coHosts);
        const parsedCoHosts = req.body.coHosts;
        console.log('parsed coHosts:', parsedCoHosts); // Log parsed coHosts
    
        req.body.coHosts = parsedCoHosts.map((coHost: any, index: number) => {
          coHost.image = filePaths.coHostImages ? filePaths.coHostImages[index] : null;
          return coHost;
        });
      } catch (error) {
        console.error('Error parsing coHosts:', error); // Log any JSON parse errors
      }
  
      // // Handle coHosts (parse JSON if necessary)
      // if (req.body.coHosts) {
      //   req.body.coHosts = JSON.parse(req.body.coHosts).map((coHost: any, index: number) => {
      //     coHost.image = filePaths.coHostImages ? filePaths.coHostImages[index] : null;
      //     return coHost;
      //   });
      // }


      req.body.createdBy = req.user.userId;
  
      console.log('body data =>>> ', req.body);
  
    //   // Pass the processed data to the service layer
      const result = await eventService.createEvent(req.body);
  
      // Send success response
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Event created successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error processing event creation:', error.message);
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to process event creation',
        data: null,
      });
    }
  });

const getNearestEvents = catchAsync(async (req: Request, res: Response) => {

    const { userId } = req.user;
    // Destructure lat and long from query parameters
    const { lat, long } = req.query;
  
    // Prepare data with latitude and longitude
    const data: { latitude?: number, longitude?: number } = {};
  
    // If lat and long are provided, convert them to numbers and assign to data
    // if (lat && long) {
    //   data.latitude = parseFloat(lat as string);
    //   data.longitude = parseFloat(long as string);
    // }
  
    const result = await eventService.getNearestEvents(userId, data);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Events fetched successfully`,
      data: result,
    });
  });

const getUpcomingEventsForUser = catchAsync(async (req: Request, res: Response) => {

    const { userId } = req.user;
  
    const result = await eventService.getUpcomingEventsForUser(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Events fetched successfully`,
      data: result,
    });
  });

const getFeatureEventsForUser = catchAsync(async (req: Request, res: Response) => {

  const { userId } = req.user;

  const result = await eventService.getFeatureEventsForUser(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Events fetched successfully`,
    data: result,
  });
});

const getMyCreatedEvents = catchAsync(async (req: Request, res: Response) => {

    const { userId } = req.user;
  
    const result = await eventService.getMyCreatedEvents(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: ` Your Events fetched successfully`,
      data: result,
    });
  });

const updateEvent = catchAsync(async (req: Request, res: Response) => {
    console.log('====== req users data ======', req.user);
  
    try {
      const {eventId} = req.params; // Extract event ID from route params
  
      // Check if there are uploaded files
      let filePaths: { [fieldName: string]: string[] } = {};
      if (req.files) {
        filePaths = storeFiles('events', req.files as { [fieldName: string]: Express.Multer.File[] });
      }
  
      console.log('==== file paths =====', filePaths);
  
      // Process and assign uploaded files to `req.body`
      if (filePaths.bannerImage) {
        req.body.bannerImage = filePaths.bannerImage[0];
      }
      if (filePaths.descriptionImage) {
        req.body.descriptionImage = filePaths.descriptionImage[0];
      }
  
      console.log('raw coHosts:', req.body.coHosts); // Log raw coHosts string
      try {
        // Parse coHosts if provided
        const parsedCoHosts = req.body.coHosts ? JSON.parse(req.body.coHosts) : [];
        console.log('parsed coHosts:', parsedCoHosts); // Log parsed coHosts
  
        req.body.coHosts = parsedCoHosts.map((coHost: any, index: number) => {
          coHost.image = filePaths.coHostImages ? filePaths.coHostImages[index] : coHost.image;
          return coHost;
        });
      } catch (error) {
        console.error('Error parsing coHosts:', error); // Log any JSON parse errors
      }
  
      console.log('body data =>>> ', req.body);
  
      // Pass the processed data to the service layer
      const result = await eventService.updateEvent(eventId, req.body);
  
      // Send success response
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event updated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error processing event update:', error.message);
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'Failed to process event update',
        data: null,
      });
    }
  });

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
    const events = await eventService.getAllEvents(req.query);
  
    console.log("===== all events === >>>>>>>> ", events)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Events fetched successfully!',
      data: events,
    });
  });

const getEventById = catchAsync(async (req: Request, res: Response) => {
  const {eventId} = req.params;

  // console.log("event id ===> ",{eventId})

  const event = await eventService.getEventById(eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event fetched successfully!',
    data: event,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const {eventId} = req.params;
  const {userId} = req.user;

  await eventService.deleteEvent(userId, eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event deleted successfully!',
    data: null,
  });
});




export const eventController = {
  createEvent,
  getNearestEvents,
  getUpcomingEventsForUser,
  getFeatureEventsForUser,
  getMyCreatedEvents,
  updateEvent,
  getAllEvents,
  getEventById,
  deleteEvent
};
