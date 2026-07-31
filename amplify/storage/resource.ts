import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "item-images",
  access: (allow) => ({
    "items/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});