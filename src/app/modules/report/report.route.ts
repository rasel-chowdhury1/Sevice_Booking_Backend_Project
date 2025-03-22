

import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { reportsController } from "./report.controller";

export const reportRoutes = Router();

// Route to register a participant
reportRoutes.post("/create", 
    auth(
       USER_ROLE.ADMIN, 
       USER_ROLE.GUIDE,
       USER_ROLE.SEEKER
    ),
    reportsController.createReport
);

reportRoutes.post("/warn/:id",
    auth(USER_ROLE.ADMIN),
    reportsController.warnedUserByAdmin
)

reportRoutes.patch("/ban/:id",
    auth(USER_ROLE.ADMIN),
    reportsController.banUserByAdmin
)

// Route to get participants by event ID
reportRoutes.get("/allReport", reportsController.getAllReports);