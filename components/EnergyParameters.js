import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function EnergyParameters({ dataMode = 'real-time', selectedDevice = '' }) {
    // Mock data - in real app this would come from API
    const parameters = [
        {
            id: 'kva',
            name: 'KVA',
            fullName: 'Apparent Power',
            value: '1,245.6',
            unit: 'kVA',
            change: '+5.2%',
            trend: 'up',
            status: 'normal',
        },
        {
            id: 'kwh',
            name: 'KWH',
            fullName: 'Energy Consumption',
            value: '8,932.4',
            unit: 'kWh',
            change: '+12.8%',
            trend: 'up',
            status: 'high',
        },
        {
            id: 'kvar',
            name: 'KVAR',
            fullName: 'Reactive Power',
            value: '342.1',
            unit: 'kVAR',
            change: '-2.1%',
            trend: 'down',
            status: 'normal',
        },
        {
            id: 'pf',
            name: 'PF',
            fullName: 'Power Factor',
            value: '0.92',
            unit: '',
            change: '0.0%',
            trend: 'stable',
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
