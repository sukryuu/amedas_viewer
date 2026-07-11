import { NextResponse } from "next/server";
import {
    fetchLatestTimeString,
    fetchAmedasData,
    fetchAmedasStations,
    mergeAmedasData
} from "@/lib/amedas";

export async function GET() {
    try {
        const time = await fetchLatestTimeString();

        const [
            stations,
            obervations
        ] = await Promise.all([
            fetchAmedasStations(),
            fetchAmedasData(time)
        ]);

        const rows = mergeAmedasData(
            stations,
            obervations
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