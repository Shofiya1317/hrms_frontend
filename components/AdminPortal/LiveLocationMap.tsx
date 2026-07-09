'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, Info, Loader2 } from 'lucide-react';
import { ILiveLocation } from '@/lib/service/adminDashboard';

// Cache the loader promise so we don't load the script multiple times
let googleMapsLoaderPromise: Promise<any> | null = null;

const loadGoogleMaps = (apiKey: string): Promise<any> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps) return Promise.resolve(window.google);

  if (googleMapsLoaderPromise) return googleMapsLoaderPromise;

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = (err) => {
      googleMapsLoaderPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
};

const getInitials = (name: string): string => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface LiveLocationMapProps {
  locations: ILiveLocation[];
  officeLocation: {
    latitude: number;
    longitude: number;
    name: string;
  } | null;
}

export default function LiveLocationMap({ locations, officeLocation }: LiveLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    console.log('Loaded Google Maps API Key:', apiKey);
    if (!apiKey) {
      setLoadError('Google Maps API key is not configured in environment variables');
      return;
    }

    let active = true;

    loadGoogleMaps(apiKey)
      .then(async (google) => {
        if (!active || !mapContainerRef.current) return;

        try {
          // Import Maps and Marker libraries
          const { Map, InfoWindow } = await google.maps.importLibrary('maps');
          const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

          // Determine initial center
          // Default to office location or a general default (Chennai)
          const defaultCenter = officeLocation
            ? { lat: officeLocation.latitude, lng: officeLocation.longitude }
            : { lat: 13.0827, lng: 80.2707 };

          // Initialize Map
          const mapInstance = new Map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: 12,
            mapId: 'LIVE_EMPLOYEE_LOCATIONS_MAP', // Required for AdvancedMarkerElement
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          });

          mapRef.current = mapInstance;
          infoWindowRef.current = new InfoWindow();
          setMapLoaded(true);

          // Render Markers
          renderMarkers(google, mapInstance, AdvancedMarkerElement);
        } catch (err: any) {
          console.error('Error initializing map libraries:', err);
          if (active) setLoadError('Failed to initialize Google Maps components');
        }
      })
      .catch((err) => {
        console.error('Error loading script:', err);
        if (active) setLoadError('Failed to load Google Maps SDK');
      });

    return () => {
      active = false;
      cleanupMarkers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, officeLocation]);

  // Handle marker updates when location array changes
  useEffect(() => {
    if (mapLoaded && window.google?.maps && mapRef.current) {
      window.google.maps.importLibrary('marker').then(({ AdvancedMarkerElement }: any) => {
        renderMarkers(window.google, mapRef.current, AdvancedMarkerElement);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, mapLoaded]);

  const cleanupMarkers = () => {
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];
  };

  const renderMarkers = (google: any, mapInstance: any, AdvancedMarkerElement: any) => {
    cleanupMarkers();
    const infoWindow = infoWindowRef.current;
    if (!infoWindow) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    locations.forEach((loc) => {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);

      if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return; // Ignore invalid coordinates
      }

      hasValidCoords = true;
      const position = { lat, lng };
      bounds.extend(position);

      // Create Custom Marker DOM Element
      const containerEl = document.createElement('div');
      containerEl.className = 'custom-map-marker-container';
      containerEl.style.position = 'relative';
      containerEl.style.display = 'flex';
      containerEl.style.flexDirection = 'column';
      containerEl.style.alignItems = 'center';
      containerEl.style.cursor = 'pointer';

      const circleEl = document.createElement('div');
      circleEl.style.width = '36px';
      circleEl.style.height = '36px';
      circleEl.style.borderRadius = '50%';
      circleEl.style.border = '2px solid white';
      circleEl.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3)';
      circleEl.style.backgroundColor = '#0f766e'; // teal brand
      circleEl.style.display = 'flex';
      circleEl.style.alignItems = 'center';
      circleEl.style.justifyContent = 'center';
      circleEl.style.overflow = 'hidden';

      if (loc.employee.profile_photo_url) {
        const img = document.createElement('img');
        img.src = loc.employee.profile_photo_url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        circleEl.appendChild(img);
      } else {
        const initialsSpan = document.createElement('span');
        initialsSpan.innerText = getInitials(loc.employee.name);
        initialsSpan.style.color = 'white';
        initialsSpan.style.fontSize = '11px';
        initialsSpan.style.fontWeight = '700';
        initialsSpan.style.letterSpacing = '0.02em';
        circleEl.appendChild(initialsSpan);
      }

      const tailEl = document.createElement('div');
      tailEl.style.width = '0';
      tailEl.style.height = '0';
      tailEl.style.borderLeft = '5px solid transparent';
      tailEl.style.borderRight = '5px solid transparent';
      tailEl.style.borderTop = '6px solid white';
      tailEl.style.marginTop = '-1px';
      tailEl.style.filter = 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))';

      containerEl.appendChild(circleEl);
      containerEl.appendChild(tailEl);

      // Create Advanced Marker
      const marker = new AdvancedMarkerElement({
        map: mapInstance,
        position,
        content: containerEl,
        title: loc.employee.name,
      });

      markersRef.current.push(marker);

      // Build InfoWindow Content
      const checkInLocalTime = loc.check_in_time
        ? new Date(loc.check_in_time).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A';

      const isWfh = loc.work_location === 'WFH';
      const initials = getInitials(loc.employee.name);

      const infoWindowHtml = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 220px; padding: 4px; line-height: 1.4;">
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #e2e8f0;">
              ${
                loc.employee.profile_photo_url
                  ? `<img src="${loc.employee.profile_photo_url}" style="width: 100%; height: 100%; object-fit: cover;" />`
                  : `<span style="font-size: 12px; font-weight: 700; color: #475569;">${initials}</span>`
              }
            </div>
            <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
              <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${loc.employee.name}</h4>
              <p style="margin: 1px 0 0 0; font-size: 10px; font-weight: 500; color: #64748b;">Code: ${loc.employee.employee_code || 'N/A'}</p>
            </div>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 6px; display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #475569;">
            <div><strong style="color: #64748b;">Dept:</strong> ${loc.employee.department_name || 'N/A'}</div>
            <div><strong style="color: #64748b;">Role:</strong> ${loc.employee.designation_name || 'N/A'}</div>
            <div><strong style="color: #64748b;">Checked In:</strong> ${checkInLocalTime}</div>
            <div style="margin-top: 4px;">
              <span style="display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${
                isWfh ? '#f0fdf4' : '#f0fdfa'
              }; color: ${isWfh ? '#15803d' : '#0f766e'}; border: 1px solid ${isWfh ? '#bbf7d0' : '#99f6e4'};">
                ${loc.work_location}
              </span>
            </div>
          </div>
        </div>
      `;

      // Hover interaction with a small delay for smooth leave transit
      let hoverTimer: any = null;

      containerEl.addEventListener('mouseenter', () => {
        if (hoverTimer) clearTimeout(hoverTimer);
        infoWindow.setContent(infoWindowHtml);
        infoWindow.open(mapInstance, marker);
      });

      containerEl.addEventListener('mouseleave', () => {
        hoverTimer = setTimeout(() => {
          infoWindow.close();
        }, 150);
      });

      // Click interaction: smooth zoom & center
      containerEl.addEventListener('click', () => {
        if (hoverTimer) clearTimeout(hoverTimer);
        mapInstance.panTo(position);
        mapInstance.setZoom(16);
        infoWindow.setContent(infoWindowHtml);
        infoWindow.open(mapInstance, marker);
      });
    });

    // Handle map view bounding adjustments
    if (hasValidCoords) {
      if (locations.length === 1) {
        const lat = Number(locations[0].latitude);
        const lng = Number(locations[0].longitude);
        mapInstance.setCenter({ lat, lng });
        mapInstance.setZoom(14);
      } else {
        mapInstance.fitBounds(bounds);
        // Add a bit of padding so markers aren't right on edge
        const listener = google.maps.event.addListenerOnce(mapInstance, 'bounds_changed', () => {
          if (mapInstance.getZoom() > 16) mapInstance.setZoom(16);
        });
      }
    } else {
      // Center fallback on office coordinates or default
      const fallbackCenter = officeLocation
        ? { lat: officeLocation.latitude, lng: officeLocation.longitude }
        : { lat: 13.0827, lng: 80.2707 };
      mapInstance.setCenter(fallbackCenter);
      mapInstance.setZoom(12);
    }
  };

  if (loadError) {
    return (
      <div className="h-[360px] w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center p-6">
        <Info className="text-red-500 mb-2" size={28} />
        <h4 className="text-sm font-bold text-slate-800">Map Loading Failed</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-[280px]">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-50">
      {/* Map Element */}
      <div ref={mapContainerRef} className="h-[360px] sm:h-[400px] w-full" style={{ height: '400px', width: '100%' }} />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400 text-xs font-semibold">
            <Loader2 size={20} className="animate-spin text-teal-600" />
            Initializing live map...
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {mapLoaded && locations.length === 0 && (
        <div className="absolute inset-0 bg-slate-950/15 backdrop-blur-[0.5px] flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white/95 shadow-xl border border-slate-200/80 rounded-2xl p-4 sm:p-5 max-w-xs text-center pointer-events-auto transform translate-y-2 animate-in fade-in slide-in-from-bottom-2 duration-250">
            <Users className="mx-auto text-teal-600/90 mb-2" size={24} />
            <h4 className="text-sm font-bold text-slate-800">No Check-ins Today</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              No employees are currently checked in with location coordinates. Showing office area.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
