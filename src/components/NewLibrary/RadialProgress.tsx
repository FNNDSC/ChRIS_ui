import { useState, useEffect } from "react";
import styles from "./RadialProgress.module.css";

const RadialProgress = ({ value }: { value: number }) => {
  const radius = 6;
  const circumference = radius * 2 * Math.PI;
  const [dashoffset, setDashOffset] = useState(circumference);

  const setProgress = (percent: number) => {
    setDashOffset(circumference - (percent / 100) * circumference);
  };

  useEffect(() => {
    setProgress(value);
  }, []);

  return (
    <svg className="progress-ring" width="24" height="24">
      <title>File Download Progress</title>
      <circle
        className={styles.progressRingCircle}
        stroke="white"
        strokeWidth="2"
        r={radius}
        cy="12"
        cx="12"
        style={{
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: dashoffset,
        }}
      />
    </svg>
  );
};

export default RadialProgress;
