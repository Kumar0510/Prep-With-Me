import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { getInterviewJobInfoTag } from "@/features/interviews/dbCache";
import { JobInfoBackLink } from "@/features/jobinfos/components/JobInfoBackLink"
import { getJobInfoIdTag } from "@/features/jobinfos/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function({params} : {
    params : Promise< {jobInfoId : string }>
}){

    const {jobInfoId} = await params;

    return (
        <div className="container py-4 max-w-5xl  gap-4 h-screen-header flex flex-col items-start">

            <JobInfoBackLink jobInfoId = {jobInfoId} />
           
            <Suspense fallback={
                    <Loader2Icon className="size-24 animate-spin m-auto" />
                }>
                <SuspendedPage jobInfoId={jobInfoId}/>

            </Suspense>
        </div>
    )
}

async function SuspendedPage ({jobInfoId} : {jobInfoId : string}){
    const {userId, redirectToSignIn} = await getCurrentUser();

    if (userId == null) return redirectToSignIn();

    const interviews = await getInterviews(jobInfoId, userId)
    if(interviews.length == 0){
        return (
            redirect(`/app/job-infos/${jobInfoId}/interviews/new`)
        )
    }

    await new Promise(resolve => setTimeout(resolve, 3000))

    return <div>osfjoldfn</div>
}

async function getInterviews(jobInfoId : string, userId : string){
    "use cache"
    cacheTag(getInterviewJobInfoTag(jobInfoId));
    cacheTag(getJobInfoIdTag(jobInfoId));

    const data = await db.query.InterviewTable.findMany({
        where : and (eq (InterviewTable.jobInfoId, jobInfoId), 
            isNotNull(InterviewTable.humeChatId)),
            with : {jobInfo : {columns : {userId : true}}},
        orderBy : desc(InterviewTable.updatedAt)
    })

    return data.filter(interview => interview.jobInfo.userId === userId)
}