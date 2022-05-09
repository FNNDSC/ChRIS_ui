import React, { useContext } from 'react'
import { Card, TextInput, Button, Spinner } from '@patternfly/react-core'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { fetchResource } from '../../../../utils'
import { LibraryContext } from './context'
import { setFolders, setInitialPath } from './context/actions'

const Search = () => {
  const { dispatch, state } = useContext(LibraryContext)
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [emptySet, setEmptySet] = React.useState('')
  console.log('STATE', state)

  const handleSearch = async () => {
    setLoading(true)
    const paginate = {
      limit: 10,
      offset: 0,
      fname_icontains: value,
    }

    const client = ChrisAPIClient.getClient()
    const uploadFn = client.getUploadedFiles
    const feedfn = client.getFiles
    const servicesfn = client.getServiceFiles
    const pacsFn = client.getPACSFiles

    const boundUploadFn = uploadFn.bind(client)
    const boundFeedFn = feedfn.bind(client)
    const boundServicesFn = servicesfn.bind(client)
    const boundPacsFn = pacsFn.bind(client)

    const uploadedFiles = await fetchResource(paginate, boundUploadFn)
    const feedFiles = await fetchResource(paginate, boundFeedFn)
    const servicesFiles = await fetchResource(paginate, boundServicesFn)
    const pacsFiles = await fetchResource(paginate, boundPacsFn)
    console.log(
      'FILES',
      'UPLOADED:',
      uploadedFiles,
      'FEED:',
      feedFiles,
      'SERVICES:',
      servicesFiles,
      'PACS:',
      pacsFiles,
    )

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFolders: string[] = []
      let path = ''

      uploadedFiles.forEach((file: any) => {
        const names = file.data.fname.split('/')
        const index = names.findIndex((name: any, index: number) => {
          if (name === value) {
            return index
          }
        })

        if (index) {
          path = `${names[0]}/${names[1]}`
          const folder = index === 2 ? names[index] : names[index - 1]
          if (!uploadedFolders.includes(folder)) uploadedFolders.push(folder)
        }
      })
      dispatch(setFolders(uploadedFolders, path))
      dispatch(setInitialPath(path, 'uploads'))
    }
    if (feedFiles && feedFiles.length > 0) {
      const path = 'chris'

      const feedFolders: string[] = []
      feedFiles.forEach((file: any) => {
        const folder = file.data.fname.split('/')[1]
        if (!feedFolders.includes(folder)) feedFolders.push(folder)
      })

      dispatch(setFolders(feedFolders, path))
      dispatch(setInitialPath(path, 'feed'))
    }

    if (pacsFiles && pacsFiles.length > 0) {
      const pacsFolders: string[] = []
      const pacsDict: {
        [key: string]: string[]
      } = {}
      pacsFiles.forEach((file: any) => {
        const fileName = file.data.fname.split('/')
        const folder = fileName[3]
        const path = `${fileName[0]}/${fileName[1]}/${fileName[2]}`
        if (!pacsFolders.includes(folder)) {
          pacsFolders.push(folder)
          pacsDict[path] = folder
        }
      })

      for (const i in pacsDict) {
        dispatch(setFolders([pacsDict[i]], i))
        dispatch(setInitialPath(i, 'services'))
      }

      /*
      dispatch(setFolders(pacsFolders, 'SERVICES/PACS'))
      dispatch(setInitialPath('SERVICES/PACS', 'services'))
      */
    }

    if (
      feedFiles.length === 0 &&
      uploadedFiles.length === 0 &&
      servicesFiles.length === 0 &&
      pacsFiles.length === 0
    ) {
      setEmptySet('No dataset found')
    }
    setLoading(false)
    setValue('')
  }

  return (
    <div>
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
        <TextInput
          value={value}
          type="text"
          id="search-value"
          placeholder="Search Library"
          onChange={(value: string) => {
            setValue(value)
            setEmptySet('')
          }}
        />

        <Button
          style={{
            marginLeft: '0.5em',
          }}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Card>
      {loading && (
        <>
          <Spinner size="md" />
          <span>Fetching Search Results....</span>
        </>
      )}
      {emptySet && <div>No Dataset Found</div>}
    </div>
  )
}

export default React.memo(Search)
