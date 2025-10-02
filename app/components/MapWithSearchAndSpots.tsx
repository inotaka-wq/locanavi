"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"; // useMapEvents をインポート
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function Recenter({ position }: { position: [number, number] }) {
    const map = useMap();
    map.setView(position, 14);
    return null;
}

// ▼▼▼【新規追加】クリックイベントを処理するためのコンポーネント ▼▼▼
function MapClickHandler({
    setPosition,
    fetchSpots,
}: {
    setPosition: (position: [number, number]) => void;
    fetchSpots: (lat: number, lon: number) => void;
}) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            console.log("クリック座標:", lat, lng); // デバッグ用
            setPosition([lat, lng]);
            fetchSpots(lat, lng);
        },
    });
    return null;
}
// ▲▲▲ ここまで新規追加 ▲▲▲

export default function MapWithSearchAndSpots() {
    const [position, setPosition] = useState<[number, number]>([35.6812, 139.7671]); // 東京駅
    const [query, setQuery] = useState("");
    const [spots, setSpots] = useState<
        { lat: number; lon: number; name: string; type: string }[]
    >([]);

    async function fetchSpots(lat: number, lon: number) {
        // ... (この関数の中身は変更なし)
        const query = `
    [out:json];
    node(around:1000,${lat},${lon})["tourism"];
    out;
  `;
        const url =
            "https://overpass.kumi.systems/api/interpreter?data=" + encodeURIComponent(query);

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
        } catch {
            console.error("⚠ Overpass API returned non-JSON:", text.slice(0, 200));
            alert("Overpass APIがエラーを返しました。混雑中かもしれません。");
        }
    }

    async function handleSearch() {
        // ... (この関数の中身は変更なし)
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setPosition([lat, lon]);
            setQuery("");
            fetchSpots(lat, lon);
        }
    }

    useEffect(() => {
        fetchSpots(position[0], position[1]);
    }, []);

    return (
        <div>
            <div className="mb-2">
                {/* ... (検索フォーム部分は変更なし) ... */}
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
                <p className="text-sm text-gray-600 mt-1">
                    💡 地図をクリックしても拠点を変更できます
                </p>
            </div>
            <MapContainer
                center={position}
                zoom={14}
                style={{ height: "400px", width: "100%" }}
            // ▼▼▼【削除】この eventHandlers props を削除します ▼▼▼
            /*
            eventHandlers={{
                click: (e: any) => {
                    const lat = e.latlng.lat;
                    const lon = e.latlng.lng;
                    console.log("クリック座標:", lat, lon); // デバッグ用
                    setPosition([lat, lon]);
                    fetchSpots(lat, lon);
                },
            }}
            */
            // ▲▲▲ ここまで削除 ▲▲▲
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>基点（クリックor検索で更新）</Popup>
                </Marker>
                {spots.map((s, i) => (
                    <Marker key={i} position={[s.lat, s.lon]}>
                        <Popup>
                            {s.name}
                            <br />({s.type})
                        </Popup>
                    </Marker>
                ))}
                <Recenter position={position} />
                {/* ▼▼▼【追加】MapContainer の子として新しいコンポーネントを呼び出す ▼▼▼ */}
                <MapClickHandler setPosition={setPosition} fetchSpots={fetchSpots} />
            </MapContainer>
        </div>
    );
}