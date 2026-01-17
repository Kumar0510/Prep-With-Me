import { BackLink } from "@/components/BackLink";
import { Card, CardContent } from "@/components/ui/card";
import { JobInfoForm } from "@/features/jobinfos/components/JobInfoForm";

export default  function JobInfoNewPage(){
    return (
        <div className="container my-4 max-w-5xl  space-y-4">

            <BackLink href="/app">Dashboard</BackLink>           
            <h1 className="text-3xl md:text-4xl"> 
                create a new Job description
            </h1>

        <Card>
            <CardContent>
                <JobInfoForm>
                    
                </JobInfoForm>
            </CardContent>
        </Card>
        </div>
    )
}