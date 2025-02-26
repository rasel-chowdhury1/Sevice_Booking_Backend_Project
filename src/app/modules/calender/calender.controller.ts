import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { calendarService } from "./calender.service";

// Create a new calendar entry
const createCalendarEvent = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { event_id } = req.body;
    const result = await calendarService.createCalendarEvent(userId, event_id);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Calendar entry created successfully",
        data: result,
    });
});

// Get all calendar entries for a user
const getCalendarEventByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const result = await calendarService.getCalendarEventByUser(userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Calendar entries retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error fetching calendar entries:", error.message);
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to retrieve calendar entries",
            data: null,
        });
    }
};

// Update calendar entry
const updateCalendarEventStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isDeleted } = req.body;
        const result = await calendarService.updateCalendarEventStatus(id, isDeleted);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Calendar event updated successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error updating calendar entry:", error.message);
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to update calendar event",
            data: null,
        });
    }
};

// Delete (soft delete) calendar entry
const deleteCalendarEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await calendarService.deleteCalendarEvent(id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Calendar entry deleted successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error deleting calendar entry:", error.message);
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to delete calendar entry",
            data: null,
        });
    }
};

// Get calendar entries by event ID
const getCalendarEventByEventId = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const result = await calendarService.getCalendarEventByEventId(eventId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Calendar entries for event retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error fetching calendar entries by event ID:", error.message);
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to retrieve calendar entries by event ID",
            data: null,
        });
    }
};

export const calendarController = {
    createCalendarEvent,
    getCalendarEventByUserId,
    updateCalendarEventStatus,
    deleteCalendarEvent,
    getCalendarEventByEventId
};
