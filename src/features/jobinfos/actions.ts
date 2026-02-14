"use server"

import z from "zod";
import { jobInfoSchema } from "./schemas";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation"
import { insertJobInfo , updateJobInfo as updateJobInfoDb} from "./db";
import { cacheTag, revalidateTag } from "next/cache";
import { getJobInfoIdTag } from "./dbCache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobInfoTable } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";

export async function createJobInfo(unsafeData : z.infer<typeof jobInfoSchema>){
    const {userId} = await getCurrentUser();
    if(userId == null){
        return {
            error : true,
            message : "you dont have the permision to do this"
        }
    }

    const {success, data} = jobInfoSchema.safeParse(unsafeData);
    if(!success){
        return {
            error :true,
            message : "invalid job data"
        }
    }


    const jobInfo = await insertJobInfo({...data, userId});

    revalidateTag(getJobInfoIdTag(jobInfo.id), "max")

    redirect(`/app/job-infos/${jobInfo.id}`)
}

export async function updateJobInfo(id : string ,unsafeData : z.infer<typeof jobInfoSchema>){
    const {userId} = await getCurrentUser();
    if(userId == null){
        return {
            error : true,
            message : "you dont have the permision to do this"
        }
    }

    const {success, data} = jobInfoSchema.safeParse(unsafeData);
    if(!success){
        return {
            error :true,
            message : "invalid job data"
        }
    }

    const existingJobInfo = await  getJobInfo(id, userId);
    if(existingJobInfo == null){
        return {
            error : true,
            message : "you dont have the permision to do this"
        }
    }

    const jobInfo = await updateJobInfoDb(id , data);

    redirect(`/app/job-infos/${jobInfo.id}`)
}


async function getJobInfo(id: string, userId: string) {
//   "use cache"
//   cacheTag (getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}

