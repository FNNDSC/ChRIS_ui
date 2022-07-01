import {
  setFolders,
  setInitialPath,
  setPaginatedFolders,
  setPagination,
} from './context/actions'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { fetchResource } from '../../../../utils'
import { Feed } from '@fnndsc/chrisapi'

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
    dispatch(setInitialPath(path, 'uploads'))
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
  const path = username
  const feedFolders: string[] = []

  feedFiles.forEach((feed: Feed) => {
    const folderName = `feed_${feed.data.id}`
    feedFolders.push(folderName)
  })

  if (feedFolders.length > 0) {
    dispatch(setFolders(feedFolders, path))
    dispatch(setInitialPath(path, 'feed'))
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

export const handlePacsFiles = (
  pacsFiles: any[],
  dispatch: React.Dispatch<any>,
) => {
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