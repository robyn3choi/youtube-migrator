import { GoogleLogin } from 'react-google-login'

export default function Login({ onSuccess }) {
  function handleSuccess(res) {
    console.log('login success: ', res.profileObj)
    onSuccess()
  }

  function handleFailure(res) {
    console.log('login failed: ', res)
  }

  return (
    <div>
      <GoogleLogin
        clientId={process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!}
        buttonText="Log in"
        onSuccess={handleSuccess}
        onFailure={handleFailure}
        cookiePolicy="single_host_origin"
        isSignedIn={true}
        prompt="consent"
      />
    </div>
  )
}
