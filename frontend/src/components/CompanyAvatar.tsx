// Renders a colored circular avatar with the company's initial letter.
// Color is derived deterministically from the company name so it's
// always consistent for the same company across cards and detail views.

interface Props {
  company: string;
  size?: "sm" | "md" | "lg";
}

const PALETTES = [
  { bg: "#EAEBFC", fg: "#6D83DD" },
  { bg: "#F0EBFC", fg: "#806ed3" },
  { bg: "#EBEAF3", fg: "#6a698c" },
  { bg: "#EFF3F2", fg: "#5a9a7a" },
  { bg: "#ffeffe", fg: "#c06fc0" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#D1FAE5", fg: "#065F46" },
  { bg: "#DBEAFE", fg: "#1E40AF" },
];

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-xl",
};

export default function CompanyAvatar({ company, size = "md" }: Props) {
  const idx = company.charCodeAt(0) % PALETTES.length;
  const { bg, fg } = PALETTES[idx];
  const initial = company[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-lg flex items-center justify-center font-bold flex-shrink-0`}
      style={{ backgroundColor: bg, color: fg }}
    >
      {initial}
    </div>
  );
}
