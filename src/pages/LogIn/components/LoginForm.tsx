import * as React from 'react';
import {
    LoginForm
} from '@patternfly/react-core';


interface State{
    usernameValue: string;
    passwordValue: string;
    isRememberMeChecked: boolean;
}

class LoginFormComponent extends React.Component<{}, State> {
    constructor(props:{}) {
        super(props);
        this.state = {
            usernameValue: 'jonhsmith',
            passwordValue: 'password',
            isRememberMeChecked: true
        }
      }
    handleUsernameChange = (value: string) => {
        this.setState({ usernameValue: value });
    };
    handlePasswordChange = (passwordValue: string) => {
        this.setState({ passwordValue });
    };

    onRememberMeClick = () => {
        this.setState({ isRememberMeChecked: !this.state.isRememberMeChecked });
    };

    render() {
        return (
            <LoginForm
                className="login-form"
                usernameLabel="Username"
                usernameValue={this.state.usernameValue}
                onChangeUsername={this.handleUsernameChange}
                usernameHelperTextInvalid="Unknown Username"
                isValidUsername
                passwordLabel="Password"
                passwordValue={this.state.passwordValue}
                onChangePassword={this.handlePasswordChange}
                passwordHelperTextInvalid="Password Invalid"
                isValidPassword
                rememberMeLabel="Keep me logged in for 30 days."
                isRememberMeChecked={this.state.isRememberMeChecked}
                onChangeRememberMe={this.onRememberMeClick}
                rememberMeAriaLabel="Remember me Checkbox"
            />
        )
    }
}

export default LoginFormComponent;
