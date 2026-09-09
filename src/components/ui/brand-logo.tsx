type BrandLogoProps = {
  className?: string;
  heightClass?: string;
};

export function BrandLogo({
  className = "",
  heightClass = "h-9",
}: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/db_pro_logo.svg"
      alt="The Database Providers"
      className={`${heightClass} w-auto max-w-full object-contain object-left ${className}`}
    />
  );
}
