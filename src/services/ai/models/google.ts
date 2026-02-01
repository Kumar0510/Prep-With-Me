import { env } from "@/data/env/server"
import  {createGoogleGenerativeAI} from "@ai-sdk/google"

export const google = await createGoogleGenerativeAI({
    apiKey : env.GOOGLE_API_KEY
})