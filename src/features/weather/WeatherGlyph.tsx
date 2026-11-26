import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type Icon,
} from '@phosphor-icons/react';

import { describeWeather, type WeatherIconKey } from './wmo';

const GROUP_ICONS: Record<WeatherIconKey, { day: Icon; night: Icon }> = {
  clear: { day: Sun, night: Moon },
  partly: { day: CloudSun, night: CloudMoon },
  cloudy: { day: Cloud, night: Cloud },
  overcast: { day: Cloud, night: Cloud },
  fog: { day: CloudFog, night: CloudFog },
  drizzle: { day: CloudRain, night: CloudRain },
  rain: { day: CloudRain, night: CloudRain },
  snow: { day: CloudSnow, night: CloudSnow },
  thunder: { day: CloudLightning, night: CloudLightning },
  unknown: { day: Cloud, night: Cloud },
};

interface WeatherGlyphProps {
  code: number;
  isDay?: boolean;
  size?: number;
  className?: string;
}

export function WeatherGlyph({ code, isDay = true, size = 24, className }: WeatherGlyphProps) {
  const Glyph = GROUP_ICONS[describeWeather(code).icon][isDay ? 'day' : 'night'];

  return <Glyph size={size} aria-hidden="true" className={className} />;
}
