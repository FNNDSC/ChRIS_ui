import React from 'react'
import { LoginPage } from '@patternfly/react-core'
import '../LogIn/login.scss'
import SignUpForm from './components/SignupForm'

const SignUp = () => (
  <LoginPage className="login pf-background" loginTitle="Sign up for a new account">
    <SignUpForm />
  </LoginPage>
)

export default SignUp
