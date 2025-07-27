import { ThemeProvider } from "@emotion/react";
import { Poll } from "@mui/icons-material";
import { createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import "./App.less";
import Header from "./header/Header";
import Home from "./home/Home";
import Results from "./results/Results";
import { useState } from "react";
import Login from "./login/Login";
import Polls from "./polls/Polls";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2b6777",
    },
    secondary: {
      main: "#52ab98",
    },
    info: {
      main: "#c8d8e4",
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  const [token, setToken] = useState("");
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Header token={token} setToken={setToken} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/polls" element={<Polls token={token} />} />
            <Route path="/polls/:pollId" element={<Poll />} />
            <Route path="/polls/:pollId/results" element={<Results />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
