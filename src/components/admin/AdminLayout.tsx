interface AdminLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading?: string;
}

export function AdminLayout({
  children,
  heading,
  subheading,
}: AdminLayoutProps) {
  return (
    <div className="px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        {subheading && (
          <p className="text-muted-foreground mt-2">{subheading}</p>
        )}
      </div>
      {children}
    </div>
  );
}
