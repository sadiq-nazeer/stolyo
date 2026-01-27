export type LinkConfig = {
  label: string;
  url: string;
};

export type StoreConfig = {
  logoUrl?: string;
  headerImageUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  itemCardSize: "small" | "medium" | "large";
  buttonSize: "sm" | "md" | "lg";
  borderRadius: "none" | "sm" | "md" | "lg" | "xl";
  customLinks: LinkConfig[];
  sections?: {
    navigation: boolean;
    hero: boolean;
    newArrivals: boolean;
    products: boolean;
    featured: boolean;
  };
};

export const defaultStoreConfig: StoreConfig = {
  itemCardSize: "medium",
  buttonSize: "md",
  borderRadius: "md",
  customLinks: [],
  sections: {
    navigation: true,
    hero: true,
    newArrivals: true,
    products: true,
    featured: true,
  },
};

export const storeConfigToCssVars = (config: StoreConfig) => {
  const radiusMap: Record<StoreConfig["borderRadius"], string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  };

  const cardSizeMap: Record<StoreConfig["itemCardSize"], string> = {
    small: "220px",
    medium: "260px",
    large: "320px",
  };

  const buttonSizeMap: Record<StoreConfig["buttonSize"], string> = {
    sm: "32px",
    md: "40px",
    lg: "48px",
  };

  return {
    "--store-primary": config.primaryColor ?? "hsl(var(--primary))",
    "--store-accent": config.accentColor ?? "hsl(var(--accent))",
    "--store-card-width": cardSizeMap[config.itemCardSize],
    "--store-button-height": buttonSizeMap[config.buttonSize],
    "--store-radius": radiusMap[config.borderRadius],
  };
};
