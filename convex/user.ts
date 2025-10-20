import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const checkUser = query({
    args : {
        email : v.string()
    },
    handler : async(ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique()

        return user ? true : false
    }
})

export const getUserById = query({
    args : {
        id : v.id("users")
    },
    handler : async(ctx, args) => {
        const checkUser = await ctx.db.get(args.id)

        return checkUser || null;
    }
})

export const getUserByEmail = query({
    args : {
        email : v.string()
    },
    handler : async(ctx, args) => {
        const checkUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique()

        return checkUser || null;
    }
})

export const createUser = mutation({
    args : {
        name : v.string(),
        email : v.string(),
    },
    handler : async(ctx, args) => {

        const isAlreadyUser = await ctx.runQuery(api.user.checkUser, {email : args.email })
        if(isAlreadyUser) return null;

        const newUser = await ctx.db.insert("users", {
            name : args.name,
            email : args.email,
        })

        return newUser
    }
})

export const checkPhone = query({
    args : {
        id : v.id("users")
    },
    handler : async(ctx, args) => {
        const user = await ctx.db.get(args.id)
        return user?.phone == null
    }
})

export const updatePhoneNumber = mutation({
    args : {
        id : v.id("users"),
        phone : v.string()
    },
    handler : async(ctx, args) => {
        await ctx.db.patch(args.id, {
            phone : args.phone
        })
    }
})