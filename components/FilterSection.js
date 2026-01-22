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
                        筛选类型
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
                        <option value="device">单个方言</option>
                        <option value="virtual-group">方言组</option>
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
                        选择方言
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
                        <option value="device-1">粤语 - 广州话</option>
                        <option value="device-2">闽南语 - 厦门话</option>
                        <option value="device-3">吴语 - 上海话</option>
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
                        数据模式
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
                        <option value="real-time">实时数据</option>
                        <option value="historical">历史数据</option>
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
                        时间范围
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
                        <option value="today">今天</option>
                        <option value="yesterday">昨天</option>
                        <option value="last-7-days">近 7 天</option>
                        <option value="last-30-days">近 30 天</option>
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
                        应用筛选
                    </button>
                </div>
            </div>
        </div>
    );
}
