import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ApplicationState } from '../../../store/root/applicationState';
import { getAuthToken } from '../../../store/user/actions';
import { IUserState } from '../../../store/user/types';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { LoginForm } from '@patternfly/react-core';


interface IPropsFromDispatch {
    getAuthToken: typeof getAuthToken;
}

interface IState {
    usernameValue: string;
    passwordValue: string;
    isRememberMeChecked: boolean;
}

type AllProps = IPropsFromDispatch & RouteComponentProps;

class LoginFormComponent extends React.Component<AllProps, IState> {
    constructor(props: AllProps) {
        super(props);
        this.state = {
            usernameValue: 'chris',
            passwordValue: 'chris1234',
            isRememberMeChecked: true,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // Description: Create a fake user to work with API, redux store
    handleSubmit(event: Event) {
        const { getAuthToken } = this.props;
        const authObj = {
            password: this.state.passwordValue,
            username: this.state.usernameValue,
            isRememberMe: this.state.isRememberMeChecked
        };
        getAuthToken(authObj);
        event.preventDefault();
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

// export default withRouter(LoginFormComponent);
const mapDispatchToProps = (dispatch: Dispatch) => ({
    getAuthToken: (user: IUserState) => dispatch(getAuthToken(user)),
});

// const mapStateToProps = ({ ui }: ApplicationState) => ({
// });


export default withRouter(connect(
    null,
    mapDispatchToProps,
)(LoginFormComponent));
