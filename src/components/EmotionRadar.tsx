'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, Tooltip } from 'recharts';

interface Data {
  subject: string;
  value: number;
  fullMark: number;
  percent: string;
}

interface Props {
  data: Data[];
}

export default function EmotionRadar({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid radialLines={false} stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#C0C0C0' }} />
        <Radar name="Trades" dataKey="value" stroke="#C0C0C0" fill="#C0C0C0" fillOpacity={0.6} />
        <Tooltip formatter={(value: number, name: string) => [data.find(d => d.subject === name)?.percent || '0%', name]} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
