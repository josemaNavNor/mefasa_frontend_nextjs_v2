interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Loading({ size = 'md', className = '' }: LoadingProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2', 
        lg: 'w-16 h-16 border-4'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizeClasses[size]} border-primary border-dashed rounded-full animate-spin`}></div>
        </div>
    )
}