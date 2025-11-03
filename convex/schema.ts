import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const paymentValidator = v.union(
    v.literal("UPI"),
    v.literal("Bank Transfer")
)

export const orderStatusValidator = v.union(
    v.literal("PENDING"),
    v.literal("ACCEPTED"),
    v.literal("REJECTED"),
    v.literal("DELIVERING"),
    v.literal("DELIVERED")
)

export default defineSchema({
    users : defineTable({
        name : v.string(),
        email : v.string(),
    phone : v.optional(v.string())
    }),

    products : defineTable({
        title : v.string(),
        description : v.string(),
        imageUrl : v.array(v.string()),
        cost : v.number(),
        category : v.string(),
        tyreSize : v.optional(v.string()),
        tyreModel : v.optional(v.array(v.string()))
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
        address  :v.string(),
        email : v.string(),
        status : orderStatusValidator,
        contactNumber : v.string(),
    })
})


