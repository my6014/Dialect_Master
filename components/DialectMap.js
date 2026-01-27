import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

// Dialect mapping configuration
const PROVINCE_TO_DIALECT = {
    '广东省': '粤语',
    '香港特别行政区': '粤语',
    '澳门特别行政区': '粤语',
    '四川省': '四川话',
    '重庆市': '四川话',
    '辽宁省': '东北话',
    '吉林省': '东北话',
    '黑龙江省': '东北话',
    '上海市': '上海话',
    '江苏省': '苏州话', // Simplified
    '浙江省': '温州话', // Simplified
    '福建省': '闽南语',
    '台湾省': '闽南语',
    '湖南省': '湖南话',
    '河南省': '河南话',
    '山东省': '山东话',
    '陕西省': '陕西话',
    '湖北省': '武汉话',
    '天津市': '天津话',
    '山西省': '山西话',
    '江西省': '赣语',
    '安徽省': '客家话', // Very rough approximation for demo
    '河北省': '方言',
    '北京市': '北京话',
    // Add default fallback for others
};

export function DialectMap() {
    const router = useRouter();
    const [geoJson, setGeoJson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch China GeoJSON
        const fetchGeoJson = async () => {
            try {
                const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
                const data = await response.json();
                echarts.registerMap('china', data);
                setGeoJson(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load map data:', error);
                setLoading(false);
            }
        };

        fetchGeoJson();
    }, []);

    const onChartClick = (params) => {
        const provinceName = params.name;
        const dialect = PROVINCE_TO_DIALECT[provinceName];

        if (dialect) {
            router.push(`/dialect/${encodeURIComponent(dialect)}`);
        } else {
            // Default to community or show toast? Just go to community for now
            router.push('/community');
        }
    };

    const getOption = () => {
        // Prepare data for the map
        const data = Object.keys(PROVINCE_TO_DIALECT).map(province => ({
            name: province,
            value: 1, // Dummy value for visual map
            dialect: PROVINCE_TO_DIALECT[province]
        }));

        return {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    const dialect = PROVINCE_TO_DIALECT[params.name] || '多种方言';
                    return `${params.name}<br/>主要方言: <b>${dialect}</b><br/><span style="font-size:10px;color:#aaa">点击查看详情</span>`;
                },
                backgroundColor: 'rgba(50, 50, 50, 0.9)',
                borderColor: '#7bdc93',
                textStyle: {
                    color: '#fff'
                }
            },
            visualMap: {
                show: false,
                min: 0,
                max: 1,
                inRange: {
                    color: ['#2c5f4e', '#3d7a64', '#7bdc93'] // Gradient from dark green to light green
                }
            },
            geo: {
                map: 'china',
                roam: true, // Allow zooming
                zoom: 1.2,
                label: {
                    show: false, // Hide province names to keep it clean
                    color: '#fff'
                },
                itemStyle: {
                    areaColor: '#1a1a2e', // Background color for regions
                    borderColor: '#2c5f4e', // Border color
                    borderWidth: 1
                },
                emphasis: {
                    label: {
                        show: true,
                        color: '#fff'
                    },
                    itemStyle: {
                        areaColor: '#7bdc93', // Highlight color
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                select: {
                    itemStyle: {
                        areaColor: '#7bdc93'
                    }
                }
            },
            series: [
                {
                    name: '方言分布',
                    type: 'map',
                    geoIndex: 0, // Use the configuration from 'geo' component
                    data: data
                }
            ]
        };
    };

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>🇨🇳 中国方言地图 (点击探索)</CardTitle>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                }}>
                    探索不同地区的特色方言，点击地图区域进入详情
                </p>
            </CardHeader>
            <CardContent>
                <div style={{ height: '500px', width: '100%', borderRadius: '1rem', overflow: 'hidden', background: '#111827' }}>
                    {loading ? (
                        <div style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8'
                        }}>
                            加载地图数据中...
                        </div>
                    ) : (
                        <ReactECharts
                            option={getOption()}
                            style={{ height: '100%', width: '100%' }}
                            onEvents={{
                                'click': onChartClick
                            }}
                            theme="dark" // Use dark theme for ECharts
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
