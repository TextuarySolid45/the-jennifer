import { createTheme, ThemeProvider } from "@mui/material";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { useState } from "react";

import { themeOptions } from "../util/theme";
import outputs from "../../amplify_outputs.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

Amplify.configure(outputs);

// Created once, outside the component, since it never depends on props/state.
// (Previously this and the QueryClient below were both re-created on every
// render of Providers, which wipes every query's cache and forces the whole
// app back into a loading state whenever Providers re-renders for any
// reason — visually indistinguishable from a full page reload.)
const theme = createTheme(themeOptions);

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Authenticator.Provider>{children}</Authenticator.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
