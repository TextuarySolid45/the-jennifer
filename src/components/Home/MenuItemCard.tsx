import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
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
  onAddToOrder: (item: MenuItemRecord, flavorId?: string) => Promise<void>;
  onOpenItemMenu: (event: React.MouseEvent<HTMLElement>, itemId: string) => void;
}) => {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  const hasFlavors = item.flavors.length > 0;
  const availableFlavors = item.flavors.filter((flavor) => flavor.available);
  // An item with flavors defined is never orderable with no flavor selected —
  // it shows as unavailable rather than silently falling back to a one-tap add.
  const isUnorderable = hasFlavors && availableFlavors.length === 0;

  const media = (
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
  );

  const content = (
    <CardContent
      sx={{
        overflow: "scroll",
        maxHeight: hasFlavors ? "160px" : "200px",
        minHeight: hasFlavors ? "160px" : "200px",
      }}
    >
      <Typography variant="body2">{item.description}</Typography>
    </CardContent>
  );

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

      {hasFlavors ? (
        <Box
          sx={{
            width: "100%",
            height: "calc(100% - 56px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {media}
          {content}
          <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {isUnorderable ? (
              <Chip label="Currently unavailable" disabled sx={{ width: "100%" }} />
            ) : (
              availableFlavors.map((flavor) => (
                <Chip
                  key={flavor.id}
                  label={flavor.name}
                  clickable
                  color="primary"
                  variant="outlined"
                  onClick={async () => {
                    await onAddToOrder(item, flavor.id);
                  }}
                />
              ))
            )}
          </Box>
        </Box>
      ) : (
        <CardActionArea
          onClick={async () => {
            await onAddToOrder(item);
          }}
          sx={{ width: "100%", height: "calc(100% - 56px)" }}
        >
          {media}
          {content}
        </CardActionArea>
      )}
    </Card>
  );
};
