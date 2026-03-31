'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-border">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground font-medium mt-1.5 md:text-base text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center">{action}</div>}
    </div>
  );
}
