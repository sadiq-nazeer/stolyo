import type { StoreConfig } from "@/lib/store/config";
import { storeConfigToCssVars } from "@/lib/store/config";
import type { ReactNode } from "react";

type ThemeShellProps = {
  config: StoreConfig;
  children: ReactNode;
};

export const ThemeShell = ({ config, children }: ThemeShellProps) => {
  const cssVars = storeConfigToCssVars(config);
  const style = Object.entries(cssVars).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-background text-foreground" style={style}>
      {children}
    </div>
  );
};

