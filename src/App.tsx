import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom"; 
import { lazy, Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CompressTool = lazy(() => import("./pages/tools/CompressTool"));
const ResizeTool = lazy(() => import("./pages/tools/ResizeTool"));
const CropTool = lazy(() => import("./pages/tools/CropTool"));
const ConvertTool = lazy(() => import("./pages/tools/ConvertTool"));
const RemoveBgTool = lazy(() => import("./pages/tools/RemoveBgTool"));
const RotateTool = lazy(() => import("./pages/tools/RotateTool"));
const QualityTool = lazy(() => import("./pages/tools/QualityTool"));
const WatermarkTool = lazy(() => import("./pages/tools/WatermarkTool"));
const BackgroundTool = lazy(() => import("./pages/tools/BackgroundTool"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* حذفنا الـ basename هنا لأنه بيسبب مشاكل مع HashRouter في بعض إصدارات Vite */}
      <HashRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<AppLayout />}>
              {/* السطرين دول مع بعض هيحلوا مشكلة الـ 404 اللي بتظهر أول ما تفتح */}
              <Route path="/" element={<Index />} />
              <Route path="/mobile-pixie-magic" element={<Index />} />
              
              <Route path="/compress" element={<CompressTool />} />
              <Route path="/resize" element={<ResizeTool />} />
              <Route path="/crop" element={<CropTool />} />
              <Route path="/convert" element={<ConvertTool />} />
              <Route path="/remove-bg" element={<RemoveBgTool />} />
              <Route path="/rotate" element={<RotateTool />} />
              <Route path="/quality" element={<QualityTool />} />
              <Route path="/watermark" element={<WatermarkTool />} />
              <Route path="/background" element={<BackgroundTool />} />
              
              {/* أي مسار غير معرف يروح للـ NotFound */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


// npm run deploy      