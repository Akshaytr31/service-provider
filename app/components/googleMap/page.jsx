"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FormControl, FormLabel, Button, Box } from "@chakra-ui/react";
import { useState } from "react";

// Fix Leaflet marker icon (required)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

export default function GoogleMap({ formData, setFormData }) {
  const [position, setPosition] = useState({
    lat: 20.5937,
    lng: 78.9629,
  });

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setPosition({ lat, lng });
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    });
  };

  return (
    <FormControl>
      <FormLabel fontSize="xs" fontWeight="bold" color="gray.600">
        Mark your location
      </FormLabel>

      <Button size="xs" mb={3} onClick={useCurrentLocation}>
        📍 Use my current location
      </Button>

      <Box borderRadius="lg" overflow="hidden">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "300px", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} draggable />
          <ClickHandler
            setPosition={setPosition}
            setFormData={setFormData}
          />
        </MapContainer>
      </Box>
    </FormControl>
  );
}
