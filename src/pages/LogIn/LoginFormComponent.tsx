import * as React from 'react';
import {
    LoginForm
} from '@patternfly/react-core';

interface IFormProps {
    // onSidebarToggle: ()=>void;
};

class LoginFormComponent extends React.Component<IFormProps> {
    handleUsernameChange = (value: string) => {
        console.log(value);
        // this.setState({ usernameValue: value });
    };
    handlePasswordChange = (passwordValue: string) => {
        console.log(passwordValue);
    };

    onRememberMeClick = () => {
        console.log('onRememberMeClick');
        //  this.setState({ isRememberMeChecked: !this.state.isRememberMeChecked });
    };

    render() {
        const mockData = {
            usernameValue: 'mock username',
            passwordValue: 'some password',
            isRememberMeChecked: false

        }
        return (
            <LoginForm
                className="login-form"
                usernameLabel="Username"
                usernameValue={mockData.usernameValue}
                onChangeUsername={this.handleUsernameChange}
                usernameHelperTextInvalid="Unknown Username"
                isValidUsername
                passwordLabel="Password"
                passwordValue={mockData.passwordValue}
                onChangePassword={this.handlePasswordChange}
                passwordHelperTextInvalid="Password Invalid"
                isValidPassword
                rememberMeLabel="Keep me logged in for 30 days."
                isRememberMeChecked={mockData.isRememberMeChecked}
                onChangeRememberMe={this.onRememberMeClick}
                rememberMeAriaLabel="Remember me Checkbox"
            />
        )
    }
}

export default LoginFormComponent;
