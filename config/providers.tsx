import { ReactNode, Suspense } from "react";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
      />
      {children}
    </Suspense>
  );
}
