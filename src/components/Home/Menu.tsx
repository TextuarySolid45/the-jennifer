import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Typography,
  Menu as MuiMenu,
} from "@mui/material";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { NewMenuItemModal } from "./NewMenuItemModal";
import { useState } from "react";
import { useGetItems } from "../../hooks/api/useGetItems";
import { StorageImage } from "@aws-amplify/ui-react-storage";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ConfirmModal } from "../ConfirmModal";
import { useDeleteItem } from "../../hooks/api/useDeleteItem";
import { useQueryClient } from "@tanstack/react-query";

export const Menu = () => {
  const qc = useQueryClient();
  const [openNewMenuItemModal, setOpenNewMenuItemModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItemId(null);
  };

  const { data: items, isLoading: isItemsLoading } = useGetItems();

  const { mutateAsync: deleteItem } = useDeleteItem({
    onSuccess: () => {
      setOpenConfirmModal(false);
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });

  if (isItemsLoading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Accordion sx={{ width: "100%" }} defaultExpanded>
        <AccordionSummary
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography variant="h2">Menu</Typography>
          <IconButton
            onClick={(event) => {
              setOpenNewMenuItemModal(true);
              event.stopPropagation();
            }}
          >
            <AddCircleTwoToneIcon fontSize="large" sx={{}} />
          </IconButton>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            size={12}
            container
            spacing={2}
            sx={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            {items?.data.map((item) => {
              return (
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "350px",
                    maxWidth: "500px",
                  }}
                  key={item.id}
                >
                  <CardHeader
                    title={item.name}
                    action={
                      <>
                        <IconButton
                          aria-label="settings"
                          onClick={(event) => {
                            setAnchorEl(event.currentTarget);
                            setSelectedItemId(item.id);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <MuiMenu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          slotProps={{
                            list: {},
                          }}
                        >
                          <MenuItem onClick={()=>{
                            setOpenConfirmModal(true);
                            setAnchorEl(null);
                          }}>Delete</MenuItem>
                        </MuiMenu>
                      </>
                    }
                  />
                  <CardMedia sx={{ }}>
                    <StorageImage
                      alt={item.name as string}
                      path={`items/${item.id}/image.jpg`}
                    />
                  </CardMedia>
                  <CardContent sx={{
                    overflow:'scroll',
                    maxHeight:"200px",
                    minHeight:"200px"
                  }}>
                    <Typography variant="body2">{item.description}</Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>
        </AccordionDetails>
      </Accordion>
      <NewMenuItemModal
        open={openNewMenuItemModal}
        onClose={() => {
          setOpenNewMenuItemModal(false);
        }}
      />
      <ConfirmModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        title="Confirm Delete Menu Item"
        message="Are you sure you would like to delete this menu item?"
        onConfirm={async () => {
            await deleteItem({id: selectedItemId as string});
        }}
      />
    </>
  );
};
