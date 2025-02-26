import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { subscriptionService } from "./subscription.service";



// add a new Subscription
const addSubscription = catchAsync(async (req: Request, res: Response) => {

    const {userId, role} = req.user;

    if (role !== "admin") {
        sendResponse(res, {
            statusCode: 401,
            success: false,
            message: "Unauthoraized. you can not create subscription.",
            data: "result",
        });
      }
    
    req.body.created = userId;

    console.log("===== req body ====> >>>> ", req.body)

    const newSubscription = await subscriptionService.addSubscription(req.body)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Subscription created successfully",
        data: newSubscription
    });
});

const updateSubscription = catchAsync( async (req: Request, res: Response) => {
    const {subId} = req.params;

    const {created, isDeleted, ...rest} = req.body;

    const result = await subscriptionService.updateSubscription(subId, rest);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Subscription updated successfully",
        data: result
    });
})

const deleteSubscription = catchAsync( async (req: Request, res: Response) => {
    const {subId} = req.params;

    const result = await subscriptionService.deleteSubscription(subId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Subscription deleted successfully",
        data: null
    });
})


// get all Subscription
const getAllSubscription = catchAsync(async (req: Request, res: Response) => {

    const result = await subscriptionService.getAllSubscription()

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Subscription retrived successfully",
        data: result
    });
});


export const subscriptionController = {
    addSubscription,
    getAllSubscription,
    updateSubscription,
    deleteSubscription
}
