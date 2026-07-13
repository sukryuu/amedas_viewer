import { NextResponse } from "next/server";
import { fetchAmedasPoint } from "@/lib/amedas";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const id = searchParams.get("id");
        const time = searchParams.get("time");

        if (!id || !time) {
            return NextResponse.json(
                { error: "missing parameter" },
                { status: 400 }
            );
        }

        const data = await fetchAmedasPoint(id, time);

        console.log("POINT DATA", data);
        return NextResponse.json(data);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: String(error)
            },
            {
                status: 500
            }
        );
    }
}