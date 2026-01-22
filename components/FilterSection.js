import { Badge } from './ui/badge';

export function FilterSection({
    selectedFilterType = 'device',
    selectedDevice = 'device-1',
    dataMode = 'real-time',
    selectedDay = 'today',
    onFilterTypeChange,
    onDeviceChange,
    onDataModeChange,
    onDayChange,
    onApplyFilters
}) {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                alignItems: 'end'
            }}>
                {/* Filter Type */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        color: 'var(--text-main)'
                    }}>
                        Filter Type
                    </label>
                    <select
                        className="input"
                        value={selectedFilterType}
                        onChange={(e) => onFilterTypeChange && onFilterTypeChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="device">Individual Device</option>
                        <option value="virtual-group">Virtual Group</option>
                    </select>
                </div>

                {/* Select Device */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        color: 'var(--text-main)'
                    }}>
                        Select Device
                    </label>
                    <select
                        className="input"
                        value={selectedDevice}
                        onChange={(e) => onDeviceChange && onDeviceChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="device-1">Main Building - Floor 1</option>
                        <option value="device-2">Manufacturing Unit</option>
                        <option value="device-3">Office Block</option>
                    </select>
                </div>

                {/* Data Mode */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        color: 'var(--text-main)'
                    }}>
                        Data Mode
                    </label>
                    <select
                        className="input"
                        value={dataMode}
                        onChange={(e) => onDataModeChange && onDataModeChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="real-time">Real-Time</option>
                        <option value="historical">Historical</option>
                    </select>
                </div>

                {/* Time Period */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        color: 'var(--text-main)'
                    }}>
                        Time Period
                    </label>
                    <select
                        className="input"
                        value={selectedDay}
                        onChange={(e) => onDayChange && onDayChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last-7-days">Last 7 Days</option>
                        <option value="last-30-days">Last 30 Days</option>
                    </select>
                </div>

                {/* Apply Filter Button */}
                <div>
                    <button
                        onClick={onApplyFilters}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--sidebar-primary)',
                            color: 'var(--sidebar-primary-foreground)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(123, 220, 147, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Apply Filter
                    </button>
                </div>
            </div>
        </div>
    );
}
