"use client"

import { Button } from "@/components/ui/button";
import { env } from "@/data/env/client";
import { JobInfoTable, UserTable } from "@/drizzle/schema"
import {
  useVoice,
  ConnectOptions,
  VoiceReadyState
} from "@humeai/voice-react";
import { Loader2Icon } from "lucide-react";


export function StartCall({
    jobInfo,
    user,
    accessToken
} : {
    accessToken : string,
    jobInfo : Pick< typeof JobInfoTable.$inferSelect,
     "id" | "title" | "description" | "experienceLevel">,
    user : {
        name : string,
        imageUrl : string
    }

}){
    const { connect, disconnect, readyState } = useVoice();

    if(readyState === VoiceReadyState.IDLE){
        return (
            <div className="flex justify-center items-center h-screen-header">
                <Button size="lg" onClick={async () => {

                    // TODO create interview
                    connect({
                        auth : {type: "accessToken" , value : accessToken},
                        configId : env.NEXT_PUBLIC_HUME_CONFIG_ID,
                        sessionSettings : {
                            type:"session_settings",
                            variables : {
                                userName : user.name,
                                title : jobInfo.title || "Not specified",
                                description : jobInfo.description,
                                experienceLevel : jobInfo.experienceLevel
                            }
                        }
                    })
                }}>
                    Start Interview
                </Button>
            </div>
        )
    }

    if(readyState === VoiceReadyState.CONNECTING ||
        VoiceReadyState.CLOSED
    ){
        return (
            <div className="h-screen-header flex items-center justify-center">
                <Loader2Icon className="animate-spin size-24">

                </Loader2Icon>
            </div>
        )
    }
    return (
            <div className="overflow-y-auto h-screen-header flex flex-col-reverse">
                <div className="container py-4 flex flex-col items-center justify-end">

                </div>
            </div>
        )
}