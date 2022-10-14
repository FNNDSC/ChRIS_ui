import React from 'react'
import { Breadcrumb, BreadcrumbItem, Split, SplitItem, Button } from '@patternfly/react-core'
import { FaFolder, FaFolderOpen, FaUser, FaHome } from 'react-icons/fa'
import { FcServices } from 'react-icons/fc'

export interface Breadcrumb {
  browserType: string
  handleFolderClick: (path: string) => void
  path: string
  files: any[]
  folderDetails: { currentFolder: string; totalCount: number }
  togglePreview: () => void
  previewAll: boolean
}

const BreadcrumbContainer = ({
  handleFolderClick,
  path,
  browserType,
  files,
  folderDetails,
  togglePreview,
  previewAll,
}: Breadcrumb) => {
  const initialPathSplit =
    browserType === 'feed' && path === '/'
      ? [path]
      : browserType === 'feed' && path !== '/'
      ? path.split('/').filter((path) => path !== '')
      : path.split('/')
  const style = { width: '2em', height: '0.85em' }

  return (
    <>
      {browserType === 'feed' && path !== '/' && (
        <BreadcrumbItem
          to="#"
          style={{
            fontSize: '1.1em',
          }}
          onClick={() => {
            handleFolderClick('/')
          }}
        >
          <FaHome style={style} />
          root
        </BreadcrumbItem>
      )}

      <Breadcrumb style={{ margin: '1em 0 1em 0' }}>
        {initialPathSplit.map((path: string, index) => {
          let icon

          if (
            (browserType === 'feed' || browserType === 'uploads') &&
            index === 0 &&
            path !== '/'
          ) {
            icon = <FaUser style={style} />
          } else if (index === 0 && browserType === 'services') {
            icon = <FcServices style={style} />
          } else if (index === initialPathSplit.length - 1 && initialPathSplit.length > 1) {
            icon = <FaFolderOpen style={style} />
          } else if (browserType !== 'feed') {
            icon = <FaFolder style={style} />
          }

          return (
            <BreadcrumbItem
              to={index !== 0 || browserType !== 'uploads' ? '#' : undefined}
              style={{
                fontSize: '1.1em',
              }}
              onClick={() => {
                if (index === 0 && browserType === 'uploads') {
                  return
                }

                const newPath = initialPathSplit.slice(0, index + 1).join('/')
                handleFolderClick(newPath)
              }}
              key={index}
            >
              {icon}
              {path}
            </BreadcrumbItem>
          )
        })}
      </Breadcrumb>
      {files && files.length > 0 && (
        <Split
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <SplitItem>
            <h3>
              <FaFolderOpen style={{ width: '2em', height: '0.85em' }} />
              {folderDetails.currentFolder}
            </h3>
            <h4 style={{ marginLeft: '0.5em', marginBottom: '1em' }}>
              {folderDetails.totalCount} items
            </h4>
          </SplitItem>

          <SplitItem>
            <Button
              onClick={() => {
                togglePreview()
              }}
            >
              {previewAll ? 'Hide All Previews' : 'Preview All'}
            </Button>
          </SplitItem>
        </Split>
      )}
    </>
  )
}

export default BreadcrumbContainer
