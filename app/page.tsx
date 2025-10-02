import MapWithSearch from "./components/Map";

export default function Home() {
  return (
    <div style={{ padding: "2rem", fontSize: "20px" }}>
      <h1>Locanavi 🌐</h1>
      <p>地域ポータルのPoCです！</p>
      <MapWithSearch />
    </div>
  );
}
