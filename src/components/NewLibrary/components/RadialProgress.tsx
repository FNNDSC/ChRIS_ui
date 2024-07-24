interface ProgressRingProps {
  value: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ value }) => {
  const radius = 6;
  const circumference = radius * 2 * Math.PI;

  // Calculate dashoffset based on progress
  const dashoffset = circumference - (value / 100) * circumference;

  return (
    <svg className="progress-ring">
      <title>File Upload Progress</title>
      <circle
        className="progress-ring__circle"
        stroke="white"
        strokeWidth="2"
        r={radius}
        cy="6"
        cx="6"
        style={{
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: dashoffset,
        }}
      />
    </svg>
  );
};

export default ProgressRing;
