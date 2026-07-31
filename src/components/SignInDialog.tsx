import { useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

const CloseOnSignIn = ({ onSignedIn }: { onSignedIn: () => void }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      onSignedIn();
    }
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
