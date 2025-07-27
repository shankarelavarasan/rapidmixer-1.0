import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import Login from "pages/login";
import FileUpload from "pages/file-upload";
import Dashboard from "pages/dashboard";
import AiProcessing from "pages/ai-processing";
import TemplateLibrary from "pages/template-library";
import ExportCenter from "pages/export-center";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/file-upload" element={<FileUpload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-processing" element={<AiProcessing />} />
        <Route path="/template-library" element={<TemplateLibrary />} />
        <Route path="/export-center" element={<ExportCenter />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;