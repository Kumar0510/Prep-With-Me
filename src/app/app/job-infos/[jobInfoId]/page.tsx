import { BackLink } from "@/components/BackLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SuspendedItem } from "@/components/SuspendedItem";
import { db } from "@/drizzle/db";
import { JobInfoTable, UserTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobinfos/dbCache";
import { formatExperienceLevel } from "@/features/jobinfos/lib/formatters";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";

import { and, eq } from "drizzle-orm";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/cache";

import Link from "next/link";
import { notFound } from "next/navigation";
import { fi } from "zod/v4/locales";
import { Skeleton } from "@/components/Skeleton";

const options= [
    {
        label : "Answer Technical Questions",
        description : "Take a Challenge with practice questions",
        href : "questions"
    },
    {
        label : "Practice Interview",
        description : "Simulate a real interview with AI-powered mock Interviews",
        href : "interviews"
    },
    {
        label : "Refine Resume",
        description : "Get AI-powered Feedback for your resume",
        href : "resume"
    },
    {
        label : "Update Job Description",
        description : "redefine minor updates job description",
        href : "edit"
    }
]

export default async function JobInfoPage({params} : {
    params : Promise<{jobInfoId : string}>
}){
    const {jobInfoId } = await params;
    
    const jobInfo = getCurrentUser().then(async ({userId, redirectToSignIn}) =>  {
        if(userId == null) return redirectToSignIn() 

        const jobInfo = await getJobInfo(jobInfoId, userId)

        if(jobInfo == null) return notFound()

        return jobInfo
    })


    return (
        <div className="container my-4 space-y-4">
            <BackLink href="/app">Dashboard</BackLink>

        <div className="space-y-6">

            <header className="space-y-4">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl">
                        <SuspendedItem 
                            item = {jobInfo}
                            fallback = {
                                <Skeleton className="w-48" />
                            }
                            result = {j => j.name} 
                        />
                    </h1>
                    <div className="flex gap-2">
                        <SuspendedItem 
                            item = {jobInfo}
                            fallback = {
                                <Skeleton className="w-12" />
                            }
                            result = {j => (
                                 <Badge variant="secondary">
                                    {formatExperienceLevel(j.experienceLevel)}
                                </Badge>
                            )} 
                        />
                       
                        <SuspendedItem 
                            item = {jobInfo}
                            fallback = {
                                null
                            }
                            result = {j => {
                               return j.title && <Badge variant="secondary">{j.title}</Badge>
                            }} 
                        />
                    </div>
                </div>

                <SuspendedItem 
                    item = {jobInfo}
                    fallback = {
                        <Skeleton className="w-90" />
                    }
                    result = {j => (
                        <p className="text-muted-foreground line-clamp-3">{j.description}</p>
                    )} 
                />

                
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 
                    has-hover:*:not-hover:opacity-70">
                {
                    options.map((option) => (
                    <Link className="hover:scale-[1.02] transition-[transform_opacity]" 
                        href=  {`/app/job-infos/${jobInfoId}/${option.href}`}
                        key = {option.href}>
                        <Card className="h-full flex items-start justify-between flex-row">
                        <CardHeader className="flex-grow" >
                            <CardTitle >
                                {option.label}
                            </CardTitle>
                            <CardDescription className="">{option.description}</CardDescription>
                                                    
                            </CardHeader>
                                            
                            <CardContent>
                                <ArrowRightIcon className="size-6"></ArrowRightIcon>
                            </CardContent>
                                        
                        </Card>
                        </Link>
                     )
                    )
                    }
        </div>
        </div>
        </div>
    )
}

async function getJobInfo(id :string, userId  :string ){
    "use cache"
    cacheTag(getJobInfoIdTag(id))


    return db.query.JobInfoTable.findFirst({
        where : and( eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId))
    })
}