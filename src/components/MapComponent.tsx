import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  onTileSelect: (tiles: string[]) => void;
  selectedTiles: string[];
}

const MapComponent: React.FC<MapComponentProps> = ({ onTileSelect, selectedTiles }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(18);
  const selectedTilesRef = useRef(selectedTiles);

  useEffect(() => {
    selectedTilesRef.current = selectedTiles;
  }, [selectedTiles]);

  const MAPBOX_TOKEN = 'pk.eyJ1Ijoid2lubGV5MTMiLCJhIjoiY2t5OG8wZ2wwMTR3bTJvbm9yc2IwZ292OSJ9.pvfAWhyqGSbJM5jYoQAXfw';

  useEffect(() => {
    if (map.current) return; // initialize map only once
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [139.7671, 35.6804],
      zoom: zoom,
      pitch: 45,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add grid source
      map.current.addSource('grid', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add grid layer
      map.current.addLayer({
        id: 'grid-layer',
        type: 'fill',
        source: 'grid',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#B6FE05',
            'rgba(182, 254, 5, 0.05)'
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.8,
            0.15
          ],
          'fill-outline-color': '#B6FE05'
        }
      });

      updateGrid();
    });

    map.current.on('moveend', updateGrid);
    
    map.current.on('click', 'grid-layer', (e) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const tileId = feature.properties?.id;
      const featureId = feature.id;

      if (!tileId || featureId === undefined) return;

      const isAlreadySelected = selectedTilesRef.current.includes(tileId);
      const newSelected = isAlreadySelected
        ? selectedTilesRef.current.filter(id => id !== tileId)
        : [...selectedTilesRef.current, tileId];
      
      onTileSelect(newSelected);
      
      map.current?.setFeatureState(
        { source: 'grid', id: featureId },
        { selected: !isAlreadySelected }
      );
    });

    map.current.on('mouseenter', 'grid-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'grid-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    
    // Update visual state of tiles when selectedTiles changes from outside
    const features = (map.current.getSource('grid') as mapboxgl.GeoJSONSource)?.['_data']?.features || [];
    features.forEach((f: any) => {
      map.current?.setFeatureState(
        { source: 'grid', id: f.id },
        { selected: selectedTiles.includes(f.properties.id) }
      );
    });
  }, [selectedTiles]);

  const updateGrid = () => {
    if (!map.current) return;
    const bounds = map.current.getBounds();
    const zoomLevel = map.current.getZoom();
    
    if (zoomLevel < 16) {
      (map.current.getSource('grid') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }

    const step = 0.0001; // Approx 10m
    const features = [];

    for (let lng = Math.floor(bounds.getWest() / step) * step; lng <= bounds.getEast(); lng += step) {
      for (let lat = Math.floor(bounds.getSouth() / step) * step; lat <= bounds.getNorth(); lat += step) {
        const x = Math.round(lng / step);
        const y = Math.round(lat / step);
        const tileId = `${x}_${y}`;
        
        // Use a unique numeric ID for Mapbox feature state
        // We use a simple hash of the coordinates
        const numericId = Math.abs((x * 31 + y) % 1000000); 

        features.push({
          type: 'Feature',
          id: numericId,
          properties: { id: tileId },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng, lat],
              [lng + step, lat],
              [lng + step, lat + step],
              [lng, lat + step],
              [lng, lat]
            ]]
          }
        });
      }
    }

    (map.current.getSource('grid') as mapboxgl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: features as any
    });

    // Restore selection state
    features.forEach((f) => {
      map.current?.setFeatureState(
        { source: 'grid', id: f.id },
        { selected: selectedTiles.includes(f.properties.id) }
      );
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs text-white/60 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Interactive Grid Active
      </div>
    </div>
  );
};

export default MapComponent;