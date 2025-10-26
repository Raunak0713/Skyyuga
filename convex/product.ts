import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProductById = query({
    args : {
        id : v.id("products")
    },
    handler : async(ctx, args) => {
        return ctx.db.get(args.id)
    }
})

export const getAllProducts = query({
    args : {},
    handler : async(ctx) => {
        const products = await ctx.db.query("products")
        .collect()
        return products
    },
})

export const createProducts = mutation({
    args : {
        title : v.string(),
        description : v.string(),
        imageUrl : v.string(),
        cost : v.number(),
        category : v.string(),
    },
    handler : async(ctx, args) => {
        const product = await ctx.db.insert("products", {
            title : args.title,
            description : args.description,
            imageUrl : args.imageUrl,
            cost : args.cost,
            category : args.category
        })

        return product;
    }
})