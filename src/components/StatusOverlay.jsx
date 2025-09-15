import { useMemo } from 'react'

export function StatusOverlay({ colors }) {
  const style = useMemo(() => {
    if (!Array.isArray(colors) || colors.length === 0) {
      return { display: 'none' };
    }


    const sequence = ['transparent', ...colors];
    const stepCount = sequence.length;
    const duration = stepCount * 0.6; // 0.6s por paso

    const gradient = `linear-gradient(90deg, ${sequence.join(', ')})`;

    return {
      '--step-count': stepCount,
      '--duration': `${duration}s`,
      '--gradient': gradient,
    }
  }, [colors])

  return (
    <div className="status-overlay" style={style}>
      <div className="status-overlay-inner" />
    </div>
  )
}