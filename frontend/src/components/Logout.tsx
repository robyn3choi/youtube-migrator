import { GoogleLogout } from 'react-google-login'

const clientId = process.env.NODE_PUBLIC_OATH_CLIENT_ID!

export default function Login() {
  function handleSuccess() {
    console.log('successfully logged out')
  }

  return (
    <div>
      <GoogleLogout
        clientId={process.env.NODE_PUBLIC_OATH_CLIENT_ID!}
        buttonText="Log out"
        onLogoutSuccess={handleSuccess}
      />
    </div>
  )
}
