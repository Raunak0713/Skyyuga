import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { paymentValidator } from "./schema";

export const createOrder = mutation({
    args : {
        products : v.array(
            v.object({
                productId : v.id("products"),
                quantity : v.number()
            })
        ),
        totalCost : v.number(),
        paymentMethod : paymentValidator,
        referenceNumber : v.number(),
        name : v.string(),
        email : v.string(),
        contactNumber : v.string(),
    },
    handler : async(ctx, args) => {
        const order = await ctx.db.insert("orders", {
            products : args.products,
            totalCost : args.totalCost,
            paymentMethod : args.paymentMethod,
            referenceNumber : args.referenceNumber,
            name : args.name,
            email : args.email,
            contactNumber : args.contactNumber
        })

        return order
    }
})