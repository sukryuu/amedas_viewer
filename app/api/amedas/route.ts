import { NextResponse } from "next/server";
import {
    fetchLatestTimeString,
    fetchAmedasData,
    fetchAmedasStations,
    mergeAmedasData
} from "@/lib/amedas";

const TEST_TIME = process.env.AMEDAS_TEST_TIME;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const time =
            searchParams.get("time")
            ?? TEST_TIME
            ?? await fetchLatestTimeString();

        const [
            stations,
            observations
        ] = await Promise.all([
            fetchAmedasStations(),
            fetchAmedasData(time)
        ]);

        const rows = mergeAmedasData(
            stations,
            observations
        );

        return NextResponse.json({
            time,
            rows
        });

    } catch (error) {
        console.error("Failed to fetch Amedas data", error);

        return NextResponse.json(
            { error: "Failed to fetch Amedas data" },
            { status: 500 }
        );
    }
}
