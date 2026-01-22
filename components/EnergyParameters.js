import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function EnergyParameters({ dataMode = 'real-time', selectedDevice = '' }) {
    // Mock data - in real app this would come from API
    const parameters = [
        {
            id: 'study-time',
            name: '学习时长',
            fullName: '累计学习时间',
            value: '245.6',
            unit: '小时',
            change: '+15.2%',
            trend: 'up',
            status: 'optimal',
        },
        {
            id: 'practice-count',
            name: '练习次数',
            fullName: '累计练习次数',
            value: '1,832',
            unit: '次',
            change: '+22.8%',
            trend: 'up',
            status: 'high',
        },
        {
            id: 'accuracy',
            name: '准确率',
            fullName: '发音准确率',
            value: '87.5',
            unit: '%',
            change: '+3.2%',
            trend: 'up',
            status: 'normal',
        },
        {
            id: 'progress',
            name: '学习进度',
            fullName: '课程完成度',
            value: '68',
            unit: '%',
            change: '+5.0%',
            trend: 'up',
            status: 'optimal',
        },
    ];

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={16} />;
            case 'down':
                return <TrendingDown size={16} />;
            default:
                return <Minus size={16} />;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'high':
                return 'destructive';
            case 'optimal':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up':
                return 'var(--sidebar-primary)';
            case 'down':
                return 'var(--chart-red)';
            default:
                return 'rgba(255, 255, 255, 0.7)';
        }
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
        }}>
            {parameters.map((param) => (
                <div
                    key={param.id}
                    className="energy-card"
                    style={{
                        animation: 'fadeIn 0.5s ease-out'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem'
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--sidebar-foreground)'
                        }}>
                            {param.name}
                        </div>
                        <Badge variant={getStatusVariant(param.status)}>
                            {param.status}
                        </Badge>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.25rem'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: 'var(--sidebar-foreground)'
                            }}>
                                {param.value}
                            </div>
                            {param.unit && (
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'rgba(255, 255, 255, 0.7)'
                                }}>
                                    {param.unit}
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.7)'
                            }}>
                                {param.fullName}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                color: getTrendColor(param.trend)
                            }}>
                                {getTrendIcon(param.trend)}
                                {param.change}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
