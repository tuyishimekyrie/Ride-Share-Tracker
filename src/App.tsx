import * as React from "react";
import { Marker, Source, Layer } from "react-map-gl";
import ReactMapGL from "react-map-gl";
import "./App.css";
import CustomMarker from "./components/CustomMarker";
import { ViewportState } from "./types/viewState";

function App() {
  const [viewState, setViewState] = React.useState<ViewportState>({
    longitude: 30.0589,
    latitude: -1.9536,
    zoom: 12,
  });

  const [routeCoordinates, setRouteCoordinates] = React.useState<number[][]>(
    []
  );
  const [routeDuration, setRouteDuration] = React.useState<string>("");
  const [routeDistance, setRouteDistance] = React.useState<string>("");

  const staticStops: { label: string; coordinates: [number, number] }[] = [
    { label: "Stop A", coordinates: [-1.9355377074007851, 30.060163829002217] },
    {
      label: "Kacyiru Bus Park",
      coordinates: [-1.9358808342336546, 30.08024820994666],
    },
    { label: "Stop C", coordinates: [-1.9489196023037583, 30.092607828989397] },
    { label: "Stop D", coordinates: [-1.9592132952818164, 30.106684061788073] },
    { label: "Stop E", coordinates: [-1.9487480402200394, 30.126596781356923] },
    {
      label: "Kimironko",
      coordinates: [-1.9365670876910166, 30.13020167024439],
    },
  ];

  const stopsWithLabels = [...staticStops];

  // Add the current location as the first stop
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    stopsWithLabels.unshift({
      label: "Current Location",
      coordinates: [latitude, longitude],
    });
  });

  const [currentStopIndex] = React.useState(0);

  const trackUserPosition = () => {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState((prevState) => ({
          ...prevState,
          latitude,
          longitude,
        }));
      },
      (error) => {
        console.error("Error tracking user position:", error);
      }
    );
  };

  React.useEffect(() => {
    trackUserPosition();
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${stopsWithLabels
          .map((stop) => `${stop.coordinates[1]},${stop.coordinates[0]}`)
          .join(
            ";"
          )}?alternatives=true&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoidHV5aXNoaW1la3lyaWUiLCJhIjoiY2x2YmJ2ZTd5MDVzNTJqbGlydWE0a21jaiJ9.0FnTjnEB0JrVhOV4Htlltw`
      );
      const data = await response.json();

      console.log("API Response:", data);

      const coords = data?.routes[0].geometry.coordinates;
      console.log("Route Coordinates:", coords);
      setRouteCoordinates(coords);

      const route = data?.routes[0];
      if (route) {
        setRouteDuration(formatDuration(route.duration));
        setRouteDistance(formatDistance(route.distance));
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(2)} km`;
  };

  return (
    <ReactMapGL
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      mapStyle="mapbox://styles/tuyishimekyrie/clw0gcfya016h01qu0zic4153"
      mapboxAccessToken="pk.eyJ1IjoidHV5aXNoaW1la3lyaWUiLCJhIjoiY2x2YmJ2ZTd5MDVzNTJqbGlydWE0a21jaiJ9.0FnTjnEB0JrVhOV4Htlltw"
      style={{ width: "100vw", height: "100vh" }}
    >
      {stopsWithLabels.map((stop, index) => (
        <Marker
          key={index}
          longitude={stop.coordinates[1]}
          latitude={stop.coordinates[0]}
          offset={[0, -10]}
        >
          <CustomMarker />
        </Marker>
      ))}

      {routeCoordinates.length > 0 && (
        <Source
          id="route"
          type="geojson"
          data={{
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: routeCoordinates },
          }}
        >
          <Layer
            id="route"
            type="line"
            source="route"
            layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{ "line-color": "#3887be", "line-width": 5 }}
          />
        </Source>
      )}

      <div className="info-card">
        <div className="header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="white"
            className="svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>

          <h3>Startup</h3>
        </div>
        <div className="content">
          <h4>Nyabugogo - Kimironko</h4>
          <p>
            Next Stop:{" "}
            {stopsWithLabels[currentStopIndex + 1]?.label || "End of Route"}
          </p>
          <div className="local">
            <p>Distance: {routeDistance}</p>
            <p>Time: {routeDuration}</p>
          </div>
        </div>
      </div>
      <div className="bottom">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
      </div>
    </ReactMapGL>
  );
}

export default App;
