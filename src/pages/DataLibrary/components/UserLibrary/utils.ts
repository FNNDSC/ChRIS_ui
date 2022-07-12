import { setSearchedFolders } from './context/actions'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { fetchResource } from '../../../../utils'
import { Feed } from '@fnndsc/chrisapi'

export const searchFeedFiles = async (value: string) => {
  const payload = {
    limit: 10,
    offset: 0,
    files_fname_icontains: value,
  }
  const client = ChrisAPIClient.getClient()
  const fn = client.getFeeds
  const boundFn = fn.bind(client)
  try {
    const results = await fetchResource(payload, boundFn)
    return results
  } catch (error) {
    console.log('Error', error)
  }
}

export const searchPacsFiles = async (value: string) => {
  const payload = {
    limit: 10,
    offset: 0,
    fname_icontains_topdir_unique: value,
  }
  const client = ChrisAPIClient.getClient()
  const fn = client.getPACSFiles
  const boundFn = fn.bind(client)
  try {
    const results = await fetchResource(payload, boundFn)
    return results
  } catch (error) {
    console.log('Error', error)
  }
}

export const searchUploadedFiles = async (value: string) => {
  const payload = {
    limit: 10,
    offset: 0,
    fname_icontains_multiple: value,
  }
  const client = ChrisAPIClient.getClient()
  const fn = client.getUploadedFiles
  const boundFn = fn.bind(client)
  try {
    const results = await fetchResource(payload, boundFn)
    return results
  } catch (error) {
    console.log('Error', error)
  }
}

export const handleUploadedFiles = (
  uploadedFiles: any[],
  dispatch: React.Dispatch<any>,
) => {
  const uploadsDict: {
    [key: string]: { name: string; path: string }[]
  } = {}

  uploadedFiles.forEach((file: Feed) => {
    const fnameSplit = file.data.fname.split('/')
    const name = `${fnameSplit[2]}`
    const path = `${fnameSplit[0]}/${fnameSplit[1]}`
    const folder = {
      name,
      path,
    }
    if (uploadsDict[path]) {
      uploadsDict[path].push(folder)
    } else {
      uploadsDict[path] = [folder]
    }
  })

  for (const i in uploadsDict) {
    const folders = uploadsDict[i]
    dispatch(setSearchedFolders(folders, i, 'uploads'))
  }
}

export const handleFeedFiles = (
  feedFiles: any[],
  dispatch: React.Dispatch<any>,
) => {
  const feedsDict: {
    [key: string]: { name: string; path: string }[]
  } = {}

  feedFiles.forEach((feed: Feed) => {
    const name = `feed_${feed.data.id}`
    const path = `${feed.data.creator_username}`
    const folder = {
      name,
      path,
    }
    if (feedsDict[path]) {
      feedsDict[path].push(folder)
    } else {
      feedsDict[path] = [folder]
    }
  })

  for (const i in feedsDict) {
    const folders = feedsDict[i]
    dispatch(setSearchedFolders(folders, i, 'feed'))
  }
}

export const handlePacsFiles = (
  pacsFiles: any[],
  dispatch: React.Dispatch<any>,
) => {
  const pacsDict: {
    [key: string]: { name: string; path: string }[]
  } = {}
  pacsFiles.forEach((file) => {
    const fnameSplit = file.data.fname.split('/')
    const path = `${fnameSplit[0]}/${fnameSplit[1]}/${fnameSplit[2]}`
    const name = `${fnameSplit[3]}`
    const folder = {
      name,
      path,
    }
    if (pacsDict[path]) {
      pacsDict[path].push(folder)
    } else {
      pacsDict[path] = [folder]
    }
  })

  for (const i in pacsDict) {
    const folders = pacsDict[i]
    dispatch(setSearchedFolders(folders, i, 'services'))
  }
}
