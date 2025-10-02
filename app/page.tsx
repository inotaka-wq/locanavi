// app/page.tsx
"use client";
import dynamic from "next/dynamic";

const MapWithSearchAndSpots = dynamic(
  () => import("./components/MapWithSearchAndSpots"),
  { ssr: false }   // ← SSRを無効化
);

export default function Home() {
  return (
    <div style={{ padding: "2rem", fontSize: "20px" }}>
      <h1>Locanavi 🌐</h1>
      <p>地域ポータルのPoCです！（検索→周辺観光スポット連動）</p>
      <MapWithSearchAndSpots />
    </div>
  );
}
