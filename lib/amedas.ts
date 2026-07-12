import { AmedasObservation, AmedasRow, AmedasStation } from "@/types/amedas";

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

export const fetchAmedasStations = async (): Promise<Record<string, AmedasStation>> => {
    const response = await fetch(
        "https://www.jma.go.jp/bosai/amedas/const/amedastable.json"
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

export const mergeAmedasData = (
    stations: Record<string, AmedasStation>,
    observations: Record<string, AmedasObservation>
): AmedasRow[] => {
    return Object.entries(stations).map(([id, station]) => {
        const obs = observations[id];

        return {
            id,
            name: station.kjName,
            latitude: station.lat[0] + station.lat[1] / 60,
            longitude: station.lon[0] + station.lon[1] / 60,
            altitude: station.alt,

            temp: obs?.temp?.[0] ?? null,
            humidity: obs?.humidity?.[0] ?? null,
            wind: obs?.wind?.[0] ?? null,
            windDirection: obs?.windDirection?.[0] ?? null,
            precipitation1h: obs?.precipitation1h?.[0] ?? null,
            snow: obs?.snow?.[0] ?? null,
        };
    });
};
