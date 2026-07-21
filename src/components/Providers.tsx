import { createTheme, ThemeProvider } from "@mui/material";
import { Amplify } from "aws-amplify";

import { themeOptions } from "../util/theme";
import outputs from "../../amplify_outputs.json";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

Amplify.configure(outputs);

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme(themeOptions);
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
};
