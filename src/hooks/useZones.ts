import { useState, useEffect, useCallback } from 'react';
import { Zone, PopularityData } from '@/types/zone';

const ZONES_URLS = [
  "https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json",
  "https://cdn.jsdelivr.net/gh/gn-math/assets@latest/zones.json",
  "https://cdn.jsdelivr.net/gh/gn-math/assets@master/zones.json",
  "https://cdn.jsdelivr.net/gh/gn-math/assets/zones.json"
];

export const COVER_URL = "https://cdn.jsdelivr.net/gh/gn-math/covers@main";
export const HTML_URL = "https://cdn.jsdelivr.net/gh/gn-math/html@main";

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [popularityData, setPopularityData] = useState<PopularityData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const fetchPopularity = async () => {
    try {
      const response = await fetch("https://data.jsdelivr.com/v1/stats/packages/gh/gn-math/html@main/files?period=year");
      const data = await response.json();
      const popularity: PopularityData = {};
      data.forEach((file: { name: string; hits: { total: number } }) => {
        const idMatch = file.name.match(/\/(\d+)\.html$/);
        if (idMatch) {
          const id = parseInt(idMatch[1]);
          popularity[id] = file.hits.total;
        }
      });
      setPopularityData(popularity);
    } catch {
      setPopularityData({});
    }
  };

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let zonesURL = ZONES_URLS[Math.floor(Math.random() * ZONES_URLS.length)];
      
      try {
        const shaResponse = await fetch("https://api.github.com/repos/gn-math/assets/commits?t=" + Date.now());
        if (shaResponse.status === 200) {
          const shaJson = await shaResponse.json();
          const sha = shaJson[0]?.sha;
          if (sha) {
            zonesURL = `https://cdn.jsdelivr.net/gh/gn-math/assets@${sha}/zones.json`;
          }
        }
      } catch {
        // Use default URL
      }

      const response = await fetch(zonesURL + "?t=" + Date.now());
      const json: Zone[] = await response.json();
      
      // Mark first zone as featured
      if (json.length > 0) {
        json[0].featured = true;
      }
      
      await fetchPopularity();
      setZones(json);
      
      // Extract unique tags
      const allTags = json.flatMap(zone => zone.special || []);
      setTags([...new Set(allTags)]);
    } catch (err) {
      setError(`Error loading zones: ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return { zones, popularityData, loading, error, tags, refetch: fetchZones };
}
