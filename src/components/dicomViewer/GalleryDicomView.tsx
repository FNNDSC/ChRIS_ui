import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstoneNIFTIImageLoader from 'cornerstone-nifti-image-loader'
import * as cornerstoneFileImageLoader from 'cornerstone-file-image-loader'
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as cornerstoneTools from 'cornerstone-tools'
import { import as csTools } from 'cornerstone-tools'
import Hammer from 'hammerjs'
import CornerstoneViewport from 'react-cornerstone-viewport'
import {
  Backdrop,
  Bullseye,
  Spinner,
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
} from '@patternfly/react-core'
import { useTypedSelector } from '../../store/hooks'
import GalleryWrapper from '../gallery/GalleryWrapper'
import * as dicomParser from 'dicom-parser'
import DicomHeader from './DcmHeader/DcmHeader'
import DicomTag from './DicomTag'

import { Image, GalleryState, CornerstoneEvent } from './types'

cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init()
cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone
cornerstoneFileImageLoader.external.cornerstone = cornerstone
cornerstoneWebImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser

const scrollToIndex = csTools('util/scrollToIndex')
cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    'Content-Type': 'application/vnd.collection+json',
    Authorization: 'Token ' + window.sessionStorage.getItem('CHRIS_TOKEN'),
  },
  method: 'get',
  responseType: 'arrayBuffer',
})

function getInitialState() {
  return {
    inPlay: false,
    imageIds: [],
    activeTool: 'Zoom',
    numberOfFrames: 1,
    tools: [
      {
        name: 'Zoom',
        mode: 'active',
        modeOptions: { mouseButtonMask: 1 },
      },

      {
        name: 'Pan',
        mode: 'active',
        modeOptions: { mouseButtonMask: 4 },
      },
      {
        name: 'Wwwc',
        mode: 'active',
        modeOptions: { mouseButtonMask: 1 },
      },
      {
        name: 'StackScrollMouseWheel',
        mode: 'active',
      },
      { name: 'Magnify', mode: 'active' },
    ],
    frameRate: 22,
    frame: 1,
    visibleHeader: false,
  }
}

