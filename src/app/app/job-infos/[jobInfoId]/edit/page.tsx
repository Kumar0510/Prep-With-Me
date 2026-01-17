import { BackLink } from "@/components/BackLink";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { JobInfoBackLink } from "@/features/jobinfos/components/JobInfoBackLink";
import { JobInfoForm } from "@/features/jobinfos/components/JobInfoForm";
import { getJobInfoIdTag } from "@/features/jobinfos/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async  function JobInfoNewPage({params} : {
    params : Promise<{jobInfoId : string}>
}){

    const {jobInfoId} = await params
    return (
        <div className="container my-4 max-w-5xl  space-y-4">

            <JobInfoBackLink jobInfoId = {jobInfoId} />

            <h1 className="text-3xl md:text-4xl"> 
                Edit Job description
            </h1>

            <Card>
                <CardContent>
                    <Suspense fallback={
                        <Loader2Icon className="size-24 animate-spin mx-auto" />
                    }>
                        <SuspendedForm jobInfoId={jobInfoId}/>

                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function SuspendedForm ({jobInfoId} : {jobInfoId : string}){
    const {userId, redirectToSignIn} = await getCurrentUser()

    if (userId == null) return redirectToSignIn();

    const jobInfo = await getJobInfo (jobInfoId, userId)

    if(jobInfo == null) return notFound()

    return <JobInfoForm jobInfo={jobInfo} />
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