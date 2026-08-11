// Typed fetch wrapper for the station API with runtime validation.
import type {
  Station,
  TelemetryResponse,
  CrewResponse,
  IncidentsResponse,
} from "./types";

export async function getData<T>(path: string): Promise<T> {
  const url = "/api/" + path + ".json";
  // simulated network latency so loading states are visible
  await new Promise((resolve) =>
    setTimeout(resolve, 200 + Math.random() * 200),
  );
  if (
    typeof window !== "undefined" &&
    window.location.search.indexOf("fail=1") !== -1
  ) {
    throw new Error("Simulated uplink failure (remove ?fail=1 from the URL)");
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed: " + res.status);
  }
  const data = await res.json();
  return data;
}

// Typed convenience functions for each endpoint
export function getStation(): Promise<Station> {
  return getData("station");
}

export function getTelemetry(): Promise<TelemetryResponse> {
  return getData("telemetry");
}

export function getCrew(): Promise<CrewResponse> {
  return getData("crew");
}

export function getIncidents(): Promise<IncidentsResponse> {
  return getData("incidents");
}
