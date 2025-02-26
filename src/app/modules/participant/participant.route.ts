import express from "express";
import { participantController } from "./participant.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";

const router = express.Router();

// Route to register a participant
router.post("/create", 
    auth(
       USER_ROLE.ADMIN, 
       USER_ROLE.GUIDE,
       USER_ROLE.SEEKER
    ),
    participantController.registerParticipant
);

// Route to get participants by event ID
router.get("/event/:eventId", participantController.getParticipantsByEvent);

// Route to update participant status
router.patch("/:id/status", participantController.updateParticipantStatus);

// Route to remove a participant
router.delete("/:id", participantController.deleteParticipant);

export const participantRoutes = router;