import { GoogleLogout } from 'react-google-login'

export default function Login() {
  function handleSuccess() {
    console.log('successfully logged out')
  }

  return (
    <div>
      <GoogleLogout
        clientId={process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!}
        buttonText="Log out"
        onLogoutSuccess={handleSuccess}
      />
    </div>
  )
}
