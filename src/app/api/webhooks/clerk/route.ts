import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { upsertUser, deleteUser } from "@/features/users/db";

export async function POST(request : NextRequest){
    
    try{
        const event = await verifyWebhook(request)

        switch(event.type){
            case "user.created":
                case "user.updated" : 
                const clerkData  = event.data
                const email = clerkData.email_addresses.find(e => e.id === 
                    clerkData.primary_email_address_id)?.email_address
                if(email == null){
                    return new Response("no primary email found", {status : 400})
                }

                await upsertUser({
                    id: clerkData.id,
                    name : `${clerkData.first_name} ${clerkData.last_name}`,
                    email,
                    imageUrl : clerkData.image_url,
                    createdAt : new Date(clerkData.created_at),
                    updatedAt : new Date(clerkData.updated_at)
                })
                break
            case "user.deleted":
                if (event.data.id == null) {
                    return new Response("No user ID found", { status: 400 })
                }

                await deleteUser(event.data.id)
                break;
        }
    }catch(e){
        return new Response("invalid webhook", {
            status : 400
        })
    }

    return new  
    Response("webhook recieved", {status : 200 });
    
}
