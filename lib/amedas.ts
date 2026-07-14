import { AmedasObservation, AmedasRow, AmedasStation } from "@/types/amedas";
import { prefectures } from "@/lib/prefectures";
import stationPrefMap from "@/lib/stationPrefMap.json";

console.log("amedas.ts loaded");

export const fetchLatestTimeString = async (): Promise<string> => {
    try {
        const response = await fetch('https://www.jma.go.jp/bosai/amedas/data/latest_time.txt')

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const latestRaw = await response.text();
        return latestRaw
            .trim()
            .replace("T", "")
            .replace("+09:00", "")
            .replace(/[-:]/g, "");

    } catch (error) {
        console.error("Failed to fetch latest time", error);
        throw error;
    }
}

export const fetchAmedasData = async (
    timestamp: string
): Promise<Record<string, AmedasObservation>> => {

    const response = await fetch(
        `https://www.jma.go.jp/bosai/amedas/data/map/${timestamp}.json`
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

let stationsCache: Record<string, AmedasStation> | null = null;

export const fetchAmedasStations = async (): Promise<Record<string, AmedasStation>> => {

    if (stationsCache !== null) {
        return stationsCache;
    }

    const response = await fetch(
        "https://www.jma.go.jp/bosai/amedas/const/amedastable.json"
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Record<string, AmedasStation> = await response.json();

    stationsCache = data;

    return data;
};

export const mergeAmedasData = (
    stations: Record<string, AmedasStation>,
    observations: Record<string, AmedasObservation>
): AmedasRow[] => {
    return Object.entries(stations).map(([id, station]) => {
        const obs = observations[id];

        const prefNumber = stationPrefMap[id as keyof typeof stationPrefMap];

        const prefName =
            prefNumber != null
                ? prefectures[String(prefNumber)]
                : null;

        const displayName =
            prefName
                ? prefNumber < 30
                    ? `北海道 ${prefName} ${station.kjName}`
                    : `${prefName} ${station.kjName}`
                : station.kjName;

        return {
            id,
            name: displayName,
            prefecture: prefName,

            temp: obs?.temp?.[0] ?? null,
            humidity: obs?.humidity?.[0] ?? null,

            pressure: obs?.pressure?.[0] ?? null,
            normalPressure: obs?.normalPressure?.[0] ?? null,

            wind: obs?.wind?.[0] ?? null,
            windDirection: obs?.windDirection?.[0] ?? null,

            precipitation10m: obs?.precipitation10m?.[0] ?? null,
            precipitation1h: obs?.precipitation1h?.[0] ?? null,
            precipitation3h: obs?.precipitation3h?.[0] ?? null,
            precipitation24h: obs?.precipitation24h?.[0] ?? null,

            snow: obs?.snow?.[0] ?? null,
            snow1h: obs?.snow1h?.[0] ?? null,
            snow6h: obs?.snow6h?.[0] ?? null,
            snow12h: obs?.snow12h?.[0] ?? null,
            snow24h: obs?.snow24h?.[0] ?? null,

            sun10m: obs?.sun10m?.[0] ?? null,
            sun1h: obs?.sun1h?.[0] ?? null,

            visibility: obs?.visibility?.[0] ?? null,
            weather: obs?.weather?.[0] ?? null,
        };
    });
};

export async function fetchAmedasPoint(
    id: string,
    time: string
) {
    const target = new Date(
        Number(time.slice(0, 4)),
        Number(time.slice(4, 6)) - 1,
        Number(time.slice(6, 8)),
        Number(time.slice(8, 10))
    );

    for (let i = 0; i < 12; i++) {
        const candidate = new Date(target);
        candidate.setHours(candidate.getHours() - i);

        const fileTime =
            `${candidate.getFullYear()}${String(candidate.getMonth() + 1).padStart(2, "0")}${String(candidate.getDate()).padStart(2, "0")}_${String(candidate.getHours()).padStart(2, "0")}`;

        const url =
            `https://www.jma.go.jp/bosai/amedas/data/point/${id}/${fileTime}.json`;
console.log(url);
        const response = await fetch(url);

        if (!response.ok) {
            continue;
        }

        const data: Record<string, AmedasObservation> = await response.json();

        if (data[time]) {
            return data[time];
        }

        const latest = Object.keys(data)
            .sort()
            .at(-1);

        if (latest) {
            return data[latest];
        }
    }

    throw new Error("データが見つかりません");
}

export async function findLatestAmedasTime(): Promise<string> {
    const now = new Date();

    now.setMinutes(
        Math.floor(now.getMinutes() / 10) * 10
    );
    now.setSeconds(0);
    now.setMilliseconds(0);

    for (let i = 0; i < 144; i++) {
        const candidate = new Date(now);
        candidate.setMinutes(
            candidate.getMinutes() - i * 10
        );

        const time =
            `${candidate.getFullYear()}${String(candidate.getMonth() + 1).padStart(2, "0")}${String(candidate.getDate()).padStart(2, "0")}${String(candidate.getHours()).padStart(2, "0")}${String(candidate.getMinutes()).padStart(2, "0")}00`;

        try {
            const res = await fetch(
    `https://www.jma.go.jp/bosai/amedas/data/map/${time}.json`,
    {
        method: "HEAD",
    }
);

            if (res.ok) {
                return time;
            }
        } catch {
            // 次候補
        }
    }

    throw new Error(
        "最新のアメダス時刻が見つかりません"
    );
}

export async function fetchAmedasHistory(
    id: string,
    time: string
) {
    const result: {
        time: string;
        temp: number | null;
    }[] = [];

    const end = new Date(
        Number(time.slice(0, 4)),
        Number(time.slice(4, 6)) - 1,
        Number(time.slice(6, 8)),
        Number(time.slice(8, 10)),
        Number(time.slice(10, 12))
    );

    const start = new Date(end);
    start.setHours(start.getHours() - 24);


    for (let i = 0; i < 25; i++) {
        const date = new Date(end);

        date.setHours(
            date.getHours() - i
        );

        const fileTime =
            `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}`;


        const response = await fetch(
            `https://www.jma.go.jp/bosai/amedas/data/point/${id}/${fileTime}.json`
        );


        if (!response.ok) {
            continue;
        }


        const data:
            Record<string, AmedasObservation> =
            await response.json();


        for (const [timestamp, obs] of Object.entries(data)) {

            const date =
                new Date(
                    Number(timestamp.slice(0,4)),
                    Number(timestamp.slice(4,6))-1,
                    Number(timestamp.slice(6,8)),
                    Number(timestamp.slice(8,10)),
                    Number(timestamp.slice(10,12))
                );


            if (
                date >= start &&
                date <= end
            ) {
                result.push({
                    time: timestamp,
                    temp: obs.temp?.[0] ?? null,
                });
            }
        }
    }


    return result.sort(
        (a, b) =>
            a.time.localeCompare(b.time)
    );
}
