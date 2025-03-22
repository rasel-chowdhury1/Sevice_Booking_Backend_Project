import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { withdrawRequestController } from "./withdrawRequest.controller";

export const withdrawRequestRoutes = Router();

withdrawRequestRoutes
// Route to add a new withdraw request
.post(
    "/",
    auth(USER_ROLE.GUIDE,USER_ROLE.SEEKER),
     withdrawRequestController.addNewWithdrawRequests)

// Route to edit the withdraw request
.patch(
    "/:id",
    auth(USER_ROLE.ADMIN),
    withdrawRequestController.editWithdrawRequests)

// Route to get all withdraw requests
.get("/",
     auth(USER_ROLE.ADMIN),
withdrawRequestController.getAllWithdrawRequests)

.get("/myWithdraw", 
    auth(USER_ROLE.GUIDE, USER_ROLE.SEEKER),
    withdrawRequestController.getSpeceifcUserWithdrawRequests
)
