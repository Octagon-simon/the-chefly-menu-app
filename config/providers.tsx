import { ReactNode, Suspense } from "react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)",
            padding: "12px 16px",
            fontSize: "0.9rem",
          },
          className: "toastify-like",
          duration: 5000, // auto close after 5s
        }}
        // closeButton
      />
      {children}
    </Suspense>
  );
}
