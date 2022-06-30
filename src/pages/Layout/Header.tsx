import * as React from 'react'
import { Link } from 'react-router-dom'
import ToolbarComponent from './Toolbar'
import brandImg from '../../assets/images/logo_chris_dashboard.png'
import { IUserState } from '../../store/user/types'
import {
  PageHeader,
  PageHeaderTools,
  Brand,
  Badge,
} from '@patternfly/react-core'
import Moment from 'react-moment'

interface IHeaderProps {
  user: IUserState
  onNavToggle: () => void
}

const BadgeStyle = {
  marginRight: '1rem',
  display: 'inline-block',
  background: 'transparent',
  fontSize: '0.85rem',
  color: '#8b8d8f',
}

const Header: React.FC<IHeaderProps> = ({
  onNavToggle,
  user,
}: IHeaderProps) => {
  const pageToolbar = !!user.token ? (
    <PageHeaderTools>
      <ToolbarComponent />
    </PageHeaderTools>
  ) : (
    <PageHeaderTools>
      <Link to="/login">Log In</Link>
    </PageHeaderTools>
  )

  const brand = (
    <React.Fragment>
      <Brand src={brandImg} alt="ChRIS Logo" />
    </React.Fragment>
  );

  return (
    <PageHeader
      className="header"
      aria-label="Page Header"
      logo={brand}
      headerTools={pageToolbar}
      showNavToggle
      onNavToggle={onNavToggle}
    />
  )
}

export default Header
