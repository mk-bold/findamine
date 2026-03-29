import Image from "next/image";

interface HeroBannerProps {
  src: string;
  alt: string;
  /** Optional overlay text */
  title?: string;
  subtitle?: string;
  /** Reduce height for dashboard vs landing page */
  compact?: boolean;
}

export default function HeroBanner({ src, alt, title, subtitle, compact }: HeroBannerProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-xl ${compact ? "h-36 sm:h-44" : "h-48 sm:h-64"}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
      />
      {/* Gradient overlay for text readability */}
      {(title || subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      )}
      {/* Text overlay */}
      {(title || subtitle) && (
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          {title && (
            <h1 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-white/90 text-sm sm:text-base mt-1 drop-shadow max-w-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
