"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";
import { FormControl, FormLabel, Button, Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";

// Fix Leaflet marker icon (required)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ setPosition, setFormData }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setFormData((prev) => ({
        ...prev,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      }));
    },
  });
  return null;
}

function SearchControl({ setPosition, setFormData }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar",
      showMarker: false, // We use our own marker
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: "Enter address",
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result) => {
      if (result?.location) {
        const { x, y, label } = result.location; // x: lng, y: lat
        const newLat = parseFloat(y);
        const newLng = parseFloat(x);

        const newPos = { lat: newLat, lng: newLng };
        setPosition(newPos);

        setFormData((prev) => ({
          ...prev,
          latitude: newLat,
          longitude: newLng,
          address: label, // Save the location name/address
        }));
      }
    });

    return () => map.removeControl(searchControl);
  }, [map, setPosition, setFormData]);

  return null;
}

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function GoogleMap({ formData, setFormData, viewOnly = false }) {
  const [position, setPosition] = useState({
    lat: formData?.latitude || 20.5937,
    lng: formData?.longitude || 78.9629,
  });

  // Update position if formData changes externally (e.g. from Admin data load)
  useEffect(() => {
    if (formData?.latitude && formData?.longitude) {
      const newLat = parseFloat(formData.latitude);
      const newLng = parseFloat(formData.longitude);

      // Avoid infinite loops/jitter by checking if actually changed
      // (Small epsilon for float comparison)
      if (
        Math.abs(newLat - position.lat) > 0.00001 ||
        Math.abs(newLng - position.lng) > 0.00001
      ) {
        setPosition({
          lat: newLat,
          lng: newLng,
        });
      }
    }
  }, [formData?.latitude, formData?.longitude]); // removed position dependency to avoid loop

  /* -------------------------------------------
     NEW: Auto-geocode when address text changes
     ------------------------------------------- */
  useEffect(() => {
    // 1. Construct the query string from formData
    const { city, zipCode, state, country } = formData || {};
    const parts = [city, zipCode, state, country].filter((p) => p && p.trim());

    if (parts.length === 0) return;

    const query = parts.join(", ");

    // 2. define the async search function
    const searchAddress = async (q) => {
      try {
        const provider = new OpenStreetMapProvider();
        const results = await provider.search({ query: q });

        if (results && results.length > 0) {
          const best = results[0];
          const newLat = parseFloat(best.y);
          const newLng = parseFloat(best.x);

          // Update map position
          setPosition({ lat: newLat, lng: newLng });

          // Update parent formData so it persists
          // We do NOT overwrite the text fields (city/zip) to avoid fighting the user.
          setFormData((prev) => ({
            ...prev,
            latitude: newLat,
            longitude: newLng,
          }));
        }
      } catch (error) {
        console.error("Auto-geocoding error:", error);
      }
    };

    // 3. Debounce the call
    const timerId = setTimeout(() => {
      searchAddress(query);
    }, 1500); // 1.5s debounce to wait for typing to finish

    return () => clearTimeout(timerId);
  }, [
    formData?.city,
    formData?.zipCode,
    formData?.state,
    formData?.country,
    setFormData,
  ]);

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setPosition({ lat, lng });

      // Reverse geocoding to get address
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: data.display_name || "Current Location",
          }));
        })
        .catch((err) => {
          console.error("Reverse geocoding failed", err);
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: "Current Location",
          }));
        });
    });
  };

  return (
    <FormControl>
      {!viewOnly && (
        <>
          <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
            Mark your location
          </FormLabel>

          <Button size="xs" mb={3} onClick={useCurrentLocation}>
            📍 Use my current location
          </Button>
        </>
      )}

      <Box borderRadius="lg" overflow="hidden">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "300px", width: "100%", zIndex: 4 }}
        >
          <style>
            {`
              .leaflet-control-zoom {
                z-index: 5 !important;
              }
            `}
          </style>
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} draggable={!viewOnly} />
          <MapUpdater position={position} />
          {!viewOnly && (
            <ClickHandler setPosition={setPosition} setFormData={setFormData} />
          )}
          {!viewOnly && (
            <SearchControl
              setPosition={setPosition}
              setFormData={setFormData}
            />
          )}
        </MapContainer>
      </Box>
    </FormControl>
  );
}
