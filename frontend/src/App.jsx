import './App.css'
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton
} from '@clerk/clerk-react'

function App() {
  return (
    <div>
      <h1>message.</h1>

      <header>
        <Show when="signed-out">
          <SignInButton node = "modal"/>
          <SignUpButton node = "modal"/>
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </div>
  )
}

export default App
