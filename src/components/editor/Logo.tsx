interface LogoProps {
  size?: "sm" | "lg";
}

export function Logo({ size = "sm" }: LogoProps) {
  const textClass = size === "lg" ? "text-4xl" : "text-xl";

  return (
    <span
      className={`${textClass} select-none`}
      style={{ fontFamily: "'Cherry Bomb One', cursive" }}
    >
      <span className="text-[#e759d2]">ts</span>
      <span className="text-gray-200">illy</span>
    </span>
  );
}
