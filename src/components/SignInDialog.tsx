import { useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

const CloseOnSignIn = ({ onSignedIn }: { onSignedIn: () => void }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    let cancelled = false;

    // Force the Identity Pool credentials to refresh from the guest role to the
    // authenticated role right away, so the very next API call (e.g. adding a
    // menu item) isn't signed with a stale, pre-sign-in guest identity.
    fetchAuthSession({ forceRefresh: true }).finally(() => {
      if (!cancelled) {
        onSignedIn();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authStatus, onSignedIn]);

  return null;
};

export const SignInDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Authenticator hideSignUp>
        {() => <CloseOnSignIn onSignedIn={onClose} />}
      </Authenticator>
    </Dialog>
  );
};
