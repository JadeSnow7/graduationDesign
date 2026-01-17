/**
 * SummaryCard - Animated summary card for overview stats
 * 
 * Features:
 * - Count-up animation for numbers
 * - Progress ring for percentages
 * - Hover effects
 * - Click action support
 */

import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import './SummaryCard.css';

interface SummaryCardProps {
    title: string;
    value: number;
    format?: 'number' | 'percent';
    icon?: React.ReactNode;
    subtitle?: string;
    onClick?: () => void;
    color?: 'blue' | 'green' | 'purple' | 'orange';
    loading?: boolean;
}

export function SummaryCard({
    title,
    value,
    format = 'number',
    icon,
    subtitle,
    onClick,
    color = 'blue',
    loading = false,
}: SummaryCardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const animationRef = useRef<number | undefined>(undefined);

    // Count-up animation
    useEffect(() => {
        if (loading) return;

        const duration = 300;
        const startTime = performance.now();
        const startValue = displayValue;
        const endValue = value;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out curve
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * eased;

            setDisplayValue(current);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value, loading]);

    const formatValue = () => {
        if (loading) return '...';
        if (format === 'percent') {
            return `${Math.round(displayValue * 100)}%`;
        }
        return Math.round(displayValue).toString();
    };

    return (
        <div
            className={clsx(
                'summary-card',
                `summary-card-${color}`,
                onClick && 'summary-card-clickable'
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="summary-card-header">
                {icon && <div className="summary-card-icon">{icon}</div>}
                <span className="summary-card-title">{title}</span>
            </div>

            <div className="summary-card-value-container">
                {format === 'percent' ? (
                    <div className="summary-card-ring-container">
                        <svg className="summary-card-ring" viewBox="0 0 36 36">
                            <path
                                className="summary-card-ring-bg"
                                d="M18 2.0845
                                   a 15.9155 15.9155 0 0 1 0 31.831
                                   a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={`summary-card-ring-progress summary-card-ring-${color}`}
                                strokeDasharray={`${displayValue * 100}, 100`}
                                d="M18 2.0845
                                   a 15.9155 15.9155 0 0 1 0 31.831
                                   a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <span className="summary-card-ring-value">{formatValue()}</span>
                    </div>
                ) : (
                    <span className="summary-card-value">{formatValue()}</span>
                )}
            </div>

            {subtitle && (
                <p className="summary-card-subtitle">{subtitle}</p>
            )}
        </div>
    );
}
