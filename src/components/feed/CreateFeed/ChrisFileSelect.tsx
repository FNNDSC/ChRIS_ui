import React, { useState, useContext, useCallback, useEffect } from 'react'
import { CreateFeedContext } from './context'
import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Grid,
  GridItem,
  WizardContext,
} from '@patternfly/react-core'
import {  Key } from 'rc-tree/lib/interface'
import { Tree } from 'antd'
import { ErrorBoundary } from 'react-error-boundary'
import {
  Types,
  Info,
  DataBreadcrumb,
  ChrisFileSelectProp,
  CheckedKeys,
} from './types/feed'
import { generateTreeNodes } from './utils/fileSelect'
import { FileList, ErrorMessage } from './helperComponents'
import { isEmpty } from 'lodash'

const { DirectoryTree } = Tree

function getEmptyTree(username: string) {
  const node: DataBreadcrumb[] = []
  node.push({
    breadcrumb: username,
    title: username,
    key: '0-0',
  })
  node.push({
    breadcrumb: 'SERVICES',
    title: 'SERVICES',
    key: '0-1',
  })
  return node
}

// Needs to be replaced with a better caching solution

const cache: {
  tree: DataBreadcrumb[]
} = {
  tree: [],
}

function setCacheTree(tree: DataBreadcrumb[]) {
  cache['tree'] = tree
}

function getCacheTree() {
  return cache['tree']
}

export function clearCache() {
  cache['tree'] = []
}

const ChrisFileSelect: React.FC<ChrisFileSelectProp> = ({
  username,
}: ChrisFileSelectProp) => {
  const { state, dispatch } = useContext(CreateFeedContext)
  const { chrisFiles, checkedKeys } = state.data
  const {onBack, onNext} = useContext(WizardContext)
  const [loading, setLoading] = useState<boolean>(false)
  const [tree, setTree] = useState<DataBreadcrumb[]>(
    (!isEmpty(getCacheTree()) && getCacheTree()) || getEmptyTree(username),
  )
  const [loadingError, setLoadingError] = useState<Error>()
  const fetchKeysFromDict: Key[] = React.useMemo(
    () => getCheckedKeys(checkedKeys),
    [checkedKeys],
  )

  const onCheck = (checkedKeys: CheckedKeys, info: Info) => {
    if (info.node.breadcrumb) {
      const path = `${info.node.breadcrumb}`
      if (info.checked === true)
        dispatch({
          type: Types.AddChrisFile,
          payload: {
            file: path,
            checkedKeys,
          },
        })
      else {
        dispatch({
          type: Types.RemoveChrisFile,
          payload: {
            file: path,
            checkedKeys,
          },
        })
      }
    }
  }
  const handleKeyDown = useCallback((e:any) =>{
    if(e.target.closest("INPUT")) return; 
    if(chrisFiles.length > 0 && e.code == "ArrowRight"){
      onNext()
    }else if(e.code == "ArrowLeft"){
      onBack()
    }
  }, [chrisFiles.length, onBack, onNext])

  useEffect(() => {
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [ handleKeyDown])

  const onLoad = useCallback((): void => {
    generateTreeNodes(tree)
        .then(() => {
          const treeData = [...tree];
          setTree(treeData);
          setCacheTree(treeData);
        })
        .catch((err) => {
          setLoadingError(err);
        });
  },[tree]);

  useEffect(() =>{
    setLoading(true)
    onLoad()
    setLoading(false)
  }, [onLoad])

  
  const fileList =
    chrisFiles.length > 0
      ? chrisFiles.map((file: string, index: number) => (
          <React.Fragment key={index}>
            <FileList file={file} index={index} />
          </React.Fragment>
        ))
      : null

  return (
    <div className="chris-file-select pacs-alert-wrap">
      <div className="pacs-alert-step-wrap">
        <h1 className="pf-c-title pf-m-2xl">
          File Selection: File Select from internal ChRIS storage
        </h1>
        <p>
          Navigate the internal ChRIS storage and select files/directories to
          create an analysis
        </p>
        <br />
        <Grid hasGutter={true}>
          <GridItem span={6} rowSpan={12}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
               {!loading && <DirectoryTree
                //@ts-ignore
                onCheck={onCheck}
                //@ts-ignore
                checkedKeys={fetchKeysFromDict}
                checkable
                //@ts-ignore
                treeData={tree}
              />}
            </ErrorBoundary>
          </GridItem>
          <GridItem span={6} rowSpan={12}>
            <p className="section-header">Files to add to new analysis:</p>
            <div className="file-list">{fileList}</div>
          </GridItem>
        </Grid>
        {loadingError && (
          <LoadingErrorAlert
            error={loadingError}
            handleClose={() => setLoadingError(undefined)}
          />
        )}
      </div>
    </div>
  );
}

export default ChrisFileSelect

function getCheckedKeys(checkedKeys: { [key: string]: Key[] }) {
  const checkedKeysArray: Key[] = []

  for (const i in checkedKeys) {
    checkedKeysArray.push(...checkedKeys[i])
  }

  return checkedKeysArray
}

function ErrorFallback({ error }: any) {
  return <ErrorMessage error={error} />
}

interface LoadingErrorAlertProps {
  error: Error
  handleClose: () => void
}

const LoadingErrorAlert: React.FC<LoadingErrorAlertProps> = (
  props: LoadingErrorAlertProps,
) => {
  const { error, handleClose } = props
  const [showDetails, setShowDetails] = useState(false)

  const closeButton = <AlertActionCloseButton onClose={() => handleClose()} />
  const detailsMessage = `${showDetails ? 'Hide' : 'Show'} details`
  const detailsButton = (
    <AlertActionLink onClick={() => setShowDetails(!showDetails)}>
      {detailsMessage}
    </AlertActionLink>
  )

  const title = (
    <div>
      <span>There was a problem loading your files.</span>
      {showDetails && <div className="error-details">{error.message}</div>}
    </div>
  )

  return (
    <Alert
      className="loading-error-alert"
      variant="danger"
      isInline
      actionClose={closeButton}
      actionLinks={detailsButton}
      title={title}
    />
  )
}
