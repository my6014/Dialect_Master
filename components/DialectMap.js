import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

// Dialect mapping configuration
const PROVINCE_TO_DIALECT = {
    '北京市': '北京官话',
    '天津市': '天津话（冀鲁/北京官话混合）',
    '河北省': '冀鲁官话、北京官话、晋语、中原官话',
    '山西省': '晋语、中原官话',
    '内蒙古自治区': '晋语、东北官话、蒙古语',
    '辽宁省': '东北官话、胶辽官话',
    '吉林省': '东北官话',
    '黑龙江省': '东北官话',
    '上海市': '吴语（上海话）',
    '江苏省': '江淮官话、吴语、中原官话',
    '浙江省': '吴语、闽语、徽语、官话方言岛',
    '安徽省': '中原官话、江淮官话、吴语、徽语、赣语',
    '福建省': '闽语（闽东、闽南、闽北等）、客家话、吴语、赣语',
    '江西省': '赣语、客家话、江淮官话、西南官话、吴语、徽语',
    '山东省': '冀鲁官话、中原官话、胶辽官话',
    '河南省': '中原官话、晋语',
    '湖北省': '西南官话、江淮官话、赣语',
    '湖南省': '湘语、西南官话、赣语、客家话',
    '广东省': '粤语、客家话、闽语（潮汕话、雷州话）',
    '广西壮族自治区': '西南官话、粤语（白话）、平话、客家话、壮语',
    '海南省': '闽语（海南话）、粤语、客家话、黎语',
    '重庆市': '西南官话',
    '四川省': '西南官话、客家话（少量）',
    '贵州省': '西南官话',
    '云南省': '西南官话',
    '西藏自治区': '藏语、西南官话',
    '陕西省': '中原官话、晋语、西南官话',
    '甘肃省': '中原官话、兰银官话',
    '青海省': '中原官话',
    '宁夏回族自治区': '兰银官话、中原官话',
    '新疆维吾尔自治区': '中原官话、兰银官话、维吾尔语',
    '台湾省': '闽南语、客家话、国语（普通话）、南岛语族语言',
    '香港特别行政区': '粤语、英语',
    '澳门特别行政区': '粤语、葡萄牙语'
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
        const dialectStr = PROVINCE_TO_DIALECT[provinceName];

        if (dialectStr) {
            // If multiple dialects, pick the first one for the redirect
            // Split by common delimiters like 、 / (
            const primaryDialect = dialectStr.split(/[、\/\(]/)[0].trim();
            router.push(`/dialect/${encodeURIComponent(primaryDialect)}`);
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
