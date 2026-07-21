import { Grid } from "@mui/material";
import { Header } from "./components/Header";
import { Home } from "./components/Home/Home";
import { Providers } from "./components/Providers";


function App() {
  return (
    <Providers>
    <Grid container spacing={2} sx={{ height:"100vh"}}>
      <Grid size={12}>
        <Header/>
      </Grid>
      <Grid size={12}>
        <Home/>
      </Grid>
    </Grid>
    </Providers>
  );
}

export default App;
