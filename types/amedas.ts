export interface AmedasStation {
    type: string;
    elems: string;
    lat: [number, number];
    lon: [number, number];
    alt: number;
    kjName: string;
    knName: string;
    enName: string;
}

export interface AmedasObservation {
    temp?: [number, number];
    humidity?: [number, number];
    wind?: [number, number];
    windDirection?: [number, number];
    precipitation1h?: [number, number];
}

export interface AmedasRow {
    id: string;
    name: string;
    temp: number | null;
    humidity: number | null;
    wind: number | null;
    windDirection: number | null;
    precipitation1h: number | null;
}