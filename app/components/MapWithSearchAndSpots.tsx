"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function Recenter({ position }: { position: [number, number] }) {
    const map = useMap();
    map.setView(position, 14);
    return null;
}

export default function MapWithSearchAndSpots() {
    const [position, setPosition] = useState<[number, number]>([35.6812, 139.7671]); // 東京駅
    const [query, setQuery] = useState("");
    const [spots, setSpots] = useState<
        { lat: number; lon: number; name: string; type: string }[]
    >([]);

    // Overpass API呼び出し
    async function fetchSpots(lat: number, lon: number) {
        const query = `
      [out:json];
      node(around:1000,${lat},${lon})["tourism"];
      out;
    `;
        const url =
            "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

        const res = await fetch(url);
        const text = await res.text();

        try {
            const data = JSON.parse(text);
            const formatted = data.elements.map((el: any) => ({
                lat: el.lat,
                lon: el.lon,
                name: el.tags?.name || "観光スポット",
                type: el.tags?.tourism || "unknown",
            }));
            setSpots(formatted);
        } catch (err) {
            console.error("Overpass API error", err);
            console.error("Overpass returned non-JSON:", text.slice(0, 200));
        }
    }

    // 検索ハンドラ（Nominatimで座標取得）
    async function handleSearch() {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setPosition([lat, lon]);
            setQuery("");
            // 拠点更新後にスポット検索
            fetchSpots(lat, lon);
        }
    }

    // 初期表示でもスポット取得（東京駅周辺）
    useEffect(() => {
        fetchSpots(position[0], position[1]);
    }, []);

    return (
        <div>
            <div className="mb-2">
                <input
                    className="border p-2"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="住所や地名を入力"
                />
                <button
                    onClick={handleSearch}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white"
                >
                    検索
                </button>
            </div>

            <MapContainer
                center={position}
                zoom={14}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 基点マーカー */}
                <Marker position={position}>
                    <Popup>基点</Popup>
                </Marker>

                {/* 観光スポット */}
                {spots.map((s, i) => (
                    <Marker key={i} position={[s.lat, s.lon]}>
                        <Popup>
                            {s.name}
                            <br />({s.type})
                        </Popup>
                    </Marker>
                ))}

                <Recenter position={position} />
            </MapContainer>
        </div>
    );
}
