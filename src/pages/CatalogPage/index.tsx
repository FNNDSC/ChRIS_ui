import React from 'react'
import { useDispatch } from 'react-redux'
import { Typography } from 'antd'
import Wrapper from '../Layout/PageWrapper'
import { PageSection, Title } from '@patternfly/react-core'
import PluginCatalog from '../../components/catalog/PluginCatalog'
import PipelineCatalog from '../../components/catalog/PipelineCatalog'
import ComputeCatalog from '../../components/catalog/ComputeCatalog'
import './CatalogPage.scss'
import { setSidebarActive } from '../../store/ui/actions'

const { Title: AntTitle, Paragraph } = Typography

const style = { fontSize: '1.15em' }

const CatalogPage = () => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    document.title = 'Analysis Catalog'
    dispatch(
      setSidebarActive({
        activeItem: 'catalog',
      }),
    )
  })
  return (
    <Wrapper>
      <PageSection variant="light">
        <AntTitle>Plugins and Workflows</AntTitle>
      </PageSection>
      <PageSection
        style={{
          marginBottom: '0',
        }}
      >
        <Paragraph style={style}>
          This page consistes of three main sections, listing availalbe{' '}
          <b>Plugins</b>, <b>Pipelines</b>, and <b>Compute</b>.
        </Paragraph>
        <Paragraph style={style}>
          ChRIS is a platform that runs <b>Plugins</b>.  A plugin is a single
          application (similar to <i>apps</i> on a mobile device). Examples of
          ChRIS <b>Plugins</b> are applications that analyze images (like {' '}
          <a href="https://github.com/FNNDSC/pl-fshack">pl-fshack</a>{' '}
          that runs a neuro image analysis program called{' '}
          <a href="https://surfer.nmr.mgh.harvard.edu">FreeSurfer</a>). Other
          {' '}<b>Plugins</b> perform operations like zipping files,
          converting medical images from DICOM to jpg, etc. On this page you can
          browse <b>Plugins</b>{' '} available for you to use. For more options,
          consult the {' '}<a href="https://next.chrisstore.co">ChRIS store</a>.
        </Paragraph>
        <Paragraph style={style}>
          Often times it is useful to combine many <b>Plugin</b> apps into
          one <b>Pipeline</b> (or <b>Workflow</b>) to automate and group
          common operations together. For example a <b>Pipeline</b> might
          automate <i>Anonymizing</i>{' '}medical DICOM images,
          {' '}<i>Converting</i>{' '}these DICOM images to a format like JPG and
          {' '}<i>Running a FreeSurfer</i>{' '} analysis on the medical DICOMs
          all in one <b>Workflow</b>. The{' '}<b>Pipelines</b> section
          catalogues the <b>Pipelines</b>{' '} available in this ChRIS. Note,
          you can add new <b>Pipelines</b> to this ChRIS by uploading a JSON pipeline
          description (see{' '}
          <a href="https://github.com/FNNDSC/CHRIS_docs/tree/master/pipelines/source">
            here
          </a>{' '}
          for some examples). <b>Pipelines</b> are also available in the
          separate <a href="https://next.chrisstore.co">ChRIS store</a>.
        </Paragraph>
        <Paragraph style={style}>
          The final section on this page presents the available <b>Compute</b>{' '}
          environments that are known to ChRIS. These denote computers and
          clusters/clouds that can be selected to run various <b>plugins</b> and{' '}
          <b>pipelines</b>. The special <b>host</b> environment is always
          available and is the actual server that is running ChRIS. It is
          generally not recommended to run intensive computation on the{' '}
          <b>host</b> environment. Adding new <b>Compute</b> to ChRIS is
          typically enabled by using the separate ChRIS admin interface.
        </Paragraph>
      </PageSection>

      <PluginCatalog />

      <PipelineCatalog />

      <ComputeCatalog />
    </Wrapper>
  )
}

export default CatalogPage
