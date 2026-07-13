import asyncio
import aiohttp
import json

timestamp = "20260713_12"

STATION_URL = (
    "https://www.jma.go.jp/bosai/amedas/const/amedastable.json"
)

OUTPUT = "stationPrefMap.json"

CONCURRENT = 30


async def fetch_pref(
    session,
    semaphore,
    station_id
):
    url = (
        f"https://www.jma.go.jp/bosai/amedas/data/point/"
        f"{station_id}/{timestamp}.json"
    )

    async with semaphore:
        try:
            async with session.get(
                url,
                timeout=10
            ) as response:

                if response.status != 200:
                    print(
                        station_id,
                        response.status
                    )
                    return None

                data = await response.json()

                observation = next(iter(data.values()))

                pref = observation.get(
                    "prefNumber"
                )

                print(
                    station_id,
                    "->",
                    pref
                )

                return (
                    station_id,
                    pref
                )

        except Exception as e:
            print(
                station_id,
                "ERROR",
                e
            )
            return None


async def main():

    async with aiohttp.ClientSession() as session:

        async with session.get(
            STATION_URL
        ) as response:
            stations = await response.json()


        semaphore = asyncio.Semaphore(
            CONCURRENT
        )

        tasks = [
            fetch_pref(
                session,
                semaphore,
                station_id
            )
            for station_id in stations.keys()
        ]

        results = await asyncio.gather(
            *tasks
        )


    station_map = {}

    for result in results:
        if result is None:
            continue

        station_id, pref = result

        if pref is not None:
            station_map[station_id] = pref


    with open(
        OUTPUT,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            station_map,
            f,
            ensure_ascii=False,
            indent=4
        )


    print()
    print(
        f"完了: {len(station_map)}件"
    )


if __name__ == "__main__":
    asyncio.run(main())