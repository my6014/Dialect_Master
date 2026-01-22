import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { FilterSection } from '../components/FilterSection';
import { EnergyParameters } from '../components/EnergyParameters';
import { ConsumptionChart } from '../components/ConsumptionChart';
import { DemandChart } from '../components/DemandChart';
import { Badge } from '../components/ui/badge';

export default function Dashboard() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedFilterType, setSelectedFilterType] = useState('device');
    const [selectedDevice, setSelectedDevice] = useState('device-1');
    const [dataMode, setDataMode] = useState('real-time');
    const [selectedDay, setSelectedDay] = useState('today');

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
            window.location.href = '/asr_test';
        } else {
            setCurrentPage(pageId);
        }
    };

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
                                你好，方言学习者！ 👋
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
