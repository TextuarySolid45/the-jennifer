import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BakeryDiningTwoToneIcon from "@mui/icons-material/BakeryDiningTwoTone";
import { StorageImage } from "@aws-amplify/ui-react-storage";
import { useState } from "react";
import type { MenuItemRecord } from "./Menu";

export const MenuItemCard = ({
  item,
  canManage,
  onAddToOrder,
  onOpenItemMenu,
}: {
  item: MenuItemRecord;
  canManage: boolean;
  onAddToOrder: (item: MenuItemRecord) => Promise<void>;
  onOpenItemMenu: (event: React.MouseEvent<HTMLElement>, itemId: string) => void;
}) => {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "360px",
        width: "100%",
        overflow: "hidden",
      }}
      key={item.id}
    >
      <Box
        sx={{
          width: "100%",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          px: 5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </Typography>

        {canManage && (
          <IconButton
            aria-label="settings"
            onClick={(event) => {
              event.stopPropagation();
              onOpenItemMenu(event, item.id);
            }}
            sx={{
              color: "text.primary",
              backgroundColor: "background.paper",
            }}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>

      <CardActionArea
        onClick={async () => {
          await onAddToOrder(item);
        }}
        sx={{ width: "100%", height: "calc(100% - 56px)" }}
      >
        <CardMedia
          sx={{
            width: "100%",
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.paper",
            "& img": {
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            },
          }}
        >
          {imageUnavailable ? (
            <Box
              role="img"
              aria-label={`${item.name} placeholder`}
              sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <BakeryDiningTwoToneIcon sx={{ fontSize: 56, color: "primary.light" }} />
            </Box>
          ) : (
            <StorageImage
              alt={item.name as string}
              path={`items/${item.id}/image.jpg`}
              validateObjectExistence
              onGetUrlError={() => setImageUnavailable(true)}
            />
          )}
        </CardMedia>
        <CardContent
          sx={{
            overflow: "scroll",
            maxHeight: "200px",
            minHeight: "200px",
          }}
        >
          <Typography variant="body2">{item.description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
