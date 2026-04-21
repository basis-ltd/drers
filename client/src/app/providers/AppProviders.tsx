import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "../store";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "font-sans bg-white text-[11px]! border border-border text-foreground shadow-md",
            title: "text-[13px] font-normal text-primary!",
          },
        }}
      />
    </Provider>
  );
}
