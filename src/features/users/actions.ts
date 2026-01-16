"use server"

import { cacheTag } from "next/cache"

export async function getUser({userId} : {userId :any}){
    "use cache"
    cacheTag()
}