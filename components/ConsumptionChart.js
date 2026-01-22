import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function ConsumptionChart({ selectedDay = 'today', selectedDevice = '' }) {
    // Mock data - in real app this would come from API based on filters
    const consumptionData = [
        { name: 'Device 1 - Main Building', value: 2400, color: '#22c55e' },
        { name: 'Device 2 - Manufacturing', value: 4567, color: '#16a34a' },
        { name: 'Device 3 - Office Block', value: 1890, color: '#15803d' },
        { name: 'HVAC Systems', value: 3210, color: '#166534' },
        { name: 'Lighting', value: 1250, color: '#14532d' },
        { name: 'Equipment', value: 2100, color: '#052e16' },
    ];

    const totalConsumption = consumptionData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / totalConsumption) * 100).toFixed(1);
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <p style={{ fontWeight: 500, margin: 0 }}>{data.name}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                        {data.value.toLocaleString()} kWh ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '1rem'
            }}>
                {payload.map((entry, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <div
                            style={{
                                width: '0.75rem',
                                height: '0.75rem',
                                borderRadius: '50%',
                                backgroundColor: entry.color
                            }}
                        />
                        <span>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Energy Consumption Overview</CardTitle>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                }}>
                    Distribution of energy consumption across all live devices for {selectedDay}
                </p>
            </CardHeader>
            <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Total Consumption Summary */}
                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <div style={{
                            fontSize: '1.875rem',
                            fontWeight: 700,
                            color: 'var(--text-main)'
                        }}>
                            {totalConsumption.toLocaleString()}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            Total kWh consumption
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={consumptionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {consumptionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={<CustomLegend />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Device Status List */}
                    <div style={{ marginTop: '1rem' }}>
                        <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            marginBottom: '0.5rem'
                        }}>
                            Device Status
                        </h4>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            {consumptionData.slice(0, 3).map((device, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--background)',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <div
                                            style={{
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                borderRadius: '50%',
                                                backgroundColor: device.color
                                            }}
                                        />
                                        <span style={{ fontSize: '0.875rem' }}>{device.name}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}>
                                            {device.value.toLocaleString()} kWh
                                        </span>
                                        <div
                                            style={{
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                backgroundColor: '#22c55e',
                                                borderRadius: '50%'
                                            }}
                                            title="Active"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
