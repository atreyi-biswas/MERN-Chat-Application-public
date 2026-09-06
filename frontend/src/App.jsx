import "./App.css";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

function App() {
  const { isSignedIn } = useAuth();

  return (
    <div>
      <h1>message.</h1>

      <header>
        {!isSignedIn && (
          <>
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </>
        )}

        {isSignedIn && <UserButton />}
      </header>
    </div>
  );
}

export default App;