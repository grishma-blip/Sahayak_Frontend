import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SimpleMapProps {
  destination?: string;
}

export function SimpleMap({ destination }: SimpleMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!mapContainerRef.current) return;

    // Helper to completely reset the map container
    const resetMapContainer = () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (mapContainerRef.current) {
        const container = mapContainerRef.current as any;
        if (container._leaflet_id) {
          container._leaflet_id = null;
        }
        mapContainerRef.current.innerHTML = '';
      }
    };

    // Initial cleanup
    resetMapContainer();

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;

          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);

          try {
            // Extra safety check
            if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
              resetMapContainer();
            }

            // Initialize map centered on user location
            const map = L.map(mapContainerRef.current!, {
              center: coords,
              zoom: 15,
              zoomControl: true,
            });

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
            }).addTo(map);

            // Add user location marker
            const userMarker = L.marker(coords, {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: `<div style="width: 20px; height: 20px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
              }),
            }).addTo(map);

            userMarkerRef.current = userMarker;
            mapRef.current = map;
          } catch (e) {
            console.error("Map initialization failed", e);
            // Retry once after small delay if needed or just fail gracefully
          }
        },
        (error) => {
          if (!isMounted) return;
          console.error('Geolocation error:', error);

          // Fallback to default location (New Delhi)
          const defaultCoords: [number, number] = [28.6139, 77.2090];
          setUserLocation(defaultCoords);

          try {
            if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
              resetMapContainer();
            }

            const map = L.map(mapContainerRef.current!, {
              center: defaultCoords,
              zoom: 13,
              zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
            }).addTo(map);

            mapRef.current = map;
          } catch (e) {
            console.error("Fallback map initialization failed", e);
          }
        }
      );
    }

    return () => {
      isMounted = false;
      resetMapContainer();
    };
  }, []);

  // Add destination marker and route when destination changes
  useEffect(() => {
    if (!mapRef.current || !userLocation || !destination) return;

    // For demo: Simulate destination location near user
    // In production, you'd geocode the destination string
    const destinationCoords: [number, number] = [
      userLocation[0] + 0.01,
      userLocation[1] + 0.01,
    ];

    // Remove old destination marker and route
    if (destinationMarkerRef.current) {
      mapRef.current.removeLayer(destinationMarkerRef.current);
    }
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    // Add destination marker
    const destMarker = L.marker(destinationCoords, {
      icon: L.divIcon({
        className: 'destination-marker',
        html: `<div style="width: 30px; height: 30px; background: #EF4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📍</div>`,
        iconSize: [30, 30],
      }),
    }).addTo(mapRef.current);

    destinationMarkerRef.current = destMarker;

    // Draw simple route line
    const routeLine = L.polyline([userLocation, destinationCoords], {
      color: '#3B82F6',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10',
    }).addTo(mapRef.current);

    routeLayerRef.current = routeLine;

    // Fit map to show both markers
    const bounds = L.latLngBounds([userLocation, destinationCoords]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [destination, userLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ background: '#f0f0f0' }}
    />
  );
}
