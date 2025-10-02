"use client";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function Recenter({ position }: { position: [number, number] }) {
    const map = useMap();
    map.setView(position, 14);
    return null;
}

export default function MapWithSpots() {
    const [position] = useState<[number, number]>([35.6812, 139.7671]); // 東京駅
    const [spots, setSpots] = useState<
        { lat: number; lon: number; name: string; type: string }[]
    >([]);

    async function handleFetchSpots() {
        const query = `
      [out:json];
      node(around:1000,${position[0]},${position[1]})["tourism"];
      out;
    `;
        const url =
            "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

        try {
            const res = await fetch(url);
            const data = await res.json();
            const formatted = data.elements.map((el: any) => ({
                lat: el.lat,
                lon: el.lon,
                name: el.tags.name || "観光スポット",
                type: el.tags.tourism || "unknown",
            }));
            setSpots(formatted);
        } catch (err) {
            console.error("Overpass API error", err);
        }
    }

    return (
        <div>
            <button
                onClick={handleFetchSpots}
                className="mb-2 px-4 py-2 bg-purple-600 text-white"
            >
                周辺観光スポットを取得
            </button>

            <MapContainer
                center={position}
                zoom={14}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 基点 */}
                <Marker position={position}>
                    <Popup>基点（東京駅）</Popup>
                </Marker>

                {/* 観光スポット */}
                {spots.map((s, i) => (
                    <Marker key={i} position={[s.lat, s.lon]}>
                        <Popup>
                            {s.name}
                            <br />
                            ({s.type})
                        </Popup>
                    </Marker>
                ))}

                <Recenter position={position} />
            </MapContainer>
        </div>
    );
}
