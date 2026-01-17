import { ReactNode, Suspense } from "react";

export function SuspendedItem<T>({
    item,
    fallback,
    result
} : {
    item : Promise<T>,
    fallback : ReactNode,
    result : (item : T) => ReactNode
}) {
    return <Suspense fallback={fallback}>
        <InnerComponent item = {item} result= {result} >

        </InnerComponent>
    </Suspense>
}

async function InnerComponent<T>({
    item,
    result 
}:{
    item : Promise<T>,
    result : (item : T) => ReactNode
}){
    const resolvedItem = await item;
    return result( resolvedItem) 
}