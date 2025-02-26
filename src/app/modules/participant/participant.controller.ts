import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { participantService } from "./participant.service";
import catchAsync from "../../utils/catchAsync";

// Register a new participant
const registerParticipant = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.user;
    const {eventId} = req.body;
        const result = await participantService.registerParticipant(userId, eventId);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Participant registered successfully",
            data: result,
        });
});

// Get participants by event ID
const getParticipantsByEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const result = await participantService.getParticipantsByEvent(eventId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Participants retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error fetching participants:", error.message);
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to retrieve participants",
            data: null,
        });
    }
};

// Update participant status
const updateParticipantStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await participantService.updateParticipantStatus(id, status);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Participant status updated successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Error updating participant status:", error.message);
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to update participant status",
            data: null,
        });
    }
};

// Delete a participant
const deleteParticipant = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await participantService.deleteParticipant(id);
        res.status(204).send();
    } catch (error: any) {
        console.error("Error deleting participant:", error.message);
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to delete participant",
            data: null,
        });
    }
};

export const participantController = {
    registerParticipant,
    getParticipantsByEvent,
    updateParticipantStatus,
    deleteParticipant
};
