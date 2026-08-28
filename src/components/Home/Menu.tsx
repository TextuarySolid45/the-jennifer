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

export type FlavorRecord = {
  id: string;
  name: string;
  available: boolean;
};

export type MenuItemRecord = {
  id: string;
  name: string;
  description: string;
  flavors: FlavorRecord[];
};

export const Menu = ({
  items,
  isItemsLoading,
  onAddToOrder,
}: {
  items: MenuItemRecord[];
  isItemsLoading: boolean;
  onAddToOrder: (item: MenuItemRecord, flavorId?: string) => Promise<void>;
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
              // AccordionSummary renders as a <button>; rendering this as a <button> too
              // is invalid HTML (browser silently closes the outer button early, which
              // breaks React's assumed DOM structure). `component="span"` keeps the
              // click/keyboard/ripple behavior without the invalid nesting.
              component="span"
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
          <Grid container spacing={2.5} size={12}>
            {items.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <MenuItemCard
                  item={item}
                  canManage={canManageMenu}
                  onAddToOrder={onAddToOrder}
                  onOpenItemMenu={(event, itemId) => {
                    setAnchorEl(event.currentTarget);
                    setSelectedItemId(itemId);
                  }}
                />
              </Grid>
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
