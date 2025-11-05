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
    date: '',
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('strategies').select('*').eq('user_id', user.id);
        setStrategies(data ?? []);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const markets = Object.keys(form.market)
      .filter((k) => form.market[k as keyof typeof form.market])
      .join(', ');

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      market: markets,
      symbol: form.symbol,
      strategy_id: form.strategy_id || null,
      trade_date: form.date,
      side: form.side,
      quantity: Number(form.quantity),
      stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
      take_profit: form.take_profit ? Number(form.take_profit) : null,
      pnl: form.pnl ? Number(form.pnl) : null,
      entry_time: form.entry_time,
      exit_time: form.exit_time,
      emotional_state: form.emotional_state,
    });

    if (error) {
      alert('Error saving trade: ' + error.message);
    } else {
      onSuccess?.() || router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium mb-2">Market</label>
        <div className="flex gap-4 flex-wrap">
          {(['stock', 'crypto', 'forex', 'futures'] as const).map((m) => (
            <label key={m} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.market[m]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    market: { ...form.market, [m]: e.target.checked },
                  })
                }
                className="rounded"
              />
              <span className="capitalize">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            required
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Strategy</label>
          <select
            value={form.strategy_id}
            onChange={(e) => setForm({ ...form, strategy_id: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">None</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Side</label>
          <select
            value={form.side}
            onChange={(e) => setForm({ ...form, side: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option>Buy</option>
            <option>Sell</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            step="any"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stop Loss</label>
          <input
            type="number"
            step="any"
            value={form.stop_loss}
            onChange={(e) => setForm({ ...form, stop_loss: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Take Profit</label>
          <input
            type="number"
            step="any"
            value={form.take_profit}
            onChange={(e) => setForm({ ...form, take_profit: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">PnL</label>
          <input
            type="number"
            step="any"
            value={form.pnl}
            onChange={(e) => setForm({ ...form, pnl: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Entry Time</label>
          <input
            type="time"
            value={form.entry_time}
            onChange={(e) => setForm({ ...form, entry_time: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Exit Time</label>
          <input
            type="time"
            value={form.exit_time}
            onChange={(e) => setForm({ ...form, exit_time: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Emotional State</label>
          <select
            value={form.emotional_state}
            onChange={(e) => setForm({ ...form, emotional_state: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option>Neutral</option>
            <option>Greed</option>
            <option>Fear</option>
            <option>Confidence</option>
            <option>Frustration</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
      >
        Save Trade
      </button>
    </form>
  );
}
