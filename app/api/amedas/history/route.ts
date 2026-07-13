import { NextResponse } from "next/server";
import { fetchAmedasHistory } from "@/lib/amedas";


export async function GET(request: Request) {

    const { searchParams } =
        new URL(request.url);


    const id =
        searchParams.get("id");

    const time =
        searchParams.get("time");


    if (!id || !time) {
        return NextResponse.json(
            {error:"missing parameter"},
            {status:400}
        );
    }


    try {

        const data =
            await fetchAmedasHistory(
                id,
                time
            );


        return NextResponse.json(data);

    } catch(error){

        console.error(error);

        return NextResponse.json(
            {error:"failed"},
            {status:500}
        );
    }
}