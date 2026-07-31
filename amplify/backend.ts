import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

export const backend = defineBackend({
  auth,
  data,
  storage,
});

// Only your aunt's account should ever hold an authenticated session (it grants
// order-status and menu-management rights), so public self sign-up is disabled.
// Create her user via the Cognito console or `aws cognito-idp admin-create-user`.
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};