import { BackLink } from "@/components/BackLink";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { getJobInfoIdTag } from "../dbCache";
import { cacheTag } from "next/cache";

export function JobInfoBackLink({
    jobInfoId,
    className
} : {
    jobInfoId : string,
    className?: string
}){
    return (
        <BackLink href= {`/app/job-infos/${jobInfoId}`} 
        className= {cn("mb-4", className)}
        >
            <Suspense fallback="Job Description" >
                <JobName jobInfoId={jobInfoId} />
            </Suspense>
        </BackLink>
    )
}

async function JobName({jobInfoId} : {
    jobInfoId : string
}){
    const jobInfo = await getJobInfo(jobInfoId)
    
    return jobInfo?.name ?? "Job Description"
}

async function getJobInfo(jobInfoId : string){
    "use cache"
    cacheTag(getJobInfoIdTag(jobInfoId));

    return db.query.JobInfoTable.findFirst({
        where : eq(JobInfoTable.id, jobInfoId)
    })
}