'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useRouter } from 'next/navigation';

interface FormState {
  market: {
    stock: boolean;
    crypto: boolean;
    forex: boolean;
    futures: boolean;
  };
  symbol: string;
  strategy_id: string;
  date: string;
  side: string;
  quantity: string;
  stop_loss: string;
  take_profit: string;
  pnl: string;
  entry_time: string;
  exit_time: string;
  emotional_state: string;
}

export default function TradeForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
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

  const [strategies, setStrategies] = useState<{ id: string; name: string }[]>([]);

  // -------------------------------------------------
  // Load strategies for the dropdown
  // -------------------------------------------------
  useEffect(() => {
    const loadStrategies = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('strategies')
        .select('id, name')
        .eq('user_id', user.id);

      setStrategies(data ?? []);
    };

    loadStrategies();
  }, []);

  // -------------------------------------------------
  // Submit handler
  // -------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // ---- Build market string ----
    const market = Object.keys(form.market)
      .filter((k) => form.market[k as keyof typeof form.market])
      .join(', ') || null;   // <-- this was missing

    // ---- Insert trade ----
    const { error } = await supabase.from('trades').insert([
      {
        user_id: user.id,
        market,                                 // <-- now defined
        symbol: form.symbol,
        strategy_id: form.strategy_id || null,
        trade_date: form.date,
        side: form.side,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
        take_profit: form.take_profit ? parseFloat(form.take_profit) : null,
        pnl: form.pnl ? parseFloat(form.pnl) : null,
        entry_time: form.entry_time || null,
        exit_time: form.exit_time || null,
        emotional_state: form.emotional_state,
      },
    ]);

    if (error) {
      alert('Error saving trade: ' + error.message);
    } else {
      onSuccess?.() || router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass space-y-6 p-6 max-w-2xl mx-auto">
      {/* ---------- Market checkboxes ---------- */}
      <div>
        <label className="block text-sm font-medium mb-2 text-metallic-silver">
          Market
        </label>
        <div className="flex gap-4 flex-wrap">
          {(['stock', 'crypto', 'forex', 'futures'] as const).map((m) => (
            <label
              key={m}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 cursor-pointer"
            >
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

      {/* ---------- All other inputs ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Symbol', key: 'symbol' as const, type: 'text' as const, required: true },
          {
            label: 'Strategy',
            key: 'strategy_id' as const,
            type: 'select' as const,
            options: ['None', ...strategies.map((s) => s.name)],
          },
          { label: 'Date', key: 'date' as const, type: 'date' as const, required: true },
          { label: 'Side', key: 'side' as const, type: 'select' as const, options: ['Buy', 'Sell'] },
          { label: 'Quantity', key: 'quantity' as const, type: 'number' as const, required: true },
          { label: 'Stop Loss', key: 'stop_loss' as const, type: 'number' as const },
          { label: 'Take Profit', key: 'take_profit' as const, type: 'number' as const },
          { label: 'PnL', key: 'pnl' as const, type: 'number' as const },
          { label: 'Entry Time', key: 'entry_time' as const, type: 'time' as const },
          { label: 'Exit Time', key: 'exit_time' as const, type: 'time' as const },
          {
            label: 'Emotional State',
            key: 'emotional_state' as const,
            type: 'select' as const,
            options: ['Neutral', 'Greed', 'Fear', 'Confidence', 'Frustration'],
          },
        ].map(({ label, key, type, options, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1 text-metallic-silver">
              {label}
            </label>

            {type === 'select' ? (
              <select
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="metallic-input w-full"
              >
                {options!.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className="metallic-input w-full"
              />
            )}
          </div>
        ))}
      </div>

      {/* ---------- Submit button ---------- */}
      <button
        type="submit"
        className="w-full py-3 bg-primary/80 text-black font-semibold rounded-xl hover:bg-primary transition"
      >
        Save Trade
      </button>
    </form>
  );
}
