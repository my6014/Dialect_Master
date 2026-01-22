export function Badge({ variant = 'primary', className = '', children, ...props }) {
    const variantStyles = {
        primary: 'badge-primary',
        secondary: 'badge-secondary',
        success: 'badge-success',
        destructive: 'badge-destructive',
        default: 'badge-primary'
    };

    return (
        <span
            className={`badge ${variantStyles[variant] || variantStyles.default} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
