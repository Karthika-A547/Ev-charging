import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Gauge } from 'lucide-react';

// Custom colored SVG pin markers for Leaflet
const createMarkerIcon = (demandLevel) => {
  let color = '#10b981'; // LOW = emerald
  if (demandLevel === 'HIGH') color = '#ef4444'; // HIGH = rose
  else if (demandLevel === 'MEDIUM') color = '#f59e0b'; // MEDIUM = amber

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="38">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff"/>
      <circle cx="12" cy="12" r="2.5" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgHtml,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -36],
  });
};

// Component to handle map view updates when selected station changes
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 6);
    }
  }, [center, zoom, map]);
  return null;
};

const StationMap = ({ stations = [], selectedStation = null, height = '500px', center = [21.5, 78.9], zoom = 5 }) => {
  // Filter stations with valid coordinates
  const validStations = stations.filter(
    (s) => s.latitude && s.longitude && s.latitude >= 6.0 && s.latitude <= 38.0 && s.longitude >= 68.0 && s.longitude <= 98.0
  );

  const activeCenter = selectedStation ? [selectedStation.latitude, selectedStation.longitude] : center;
  const activeZoom = selectedStation ? 13 : zoom;

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={activeCenter} zoom={activeZoom} />

        {validStations.map((station) => (
          <Marker
            key={station.id || station.station_id}
            position={[station.latitude, station.longitude]}
            icon={createMarkerIcon(station.current_demand_level)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[220px]">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {station.station_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      station.current_demand_level === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : station.current_demand_level === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {station.current_demand_level} DEMAND
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                  {station.name}
                </h4>

                <div className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{station.city}, {station.state}</span>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-slate-50 p-2 rounded-lg text-[11px] mb-3">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Capacity</span>
                    <span className="font-semibold text-slate-700">{station.total_power_kw || 60} kW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Guns</span>
                    <span className="font-semibold text-slate-700">{station.charging_gun_num || 2} Ports</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/stations/${station.id}`}
                    className="flex-1 text-center py-1.5 px-3 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/predictions?station_id=${station.id}`}
                    className="py-1.5 px-2.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-medium hover:bg-brand-100 transition-colors flex items-center justify-center"
                    title="Predict Demand"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend Badge */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-4">
        <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide">Demand Tier:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600 text-[11px]">Low (&le;2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600 text-[11px]">Medium (3-6)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-slate-600 text-[11px]">High (&ge;7)</span>
        </div>
      </div>
    </div>
  );
};

export default StationMap;
