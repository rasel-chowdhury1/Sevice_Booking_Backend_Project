import { ObjectId } from "mongoose";


export interface ISubscriptionPayment {
    paymentId: string,
    amount: number,
    user: ObjectId,
    subscription: ObjectId,
    paymentType: "Card" | "Paypal" | "Bank"
}