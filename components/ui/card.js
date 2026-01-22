export function Card({ className = '', children, ...props }) {
    return (
        <div
            className={`card ${className}`}
            style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
                ...props.style
            }}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = '', children, ...props }) {
    return (
        <div
            className={`${className}`}
            style={{
                padding: '1.5rem 1.5rem 0.75rem',
                ...props.style
            }}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ className = '', children, ...props }) {
    return (
        <h3
            className={`${className}`}
            style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                lineHeight: 1.5,
                ...props.style
            }}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardContent({ className = '', children, ...props }) {
    return (
        <div
            className={`${className}`}
            style={{
                padding: '0 1.5rem 1.5rem',
                ...props.style
            }}
            {...props}
        >
            {children}
        </div>
    );
}
