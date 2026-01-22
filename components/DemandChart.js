import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DemandChart({ dataMode = 'real-time', selectedDay = 'today' }) {
    // Mock data - in real app this would come from API based on filters
    const demandData = [
        { time: '00:00', maxDemand: 1200, actualDemand: 890 },
        { time: '02:00', maxDemand: 1200, actualDemand: 750 },
        { time: '04:00', maxDemand: 1200, actualDemand: 650 },
        { time: '06:00', maxDemand: 1200, actualDemand: 980 },
        { time: '08:00', maxDemand: 1200, actualDemand: 1150 },
        { time: '10:00', maxDemand: 1200, actualDemand: 1080 },
        { time: '12:00', maxDemand: 1200, actualDemand: 1190 },
        { time: '14:00', maxDemand: 1200, actualDemand: 1240 },
        { time: '16:00', maxDemand: 1200, actualDemand: 1180 },
        { time: '18:00', maxDemand: 1200, actualDemand: 1350 },
        { time: '20:00', maxDemand: 1200, actualDemand: 1220 },
        { time: '22:00', maxDemand: 1200, actualDemand: 1010 },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <p style={{ fontWeight: 500, margin: 0 }}>{`Time: ${label}`}</p>
                    {payload.map((pld, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.25rem'
                        }}>
                            <div
                                style={{
                                    width: '0.75rem',
                                    height: '0.25rem',
                                    borderRadius: '0.125rem',
                                    backgroundColor: pld.color
                                }}
                            />
                            <span style={{ fontSize: '0.875rem' }}>
                                {pld.dataKey === 'maxDemand' ? 'Max Demand' : 'Actual Demand'}: {pld.value} kW
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Calculate statistics
    const avgActualDemand = Math.round(demandData.reduce((sum, item) => sum + item.actualDemand, 0) / demandData.length);
    const peakDemand = Math.max(...demandData.map(item => item.actualDemand));
    const demandEfficiency = Math.round((avgActualDemand / 1200) * 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Max vs Actual Demand</CardTitle>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                }}>
                    Comparison of peak demand against actual usage over time ({dataMode})
                </p>
            </CardHeader>
            <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Statistics */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)'
                            }}>
                                {avgActualDemand} kW
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                Avg Demand
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)'
                            }}>
                                {peakDemand} kW
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                Peak Demand
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)'
                            }}>
                                {demandEfficiency}%
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                Efficiency
                            </div>
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={demandData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="time"
                                    stroke="var(--text-muted)"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="var(--text-muted)"
                                    fontSize={12}
                                    domain={[0, 1400]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="maxDemand"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="Max Demand"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="actualDemand"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    name="Actual Demand"
                                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Demand Analysis */}
                    <div>
                        <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            marginBottom: '0.5rem'
                        }}>
                            Demand Analysis
                        </h4>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                backgroundColor: 'var(--background)',
                                borderRadius: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.875rem' }}>Peak Time</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>18:00 (1,350 kW)</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                backgroundColor: 'var(--background)',
                                borderRadius: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.875rem' }}>Low Demand Time</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>04:00 (650 kW)</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                backgroundColor: 'var(--background)',
                                borderRadius: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.875rem' }}>Demand Variance</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>700 kW (58.3%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
