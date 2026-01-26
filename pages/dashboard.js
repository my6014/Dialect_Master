import { useState } from 'react';
import { useRouter } from 'next/router';
import { Sidebar } from '../components/Sidebar';
import { FilterSection } from '../components/FilterSection';
import { EnergyParameters } from '../components/EnergyParameters';
import { ConsumptionChart } from '../components/ConsumptionChart';
import { DemandChart } from '../components/DemandChart';
import { Badge } from '../components/ui/badge';
import { useUser } from '../hooks/useUser';

export default function Dashboard() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedFilterType, setSelectedFilterType] = useState('device');
    const [selectedDevice, setSelectedDevice] = useState('device-1');
    const [dataMode, setDataMode] = useState('real-time');
    const [selectedDay, setSelectedDay] = useState('today');

    // 使用用户 Hook 获取真实用户信息
    const { user, isAuthenticated, getDisplayName, loading: userLoading } = useUser();

    const handleApplyFilters = () => {
        // In a real application, this would trigger data fetching
        console.log('Applying filters:', {
            filterType: selectedFilterType,
            device: selectedDevice,
            dataMode,
            selectedDay,
        });
    };

    const handleFilterTypeChange = (type) => {
        setSelectedFilterType(type);
        if (type === 'device') {
            setSelectedDevice('device-1');
        } else {
            setSelectedDevice('group-production');
        }
    };

    const handlePageChange = (pageId) => {
        // 处理页面切换
        if (pageId === 'asr') {
            router.push('/asr_test');
        } else if (pageId === 'community') {
            router.push('/community');
        } else if (pageId === 'settings') {
            router.push('/settings/profile');
        } else {
            setCurrentPage(pageId);
        }
    };

    // 获取问候语
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 6) return '夜深了';
        if (hour < 12) return '早上好';
        if (hour < 14) return '中午好';
        if (hour < 18) return '下午好';
        return '晚上好';
    };

    // 获取显示的用户名
    const displayName = isAuthenticated ? getDisplayName() : '方言学习者';

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Header Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem'
                    }}>
                        <div>
                            <h1 style={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: 'var(--text-main)',
                                margin: 0
                            }}>
                                {getGreeting()}，{displayName}！ 👋
                            </h1>
                            <p style={{
                                color: 'var(--text-muted)',
                                marginTop: '0.25rem',
                                fontSize: '0.875rem'
                            }}>
                                今天想学习什么方言呢？
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Badge variant="success" style={{
                                padding: '0.5rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    width: '0.5rem',
                                    height: '0.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '50%'
                                }} className="animate-pulse" />
                                实时监控已激活
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <FilterSection
                    selectedFilterType={selectedFilterType}
                    selectedDevice={selectedDevice}
                    dataMode={dataMode}
                    selectedDay={selectedDay}
                    onFilterTypeChange={handleFilterTypeChange}
                    onDeviceChange={setSelectedDevice}
                    onDataModeChange={setDataMode}
                    onDayChange={setSelectedDay}
                    onApplyFilters={handleApplyFilters}
                />

                {/* Energy Parameters */}
                <EnergyParameters
                    dataMode={dataMode}
                    selectedDevice={selectedDevice}
                />

                {/* Charts Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {/* Consumption Overview */}
                    <ConsumptionChart
                        selectedDay={selectedDay}
                        selectedDevice={selectedDevice}
                    />

                    {/* Max vs Actual Demand */}
                    <DemandChart dataMode={dataMode} selectedDay={selectedDay} />
                </div>
            </div>
        </div>
    );
}
