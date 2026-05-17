export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-[hsl(var(--primary)/0.2)] rounded-full" />
          <div className="absolute top-0 left-0 w-10 h-10 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Cargando...</p>
      </div>
    </div>
  );
}
