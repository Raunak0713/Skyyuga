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
        const products = await ctx.db.query("products").collect()
        return products
    },
})

export const createProducts = mutation({
    args : {
        title : v.string(),
        description : v.string(),
        imageUrl : v.array(v.string()),
        cost : v.number(),
        category : v.string(),
        tyreSize : v.optional(v.string()),
        tyreModel : v.optional(v.array(v.string()))
    },
    handler : async(ctx, args) => {
        const product = await ctx.db.insert("products", {
            title : args.title,
            description : args.description,
            imageUrl : args.imageUrl,
            cost : args.cost,
            category : args.category,
            tyreModel : args.tyreModel,
            tyreSize : args.tyreSize
        })

        return product;
    }
})

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.array(v.string())),
    cost: v.optional(v.number()),
    category: v.optional(v.string()),
    tyreModel: v.optional(v.array(v.string())),
    tyreSize: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    await ctx.db.patch(args.productId, {
      title: args.title ?? product.title,
      description: args.description ?? product.description,
      imageUrl: args.imageUrl ?? product.imageUrl,
      cost: args.cost ?? product.cost,
      category: args.category ?? product.category,
      tyreModel: args.tyreModel ?? product.tyreModel,
      tyreSize: args.tyreSize ?? product.tyreSize
    });
  },
});

export const deleteProduct = mutation({
    args : {
        productId : v.id("products")
    },
    handler : async(ctx, args) => {
        await ctx.db.delete(args.productId)
    }
})

export const getAllTyres = query({
    args : {
        model : v.optional(v.string()),
        size : v.optional(v.string())
    },
    handler : async(ctx, args) => {
        let allTyres = await ctx.db
            .query("products")
            .filter((q) => q.eq(q.field("category"), "Tyres"))
            .collect()
    
        if(args.model != null && args.model != undefined){
            allTyres = allTyres.filter((t) => t.tyreModel?.includes(args.model!))
        }

        if(args.size != null && args.size != undefined){
            allTyres = allTyres.filter((t) => t.tyreSize === args.size)
        }

        const uniqueSizes = [...new Set(allTyres.map((t) => t.tyreSize).filter(Boolean))];

        const uniqueModels = [...new Set(allTyres.flatMap((t) => t.tyreModel ?? []))];

        return { tyres : allTyres, uniqueSizes, uniqueModels}
    }
})
