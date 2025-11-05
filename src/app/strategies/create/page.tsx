import StrategyCard from '@/components/StrategyCard';
import Link from 'next/link';
import { supabase } from '../../../supabase/client';
import { useState } from 'react';  // Client for refresh

export default async function StrategiesPage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: strategies } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', user.id);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-metallic-silver">Strategies</h2>
        <Link
          href="/strategies/create"
          className="glass px-6 py-3 text-metallic-silver hover:bg-primary/20 transition"
        >
          + Create Strategy
        </Link>
      </div>

      {strategies?.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {strategies.map((s) => (
            <StrategyCard key={s.id} strategy={s} />
          ))}
        </div>
      ) : (
        <div className="glass p-8 text-center text-metallic-light">
          No strategies yet. Create your first one!
        </div>
      )}
    </div>
  );
}
