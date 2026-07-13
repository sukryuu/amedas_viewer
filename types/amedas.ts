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

    pressure?: [number, number];
    normalPressure?: [number, number];

    wind?: [number, number];
    windDirection?: [number, number];

    precipitation10m?: [number, number];
    precipitation1h?: [number, number];
    precipitation3h?: [number, number];
    precipitation24h?: [number, number];

    snow?: [number, number];
    snow1h?: [number, number];
    snow6h?: [number, number];
    snow12h?: [number, number];
    snow24h?: [number, number];

    sun10m?: [number, number];
    sun1h?: [number, number];

    visibility?: [number, number];

    weather?: [number | null, number];
}

export interface AmedasRow {
    id: string;
    name: string;
    prefecture: string | null;
    temp: number | null;
    humidity: number | null;
    wind: number | null;
    windDirection: number | null;
    precipitation1h: number | null;
    snow: number | null;
}