const GalleryDicomView = ({ type }: { type: string }) => {
  const imageIds = useTypedSelector((state) => state.explorer.files)
  const [galleryDicomState, setGalleryDicomState] = React.useState<
    GalleryState
  >(getInitialState())

  const {
    inPlay,
    visibleHeader,
    frameRate,
    frame,
    tools,
    activeTool,
    numberOfFrames,
  } = galleryDicomState
  const element = React.useRef<HTMLElement | undefined>(undefined)
  const currentImage = React.useRef<Image | undefined>(undefined)

  React.useEffect(() => {
    setGalleryDicomState((state) => {
      return {
        ...state,
        numberOfFrames: imageIds.length,
      }
    })
  }, [imageIds])

  const toolExecute = (tool: string) => {
    runTool(tool)
  }

  const handleOpenImage = (cmdName: string) => {
    runTool('openImage', cmdName)
  }

  const setPlayer = (status: boolean) => {
    setGalleryDicomState({
      ...galleryDicomState,
      inPlay: status,
    })
  }

  const handleGalleryActions = {
    next: () => {
      handleOpenImage('next')
    },
    previous: () => {
      handleOpenImage('previous')
    },
    play: () => {
      setGalleryDicomState({
        ...galleryDicomState,
        inPlay: !inPlay,
      })
      handleOpenImage('play')
    },
    pause: () => {
      setGalleryDicomState({
        ...galleryDicomState,
        inPlay: !inPlay,
      })

      handleOpenImage('pause')
    },
    first: () => {
      handleOpenImage('first')
    },
    last: () => {
      handleOpenImage('last')
    },

    zoom: () => {
      toolExecute('Zoom')
    },

    pan: () => {
      toolExecute('Pan')
    },

    wwwc: () => {
      toolExecute('Wwwc')
    },
    invert: () => {
      toolExecute('Invert')
    },

    magnify: () => {
      toolExecute('Magnify')
    },
    rotate: () => {
      toolExecute('Rotate')
    },
    stackScroll: () => {
      toolExecute('StackScroll')
    },
    reset: () => {
      toolExecute('Reset')
    },

    dicomHeader: () => {
      toolExecute('DicomHeader')
    },
  }

  const runCinePlayer = (cmdName: string) => {
    switch (cmdName) {
      case 'play': {
        setPlayer(true)
        break
      }

      case 'pause': {
        setPlayer(false)
        break
      }

      case 'next': {
        if (frame < numberOfFrames) {
          const nextFrame = frame + 1

          setGalleryDicomState({
            ...galleryDicomState,
            frame: nextFrame,
          })
          scrollToIndex(element.current, frame + 1)
        }

        break
      }
      case 'previous': {
        if (frame > 1) {
          const previousFrame = frame - 1
          setGalleryDicomState({
            ...galleryDicomState,
            frame: previousFrame,
          })
          scrollToIndex(element.current, frame - 1)
        }
        break
      }

      case 'first': {
        const frame = 1
        setGalleryDicomState({
          ...galleryDicomState,
          frame,
        })

        scrollToIndex(element.current, 0)

        break
      }

      case 'last': {
        const frame = numberOfFrames
        setGalleryDicomState({
          ...galleryDicomState,
          frame: frame,
        })
        scrollToIndex(element.current, frame - 1)
        break
      }
    }
  }

  const runTool = (toolName: string, opt?: any) => {
    switch (toolName) {
      case 'openImage': {
        runCinePlayer(opt)
        break
      }
      case 'Wwwc': {
        if (activeTool === 'Wwwc') return

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: 'Wwwc',
        })
        break
      }
      case 'Pan': {
        if (activeTool === 'Pan') return

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: 'Pan',
        })
        break
      }
      case 'Zoom': {
        if (activeTool === 'Zoom') return

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: 'Zoom',
        })
        break
      }
      case 'Invert': {
        const viewport = cornerstone.getViewport(element.current)
        viewport.invert = !viewport.invert
        cornerstone.setViewport(element.current, viewport)
        break
      }

      case 'Magnify': {
        if (activeTool === 'Magnify') return

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: 'Magnify',
        })
        break
      }
      case 'Rotate': {
        const viewport = cornerstone.getViewport(element.current)
        viewport.rotation += 90
        cornerstone.setViewport(element.current, viewport)
        break
      }

      case 'StackScroll': {
        if (activeTool === 'StackScrollMouseWheel') return

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: 'StackScrollMouseWheel',
        })
        break
      }

      case 'DicomHeader': {
        setGalleryDicomState({
          ...galleryDicomState,
          visibleHeader: !visibleHeader,
        })
        break
      }

      case 'Reset': {
        cornerstone.reset(element.current)
        break
      }
    }
  }

  const toggleHeader = () => {
    setGalleryDicomState({
      ...galleryDicomState,
      visibleHeader: !visibleHeader,
    })
  }

  const panelContent = (
    <DrawerPanelContent
      style={{
        backgroundColor: '#f0f0f0',
      }}
    >
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButton onClick={toggleHeader} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <DicomTag image={currentImage.current} />
      </DrawerPanelBody>
    </DrawerPanelContent>
  )

  return (
    <GalleryWrapper
      handleOnToolbarAction={(action: string) => {
        ;(handleGalleryActions as any)[action].call()
      }}
      listOpenFilesScrolling={inPlay}
    >
      <React.Suspense fallback={<FallBackComponent />}>
        <React.Fragment>
          <ErrorBoundary FallbackComponent={FallBackComponent}>
            <DicomHeader
              type={type}
              handleToolbarAction={(action: string) => {
                ;(handleGalleryActions as any)[action].call()
              }}
            />
            <div className="ami-viewer">
              <Drawer isExpanded={visibleHeader}>
                <DrawerContent panelContent={panelContent}>
                  <DrawerContentBody>
                    {imageIds.length > 0 ? (
                      <div id="container">
                        <CornerstoneViewport
                          isPlaying={inPlay}
                          frameRate={frameRate}
                          activeTool={activeTool}
                          tools={tools}
                          imageIds={imageIds}
                          onElementEnabled={(
                            elementEnabledEvt: CornerstoneEvent,
                          ) => {
                            if (elementEnabledEvt.detail) {
                              const cornerstoneElement =
                                elementEnabledEvt.detail.element
                              element.current = cornerstoneElement
                              if (cornerstoneElement) {
                                cornerstoneElement.addEventListener(
                                  'cornerstoneimagerendered',
                                  (eventData: CornerstoneEvent) => {
                                    if (eventData.detail) {
                                      const image = eventData.detail.image

                                      currentImage.current = image

                                      const viewport = eventData.detail.viewport
                                      if (viewport) {
                                        const newViewport: any = {}
                                        newViewport.voi = viewport.voi || {}
                                        newViewport.voi.windowWidth =
                                          image && image.windowWidth
                                        newViewport.voi.windowCenter =
                                          image && image.windowCenter
                                        if (!viewport.displayedArea) {
                                          newViewport.displayedArea = {
                                            // Top Left Hand Corner
                                            tlhc: {
                                              x: 0,
                                              y: 0,
                                            },
                                            // Bottom Right Hand Corner
                                            brhc: {
                                              x: 256,
                                              y: 256,
                                            },
                                            rowPixelSpacing: 1,
                                            columnPixelSpacing: 1,
                                            presentationSizeMode:
                                              'SCALE TO FIT',
                                          }
                                        }
                                        const setViewport = Object.assign(
                                          {},
                                          viewport,
                                          newViewport,
                                        )

                                        cornerstone.setViewport(
                                          cornerstoneElement,
                                          setViewport,
                                        )
                                      }
                                    }
                                  },
                                )
                              }
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Spinner size="xl" />
                    )}
                  </DrawerContentBody>
                </DrawerContent>
              </Drawer>
            </div>
          </ErrorBoundary>
        </React.Fragment>
      </React.Suspense>
    </GalleryWrapper>
  )
}

export default GalleryDicomView

const FallBackComponent = () => {
  return (
    <Backdrop>
      <Bullseye>
        <Spinner />
      </Bullseye>
    </Backdrop>
  )
}
