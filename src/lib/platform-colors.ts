/** Official brand colors for each marketplace platform */
export const PLATFORM_COLORS: Record<string, string> = {
  eBay: "#0064D3",
  Poshmark: "#7F0353",
  Mercari: "#5E6DF2",
  Depop: "#FF2300",
  Etsy: "#F56400",
  "In-Person": "#9B59B6",
};

/** Tailwind utility classes for platform badges (border + bg + text) */
export const PLATFORM_BADGE: Record<string, string> = {
  eBay: "border-[#0064D3]/30 bg-[#0064D3]/10 text-[#0064D3]",
  Poshmark: "border-[#7F0353]/30 bg-[#7F0353]/10 text-[#7F0353]",
  Mercari: "border-[#5E6DF2]/30 bg-[#5E6DF2]/10 text-[#5E6DF2]",
  Depop: "border-[#FF2300]/30 bg-[#FF2300]/10 text-[#FF2300]",
  Etsy: "border-[#F56400]/30 bg-[#F56400]/10 text-[#F56400]",
  "In-Person": "border-[#9B59B6]/30 bg-[#9B59B6]/10 text-[#9B59B6]",
};
