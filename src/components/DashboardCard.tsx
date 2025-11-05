interface Props {
  title: string;
  value: string;
}

export default function DashboardCard({ title, value }: Props) {
  const isNegative = value.startsWith('-');
  const textColor = isNegative ? 'text-red-500' : 'text-gray-900 dark:text-gray-100';

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <p className={`mt-2 text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
