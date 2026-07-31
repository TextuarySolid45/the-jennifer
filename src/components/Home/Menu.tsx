import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Grid,
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  Typography,
} from "@mui/material";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { NewMenuItemModal } from "./NewMenuItemModal";
import { UpdateMenuItemModal } from "./UpdateMenuItemModal";
import { useMemo, useState } from "react";
import { ConfirmModal } from "../ConfirmModal";
import { useDeleteItem } from "../../hooks/api/useDeleteItem";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { MenuItemCard } from "./MenuItemCard";

export type MenuItemRecord = {
  id: string;
  name: string;
  description: string;
};

export const Menu = ({
  items,
  isItemsLoading,
  onAddToOrder,
}: {
  items: MenuItemRecord[];
  isItemsLoading: boolean;
  onAddToOrder: (item: MenuItemRecord) => Promise<void>;
}) => {
  const qc = useQueryClient();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const canManageMenu = authStatus === "authenticated";
  const [openNewMenuItemModal, setOpenNewMenuItemModal] = useState(false);
  const [openUpdateMenuItemModal, setOpenUpdateMenuItemModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { mutateAsync: deleteItem } = useDeleteItem({
    onSuccess: () => {
      setOpenConfirmModal(false);
      setSelectedItemId(null);
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
            "& .MuiAccordionSummary-content": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            },
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "3rem" } }}>Menu</Typography>
          {canManageMenu && (
            <IconButton
              onClick={(event) => {
                setOpenNewMenuItemModal(true);
                event.stopPropagation();
              }}
            >
              <AddCircleTwoToneIcon fontSize="large" />
            </IconButton>
          )}
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
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                canManage={canManageMenu}
                onAddToOrder={onAddToOrder}
                onOpenItemMenu={(event, itemId) => {
                  setAnchorEl(event.currentTarget);
                  setSelectedItemId(itemId);
                }}
              />
            ))}

            <MuiMenu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  setOpenUpdateMenuItemModal(true);
                  setAnchorEl(null);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpenConfirmModal(true);
                  setAnchorEl(null);
                }}
              >
                Delete
              </MenuItem>
            </MuiMenu>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <NewMenuItemModal
        open={openNewMenuItemModal}
        onClose={() => {
          setOpenNewMenuItemModal(false);
        }}
      />
      <UpdateMenuItemModal
        open={openUpdateMenuItemModal}
        onClose={() => {
          setOpenUpdateMenuItemModal(false);
          setSelectedItemId(null);
        }}
        item={selectedItem}
      />
      <ConfirmModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        title="Confirm Delete Menu Item"
        message="Are you sure you would like to delete this menu item?"
        onConfirm={async () => {
          await deleteItem({ id: selectedItemId as string });
        }}
      />
    </>
  );
};
