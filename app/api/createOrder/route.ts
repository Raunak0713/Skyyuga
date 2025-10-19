import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest){
    try {
        const body = await req.json()
        const { products, totalCost, paymentMethod, referenceNumber,name, email, contactNumber } = body;
        console.log("API Create Order")
        console.log({products, totalCost, paymentMethod, referenceNumber,name, email, contactNumber })

        const order = await fetchMutation(api.order.createOrder, {
            products,
            totalCost,
            paymentMethod,
            referenceNumber,
            name,
            email,
            contactNumber
        })

        return NextResponse.json(
            {
                success : true,
                message : order
            },
            {
                status : 201
            }
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                success : false,
                message : "Error Creating Order"
            },
            {
                status : 400
            }
        )
    }
    
}