import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Poll from "./poll/Poll.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Results from "./results/Results.tsx";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/polls/:pollId" element={<Poll />} />
        <Route path="/polls/:pollId/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
