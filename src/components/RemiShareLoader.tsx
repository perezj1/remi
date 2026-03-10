import { cn } from "@/lib/utils";

type RemiShareLoaderProps = {
  active?: boolean;
  label?: string;
  className?: string;
};

export default function RemiShareLoader({
  active = true,
  label,
  className,
}: RemiShareLoaderProps) {
  if (!active) return null;

  return (
    <div
      className={cn("remi-share-loader-overlay", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label?.trim() || "Loading"}
    >
      <div className="remi-share-loader-overlay__backdrop" />
      <div className="remi-share-loader-overlay__content">
        <div className="remi-share-loader" aria-hidden="true" />
        <div className="remi-share-loader-overlay__copy">
          <span className="remi-share-loader-overlay__brand">REMI</span>
          {label ? (
            <span className="remi-share-loader-overlay__label">{label}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
