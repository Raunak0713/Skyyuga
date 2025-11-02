import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req : NextRequest){
    try {
        const body = await req.json();
        const { title, description, imageUrl, cost, category } = body;

        await fetchMutation(api.product.createProducts, {
            title, 
            description,
            imageUrl,
            cost,
            category
        })

        return NextResponse.json(
            { 
                success : true, 
                message : "Product Created Successfully"
            },
            { status : 201 }
        )

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { 
                success : false,
                message : "Error Creating Product"
            },
            { status : 400 }
        )
    }
}