import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DemandChart({ dataMode = 'real-time', selectedDay = 'today' }) {
    // Mock data - in real app this would come from API based on filters
    const demandData = [
        { time: '00:00', maxDemand: 100, actualDemand: 45 },
        { time: '02:00', maxDemand: 100, actualDemand: 38 },
        { time: '04:00', maxDemand: 100, actualDemand: 32 },
        { time: '06:00', maxDemand: 100, actualDemand: 48 },
        { time: '08:00', maxDemand: 100, actualDemand: 65 },
        { time: '10:00', maxDemand: 100, actualDemand: 72 },
        { time: '12:00', maxDemand: 100, actualDemand: 68 },
        { time: '14:00', maxDemand: 100, actualDemand: 75 },
        { time: '16:00', maxDemand: 100, actualDemand: 82 },
        { time: '18:00', maxDemand: 100, actualDemand: 88 },
        { time: '20:00', maxDemand: 100, actualDemand: 92 },
        { time: '22:00', maxDemand: 100, actualDemand: 85 },
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
                                {pld.dataKey === 'maxDemand' ? '目标进度' : '实际进度'}: {pld.value}%
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
    const demandEfficiency = Math.round((avgActualDemand / 100) * 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle>学习进度趋势</CardTitle>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                }}>
                    目标进度与实际学习进度对比 ({dataMode})
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
                                {avgActualDemand}%
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                平均进度
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--text-main)'
                            }}>
                                {peakDemand}%
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                最高进度
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
                                完成率
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
                                    domain={[0, 100]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="maxDemand"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="目标进度"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="actualDemand"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    name="实际进度"
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
                            学习进度分析
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
                                <span style={{ fontSize: '0.875rem' }}>学习高峰时段</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>20:00 (92%)</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                backgroundColor: 'var(--background)',
                                borderRadius: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.875rem' }}>学习低谷时段</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>04:00 (32%)</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                backgroundColor: 'var(--background)',
                                borderRadius: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.875rem' }}>进度波动</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>60% (54个百分点)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
