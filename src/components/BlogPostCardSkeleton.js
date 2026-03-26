export default function BlogPostCardSkeleton() {
  return (
    <div className="block min-w-[400px] lg:flex-[0_0_calc(33.333%-1.5rem)] lg:max-w-[450px]">
      <div
        className="relative rounded-lg overflow-hidden flex flex-col h-[480px] w-full animate-pulse"
        style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
      >
        <div className="relative flex-1 flex flex-col px-26 py-15 z-10 min-h-0 box-border overflow-hidden gap-3">
          {/* Category badge */}
          <div className="h-6 w-20 rounded-full bg-white/20" />

          {/* Image placeholder */}
          <div className="w-full h-32 rounded-lg bg-white/15" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-white/20" />
            <div className="h-4 w-3/4 rounded bg-white/20" />
          </div>

          {/* Excerpt */}
          <div className="space-y-2 flex-1">
            <div className="h-3 w-full rounded bg-white/15" />
            <div className="h-3 w-full rounded bg-white/15" />
            <div className="h-3 w-2/3 rounded bg-white/15" />
          </div>

          {/* Date */}
          <div className="border-t border-white/20 pt-3 flex justify-end">
            <div className="h-3 w-24 rounded bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
