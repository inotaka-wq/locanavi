"use client";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Recenter({ position }: { position: [number, number] }) {
    const map = useMap();
    map.setView(position, 14);
    return null;
}

export default function MapWithSearch() {
    const [position, setPosition] = useState<[number, number]>([35.6812, 139.7671]); // 東京駅
    const [query, setQuery] = useState("");

    async function handleSearch() {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            setQuery(""); // 入力クリア
        }
    }

    function handleGeolocation() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            },
            () => {
                alert("現在地を取得できません。東京駅を表示します。");
                setPosition([35.6812, 139.7671]);
            }
        );
    }

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
                <button
                    onClick={handleGeolocation}
                    className="ml-2 px-4 py-2 bg-green-500 text-white"
                >
                    現在地
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
                <Marker position={position}>
                    <Popup>検索した地点</Popup>
                </Marker>
                <Recenter position={position} />
            </MapContainer>
        </div>
    );
}
