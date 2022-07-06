import {
  setFolders,
  setCurrentPath,
  setCurrentPathSearch,
  setPaginatedFolders,
  setPagination,
} from './context/actions'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { fetchResource } from '../../../../utils'
import { Feed } from '@fnndsc/chrisapi'
import { StringOptions } from 'sass'

const lookDeeper = async (
  path: string,
  value: string,
  maxDepth: number,
  type: string,
) => {
  const client = ChrisAPIClient.getClient()
  const results: string[] = []
  if (maxDepth < 0) return []
  const subpaths = await client.getFileBrowserPath(path)

  if (
    subpaths &&
    subpaths.data &&
    subpaths.data.subfolders &&
    subpaths.data.subfolders.length > 0
  ) {
    const subfolders = subpaths.data.subfolders
    let folders

    folders = subfolders.split(',')
    if (maxDepth === 5 && type === 'feed') {
      folders = folders.filter((folder: string) => folder !== 'uploads')
    }

    if (maxDepth === 5 && type === 'pacs') {
      folders = folders.filter((folder: string) => folder === 'SERVICES')
    }

    if (folders.length > 0) {
      for (let i = 0; i < folders.length; i++) {
        const lowerCaseValue = folders[i].toLowerCase()
        if (lowerCaseValue === value || lowerCaseValue.includes(value)) {
          if (type === 'feed') results.push(`${path}/${folders[i]}`)
          if (type === 'pacs') results.push(`${path}/${folders[i]}`)
          if (type === 'uploads') results.push(`${path}/${folders[i]}`)
        }
      }

      for (let i = 0; i < folders.length; i++) {
        const newPath =
          maxDepth === 5 && type === 'pacs'
            ? `${folders[i]}`
            : `${path}/${folders[i]}`
        const recursed: string[] = await lookDeeper(
          newPath,
          value,
          maxDepth - 1,
          type,
        )
        results.push(...recursed)
      }
    }
  }

  return results
}

export const searchFeedFiles = async (value: string, path: string) => {
  const payload = {
    limit: 10,
    offset: 0,
    files_fname_icontains: value,
  }
  const client = ChrisAPIClient.getClient()
  const fn = client.getFeeds
  const boundFn = fn.bind(client)
  const results = await fetchResource<Feed[]>(payload, boundFn)

  return results
}

export const searchPacsFiles = async (value: string, path: string) => {
  const payload = {
    limit: 10,
    offset: 0,
    fname_icontains_topdir_unique: value,
  }
  const client = ChrisAPIClient.getClient()
  const fn = client.getPACSFiles
  const boundFn = fn.bind(client)
  const results = await fetchResource(payload, boundFn)

  return results
}

export const searchUploadedFiles = async (value: string, path: string) => {
  const maxDepth = 5
  const results = await lookDeeper(path, value, maxDepth, 'uploads')
  return results
}

export const handleUploadedFiles = (
  uploadedFiles: any[],
  dispatch: React.Dispatch<any>,
  value: string,
) => {
  const uploadedFolders: string[] = []
  let path = ''

  uploadedFiles.forEach((file: any) => {
    const names = file.split('/')

    const index = names.findIndex((name: any, index: number) => {
      if (name.toLowerCase() === value.toLowerCase()) {
        return index
      }
    })

    if (index !== -1) {
      path = `${names[0]}/${names[1]}`
      const folder = index === 2 ? names[index] : names[index - 1]
      if (!uploadedFolders.includes(folder)) uploadedFolders.push(folder)
    }
  })

  if (uploadedFolders.length > 0) {
    dispatch(setFolders(uploadedFolders, path))
    dispatch(setCurrentPath(path, 'uploads'))
    dispatch(setPaginatedFolders([], path))
    dispatch(
      setPagination(path, {
        hasNext: false,
        limit: 30,
        offset: 0,
        totalCount: 0,
      }),
    )
  }
}

export const handleFeedFiles = (
  feedFiles: any[],
  dispatch: React.Dispatch<any>,
  username: string,
) => {
  const feedFolders: {
    name: string
    path: string
  }[] = []
  const paths: string[] = []
  const feedsDict: {
    [key: string]: {
      name: string
      path: string
    }[]
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
      paths.push(path)
    }
  })

  for (const i in feedsDict) {
    dispatch(setFolders(feedsDict[i], i))
  }
  dispatch(setCurrentPathSearch(paths, 'feed'))
}

export const handlePacsFiles = (
  pacsFiles: any[],
  dispatch: React.Dispatch<any>,
) => {
  console.log('PACSFILES', pacsFiles)
  const paths: string[] = []
  const pacsDict: {
    [key: string]: {
      name: string
      path: string
    }[]
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
      paths.push(path)
    }
  })

  console.log('PACSDICT', pacsDict, paths)

  for (const i in pacsDict) {
    dispatch(setFolders(pacsDict[i], i))
  }
  dispatch(setCurrentPathSearch(paths, 'services'))

  /*
  if (paths.length > 0) {
    dispatch(setCurrentPathSearch(paths, 'services'))
  }
  */

  /*
  const pacsPatients: string[] = []
  const path = 'SERVICES/PACS/orthanc'
  pacsFiles.forEach((file: any) => {
    const fnameSplit = file.data.fname.split('/')
    const pathMatch = `${fnameSplit[0]}/${fnameSplit[1]}/${fnameSplit[2]}`
    if (pathMatch === path) {
      const folder = fnameSplit[3]
      pacsPatients.push(folder)
    }
  })
  if (pacsPatients.length > 0) {
    dispatch(setFolders(pacsPatients, path))
    dispatch(setInitialPath(path, 'services'))
  }

  if (pacsPatients.length > 0) {
    dispatch(setPaginatedFolders([], 'SERVICES'))
    dispatch(
      setPagination('SERVICES', {
        hasNext: false,
        limit: 30,
        offset: 0,
        totalCount: 0,
      }),
    )
  }
  */
}

export const handlePaginatedFolders = (
  folders: string[],
  rootPath: string,
  dispatch: React.Dispatch<any>,
) => {
  const limit = 30
  if (folders.length > limit) {
    const folderPaginate = folders.slice(0, limit)
    dispatch(setPaginatedFolders(folderPaginate, rootPath))
    dispatch(
      setPagination(rootPath, {
        hasNext: folders.length > 30,
        limit,
        offset: 0,
        totalCount: folders.length,
      }),
    )
  }
}
