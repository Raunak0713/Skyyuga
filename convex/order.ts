import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
        userId : v.id("users"),
        contactNumber : v.string(),
    },
    handler : async(ctx, args) => {
        const order = await ctx.db.insert("orders", {
            products : args.products,
            totalCost : args.totalCost,
            paymentMethod : args.paymentMethod,
            referenceNumber : args.referenceNumber,
            name : args.name,
            userId : args.userId,
            email : args.email,
            contactNumber : args.contactNumber
        })

        return order
    }
})

export const getOrdersByEmail = query({
    args : {
        email : v.string()
    },
    handler : async(ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .filter((q) => q.eq(q.field("email"), args.email))
            .collect();
        return orders || []
    }
})