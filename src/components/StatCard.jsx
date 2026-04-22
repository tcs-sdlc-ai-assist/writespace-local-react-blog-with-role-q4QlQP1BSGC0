import PropTypes from 'prop-types';

export function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    gray: 'text-gray-500',
  };

  const resolvedColor = color && colorClasses[color] ? color : 'blue';
  const cardClasses = colorClasses[resolvedColor];
  const iconClasses = iconColorClasses[resolvedColor];

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${cardClasses}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className={`text-4xl ${iconClasses}`}>
            <span>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'red', 'yellow', 'gray']),
};

StatCard.defaultProps = {
  icon: null,
  color: 'blue',
};