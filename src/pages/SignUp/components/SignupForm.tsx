import React from 'react'
import {Form,FormGroup,TextInput,Button} from '@patternfly/react-core'

const SignUpForm=()=>{
   const [username,setUserName]=React.useState('')
   const [email,setEmail]=React.useState('')
   const [password,setPassword]=React.useState('')
   const [confirmPassword,setConfirmPassword]=React.useState('')
   
    return(
        <Form isHorizontal>
            <FormGroup
            label="Username"
            isRequired
            fieldId="username"
            helperText="Please provide an username"
            >
                <TextInput
                value={username}
                isRequired
                type="text"
                id="chris-username"
                aria-describedby="username helper"
                name='username'
                onChange={(value:string)=>setUserName(value)}
                >
                    
                </TextInput>

            </FormGroup>

            <FormGroup 
            helperText="Please provide your email address"
            label="Email" isRequired fieldId="
            email">
                <TextInput
                value={email}
                isRequired
                type="email"
                id="chris-email"
                name="email"
                onChange={(value:string)=>setEmail(value)}
                />
            </FormGroup>

            <FormGroup 
            label="Password"
            isRequired
            fieldId="password"
            helperText="Enter your password"
            >
                <TextInput 
                value={password}
                isRequired
                type="password"
                id='chris-password'
                name='password'
                onChange={(value:string)=>setPassword(value)}
                />
            </FormGroup>
            <FormGroup label="Confirm Password"
            isRequired
            fieldId="confirmPassword"
            helperText="Confirm your password"
            >
                <TextInput
                value={confirmPassword}
                isRequired
                type='password'
                id='confirm-password'
                name='confirmPassword'
                onChange={(value:string)=>setConfirmPassword(value)}
             />
            </FormGroup>
        </Form>

    )
}

export default SignUpForm;