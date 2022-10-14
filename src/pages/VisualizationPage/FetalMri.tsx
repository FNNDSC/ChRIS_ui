import React from 'react'
import { useDispatch } from 'react-redux'
import Wrapper from '../Layout/PageWrapper'
import { setSidebarActive } from '../../store/ui/actions'

const FetalMri = () => {
  const dispatch = useDispatch()

  React.useEffect(() => {
    document.title = 'FetalMri'
    dispatch(
      setSidebarActive({
        activeItem: 'fetalmri',
      })
    )
  }, [dispatch])
  return (
    <Wrapper>
      <div
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <iframe
          style={{
            height: '100%',
            width: '100%',
          }}
          allowFullScreen
          src="http://fetalmri.org"
          title="FetalMri"
        />
      </div>
    </Wrapper>
  )
}

export default FetalMri
