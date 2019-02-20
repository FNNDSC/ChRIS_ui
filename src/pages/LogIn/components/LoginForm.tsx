import * as React from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import {
    LoginForm
} from '@patternfly/react-core';
import Client from '@fnndsc/chrisapi';

interface IState {
    usernameValue: string;
    passwordValue: string;
    isRememberMeChecked: boolean;
}

type AllProps = RouteComponentProps<any>;

class LoginFormComponent extends React.Component<AllProps, IState> {
    constructor(props: AllProps) {
        super(props);
        this.state = {
            isRememberMeChecked: true,
            passwordValue: 'chris1234',
            usernameValue: 'chris'
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // Description: Create a fake user to work with API
    handleSubmit(event: Event) {
        event.preventDefault();
        const authURL = process.env.REACT_APP_CHRIS_UI_AUTH_URL;
        const authObj = {
            password: 'chris1234',
            username: 'chris'
        };
        const promise = Client.getAuthToken(authURL, authObj.username, authObj.password)
            .then((token: string) => {
                // Set token in store
                this.props.history.push('/feeds');
            })
            .catch((error: any) => {
                console.log('Error!!!: ', error);
            });
    }

    handleUsernameChange = (value: string) => {
        this.setState({ usernameValue: value });
    }
    handlePasswordChange = (passwordValue: string) => {
        this.setState({ passwordValue });
    }

    onRememberMeClick = () => {
        this.setState({ isRememberMeChecked: !this.state.isRememberMeChecked });
    }

    render() {
        const { history } = this.props;
        console.log('render');
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
                onLoginButtonClick={this.handleSubmit}
            />
        );
    }
}

export default withRouter(LoginFormComponent);
