'use client';

import { useState } from 'react';
import { supabase } from '../../../../supabase/client';
import { useRouter } from 'next/navigation';

export default function CreateStrategyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [rules, setRules] = useState<string[]>(['']);

  const addRule = () => setRules([...rules, '']);
  const updateRule = (i: number, v: string) => {
    const newRules = [...rules];
    newRules[i] = v;
    setRules(newRules);
  };
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const cleanRules = rules.filter((r) => r.trim());

    const { error } = await supabase.from('strategies').insert({
      user_id: user.id,
      name,
      rules: cleanRules,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/strategies');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Create Strategy
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Strategy Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rules (checkboxes in trade log)</label>
          {rules.map((r, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={r}
                onChange={(e) => updateRule(i, e.target.value)}
                placeholder="e.g. Only trade London session"
                className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              {rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRule(i)}
                  className="px-2 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRule}
            className="text-sm text-primary hover:underline"
          >
            + Add rule
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Create Strategy
        </button>
      </form>
    </div>
  );
}
