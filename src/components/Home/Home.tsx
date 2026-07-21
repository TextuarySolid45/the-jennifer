import { Grid, Typography } from "@mui/material";
import { Menu } from "./Menu";
export const Home = () => {

  return (
    <Grid container sx={{display:'flex',justifyContent:'start', alignItems:"start"}}>

      <Menu/>

      <Grid size={12} sx={{display:'flex',justifyContent:'start', alignItems:"center"}}><Typography variant="h2">Orders</Typography></Grid>

      <Grid size={12} sx={{display:'flex',justifyContent:'start', alignItems:"center"}}><Typography variant="h2">Past Orders</Typography></Grid>

      {/* List of Menu with pics 
      
        current orders in like a jira style board 
        All can edit the order in a modal but only aunt jen can change status of order 
      

        Only aunt jen can access 
            can update menu items and descriptions 
      
      

            Can place a order
      
        items = list of items 
        location = location of the delivery
        name of person who placed order
      */}
    </Grid>
  );
};
