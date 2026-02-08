import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigation } from '../contexts/NavigationContext';

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
  const { currentLocation } = useNavigation();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  const initMap = (coords: [number, number]) => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      // Clean up any existing map instance on the container element
      const container = mapContainerRef.current as any;
      if (container._leaflet_id) {
        container._leaflet_id = null;
        container.innerHTML = '';
      }

      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 16, // Zoom level adjusted for navigation
        zoomControl: false, // Cleaner UI
        attributionControl: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker
      const userMarker = L.marker(coords, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `<div style="width: 24px; height: 24px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5); position: relative;">
                  <div style="position: absolute; width: 40px; height: 40px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: pulse 2s infinite;"></div>
                 </div>
                 <style>
                  @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                  }
                 </style>`,
          iconSize: [24, 24],
        }),
        zIndexOffset: 1000, // Ensure user marker is on top
      }).addTo(map);

      userMarkerRef.current = userMarker;
      mapRef.current = map;
    } catch (e) {
      console.error("Map initialization failed", e);
    }
  };

  useEffect(() => {
    // If we have a location from context
    if (currentLocation) {
      const coords: [number, number] = [currentLocation.lat, currentLocation.lng];

      if (!mapRef.current) {
        initMap(coords);
      } else {
        // Update marker position
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(coords);
        }
        // Optional: Smooth pan
        // mapRef.current.panTo(coords);
      }
    } else {
      // Fallback for initialization if location is null (e.g. permission pending)
      if (!mapRef.current) {
        // Default: New Delhi
        initMap([28.6139, 77.2090]);
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount mainly, but initialization might depend on location availability

  // React to location updates specifically for the marker movement
  useEffect(() => {
    if (currentLocation && mapRef.current && userMarkerRef.current) {
      const coords: [number, number] = [currentLocation.lat, currentLocation.lng];
      userMarkerRef.current.setLatLng(coords);
      // We could pan here if we want to follow user
    } else if (currentLocation && !mapRef.current) {
      // Late init if it wasn't ready
      initMap([currentLocation.lat, currentLocation.lng]);
    }
  }, [currentLocation]);


  // Update route and destination marker
  useEffect(() => {
    if (!mapRef.current || !currentLocation || !destination) {
      // If destination is cleared, remove markers
      if (!destination) {
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.remove();
          destinationMarkerRef.current = null;
        }
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
          routeLayerRef.current = null;
        }
      }
      return;
    }

    const userCoords: [number, number] = [currentLocation.lat, currentLocation.lng];

    // For demo: Simulate destination location near user
    // In production, you'd geocode the destination string
    // Calculate a pseudo-random position based on destination string length to keep it consistent
    const offset = (destination.length % 10) * 0.001 + 0.005;
    const destinationCoords: [number, number] = [
      userCoords[0] + offset,
      userCoords[1] + offset,
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
        html: `<div style="width: 30px; height: 30px; background: #EF4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30], // Tip of the pin
      }),
    }).addTo(mapRef.current);

    destinationMarkerRef.current = destMarker;

    // Draw simple route line
    const routeLine = L.polyline([userCoords, destinationCoords], {
      color: '#3B82F6',
      weight: 6,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '1, 10',
    }).addTo(mapRef.current);

    // Animate the dash array to simulate walking
    // Note: Leaflet doesn't support CSS animation on paths easily, avoiding complex DOM manipulation for now.
    // Instead just use a solid solid line for better visibility
    routeLine.setStyle({ dashArray: undefined });


    routeLayerRef.current = routeLine;

    // Fit map to show both markers
    const bounds = L.latLngBounds([userCoords, destinationCoords]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
  }, [destination, currentLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ background: '#e5e7eb', zIndex: 0 }}
    />
  );
}
