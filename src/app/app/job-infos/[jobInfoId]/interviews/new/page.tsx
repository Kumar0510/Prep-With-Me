import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobinfos/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react"
import { cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react"
import {fetchAccessToken} from "hume"
import { env } from "@/data/env/server";
import { VoiceProvider } from "@humeai/voice-react";
import { StartCall } from "./_StartCall";
import { canCreateInterview } from "@/features/interviews/permissions";


export default async function NewInterviewPage({params} : {
    params : Promise< {jobInfoId : string }>
}){

    const {jobInfoId} = await params;
    return (
        <Suspense fallback={
            <div className="h-screen-header flex items-center justify-center">
                <Loader2Icon className="animate-spin size-24">

                </Loader2Icon>
            </div>
        }>
            <SuspendedComponent jobInfoId = {jobInfoId}></SuspendedComponent>

        </Suspense>
    )
}

async function SuspendedComponent({jobInfoId} :{jobInfoId : string}){
    const {userId, redirectToSignIn , user } = await getCurrentUser({allData : true});

    if(userId == null || user == null){
        redirectToSignIn();

        // possiblity to remove this code
        return null;
    } 

    if(!(await canCreateInterview())){
        return redirect("/app/upgrade")
    }

    const jobInfo = await getJobInfo(jobInfoId, userId);

    if(jobInfo == null) return notFound();

    const accessToken = await fetchAccessToken({
        apiKey: env.HUME_API_KEY,
        secretKey: env.HUME_SECRET_KEY,
    });
    return (
        <VoiceProvider>
            <StartCall jobInfo={jobInfo} user={user} accessToken={accessToken} />
        </VoiceProvider>
    )
}

async function getJobInfo(
    jobInfoId : string,
    userId : string
){
    "use cache"
    cacheTag(getJobInfoIdTag(jobInfoId))
    
    return await db.query.JobInfoTable.findFirst({
        where : and (eq(JobInfoTable.id , jobInfoId) , eq (JobInfoTable.userId , userId) )
    })
}