import {DynamicIcon, type IconName} from "lucide-react/dynamic";
import Card from "./cards/Card";

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        type: 'positive' | 'negative' | 'neutral';
    };
    icon?: IconName;
    className?: string;
}

export default function StatCard({
                                     label,
                                     value,
                                     trend,
                                     icon,
                                     className = ''
                                 }: StatCardProps) {
    const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
        switch (type) {
            case 'positive':
                return 'text-success';
            case 'negative':
                return 'text-error';
            case 'neutral':
                return 'text-muted';
            default:
                return 'text-muted';
        }
    };

    const getTrendIcon = (type: 'positive' | 'negative' | 'neutral'): IconName => {
        switch (type) {
            case 'positive':
                return 'trending-up';
            case 'negative':
                return 'trending-down';
            case 'neutral':
                return 'minus';
            default:
                return 'minus';
        }
    };

    return (
        <Card
            className={`stat-card ${className}`}
            header={
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted font-medium">{label}</span>
                    {icon && (
                        <div className="text-muted">
                            <DynamicIcon name={icon} size={18}/>
                        </div>
                    )}
                </div>
            }
            body={
                <div className="flex flex-direction-column gap-2">
                    <div className="text-2xl font-bold font-title">
                        {value}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs ${getTrendColor(trend.type)}`}>
                            <DynamicIcon name={getTrendIcon(trend.type)} size={12}/>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
            }
        />
    );
}