'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { supabase } from '../../../supabase/client';
import TradeModal from '@/components/TradeModal';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, [currentDate]);

  const fetchTrades = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .gte('trade_date', format(startOfMonth(currentDate), 'yyyy-MM-dd'))
      .lte('trade_date', format(endOfMonth(currentDate), 'yyyy-MM-dd'))
      .order('trade_date', { ascending: true });

    setTrades(data ?? []);
    setLoading(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tradesByDate = trades.reduce((acc, trade) => {
    const date = parseISO(trade.trade_date);
    if (!acc[format(date, 'yyyy-MM-dd')]) acc[format(date, 'yyyy-MM-dd')] = [];
    acc[format(date, 'yyyy-MM-dd')].push(trade);
    return acc;
  }, {} as Record<string, any[]>);

  const handleDateClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTrades = tradesByDate[dateStr];
    if (dayTrades?.length === 1) {
      setSelectedTrade(dayTrades[0]);
    } else if (dayTrades?.length > 1) {
      // For multiple, show first or list – simple: show modal with list
      setSelectedTrade({ multiple: dayTrades });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-metallic-silver flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Calendar - {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Link href="/log-trade" className="glass p-3 rounded-xl hover:bg-primary/20">
            <Plus className="w-5 h-5 text-metallic-silver" />
          </Link>
          {/* Nav buttons */}
          <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="glass p-2">&lt;</button>
          <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="glass p-2">&gt;</button>
        </div>
      </div>

      {loading ? (
        <div className="glass p-8 text-center text-metallic-light">Loading...</div>
      ) : (
        <div className="glass p-6 overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-semibold text-metallic-silver py-2">{day}</div>
            ))}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTrades = tradesByDate[dateStr] || [];
              const totalPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
              const isPositive = totalPnL > 0;
              const isNegative = totalPnL < 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative p-2 h-20 rounded-lg transition-all border-2
                    ${isSameDay(day, new Date()) ? 'bg-primary/20 border-primary' : ''}
                    ${isPositive ? 'border-green-400/50 bg-green-500/10' : ''}
                    ${isNegative ? 'border-red-400/50 bg-red-500/10' : 'border-metallic-dark/20 bg-white/5'}
                  `}
                >
                  <div className="text-sm font-medium text-metallic-light">{format(day, 'd')}</div>
                  {dayTrades.length > 0 && (
                    <div className={`text-xs mt-1 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-metallic-light'}`}>
                      {formatCurrency(totalPnL)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedTrade && (
        <TradeModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}
    </div>
  );
}
