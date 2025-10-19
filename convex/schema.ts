import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const paymentValidator = v.union(
    v.literal("UPI"),
    v.literal("Bank Transfer")
)

export default defineSchema({
    users : defineTable({
        name : v.string(),
        email : v.string(),
    }),

    products : defineTable({
        title : v.string(),
        description : v.string(),
        imageUrl : v.string(),
        cost : v.number(),
        category : v.string(),
    }),

    orders : defineTable({
        products : v.array(
            v.object({
                productId : v.id("products"),
                quantity : v.number()
            })
        ),
        totalCost : v.number(),
        userId : v.id("users"),
        paymentMethod : paymentValidator,
        referenceNumber : v.number(),
        name : v.string(),
        email : v.string(),
        contactNumber : v.string(),
    })
})