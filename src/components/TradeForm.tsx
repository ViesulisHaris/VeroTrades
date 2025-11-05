'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useRouter } from 'next/navigation';

interface Props {
  onSuccess?: () => void;
}

export default function TradeForm({ onSuccess }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    market: { stock: false, crypto: false, forex: false, futures: false },
    symbol: '',
    strategy_id: '',
    date: new Date().toISOString().split('T')[0],
    side: 'Buy',
    quantity: '',
    stop_loss: '',
    take_profit: '',
    pnl: '',
    entry_time: '',
    exit_time: '',
    emotional_state: 'Neutral',
  });

  const [strategies, setStrategies] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('strategies').select('*').eq('user_id', user.id);
        setStrategies(data ?? []);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const markets = Object.keys(form.market)
      .filter((k) => form.market[k as keyof typeof form.market])
      .join(', ');

    // Explicit insert to fix schema cache "side" error
    const { error } = await supabase.from('trades').insert([
      {
        user_id: user.id,
        market,
        symbol: form.symbol,
        strategy_id: form.strategy_id || null,
        trade_date: form.date,
        side: form.side,
        quantity: parseFloat(form.quantity) || 0,
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
        take_profit: form.take_profit ? parseFloat(form.take_profit) : null,
        pnl: form.pnl ? parseFloat(form.pnl) : null,
        entry_time: form.entry_time,
        exit_time: form.exit_time,
        emotional_state: form.emotional_state,
      }
    ]).select();

    if (error) {
      alert('Error: ' + error.message);
    } else {
      onSuccess?.() || router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2 text-metallic-silver">Market</label>
        <div className="flex gap-4 flex-wrap">
          {(['stock', 'crypto', 'forex', 'futures'] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
              <input
                type="checkbox"
                checked={form.market[m]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    market: { ...form.market, [m]: e.target.checked },
                  })
                }
                className="rounded accent-primary"
              />
              <span className="capitalize text-metallic-light">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Symbol', key: 'symbol', type: 'text', required: true },
          { label: 'Strategy', key: 'strategy_id', type: 'select', options: ['None', ...strategies.map(s => s.name)] },
          { label: 'Date', key: 'date', type: 'date', required: true },
          { label: 'Side', key: 'side', type: 'select', options: ['Buy', 'Sell'] },
          { label: 'Quantity', key: 'quantity', type: 'number', required: true },
          { label: 'Stop Loss', key: 'stop_loss', type: 'number' },
          { label: 'Take Profit', key: 'take_profit', type: 'number' },
          { label: 'PnL', key: 'pnl', type: 'number' },
          { label: 'Entry Time', key: 'entry_time', type: 'time' },
          { label: 'Exit Time', key: 'exit_time', type: 'time' },
          { label: 'Emotional State', key: 'emotional_state', type: 'select', options: ['Neutral', 'Greed', 'Fear', 'Confidence', 'Frustration'] },
        ].map(({ label, key, type, options, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1 text-metallic-silver">{label}</label>
            {type === 'select' ? (
              <select
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="metallic-input w-full"
              >
                {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={type}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="metallic-input w-full"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-primary/80 text-black font-semibold rounded-xl hover:bg-primary transition"
      >
        Save Trade
      </button>
    </form>
  );
}
