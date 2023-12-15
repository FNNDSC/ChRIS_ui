/*
 * ASSUMPTIONS
 *
 * - There exists a public feed with the name "Fetal brain MRI templates reference"
 * - That feed has only one plugin instance
 * - Only .nii.gz files are supported
 * - One `template.nii.gz` exists for each subject
 */

import WrapperConnect from "../Wrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  PageBreadcrumb,
  PageGroup,
  PageNavigation,
  PageSection
} from "@patternfly/react-core";
import { InfoIcon } from "../Common";
import { Typography } from "antd";
import { useState, useEffect } from "react";
import { Collection, Feed, FeedFile } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient.ts";
import { filestemOf, groupBySubject, Subject } from "./subjects.ts";
import {NiivueCanvas, NVROptions, NVRVolume} from "niivue-react/src/index";
import {Niivue} from "@niivue/niivue";
import {useImmer} from "use-immer";

type ChrisData = {
  feed: Feed,
  files: FeedFile[],
};

type SelectedState = {
  subject: Subject,
  volumes: {[key: string]: NVRVolume}
};

const _NIIVUE = new Niivue();
const NIIVUE_COLORMAPS = _NIIVUE.colormaps();

const DEFAULT_COLORMAPS_MAP = {
  cortex: 'gray',
  csf: 'gray',
  hemispheres: 'gray',
  mask: 'gray',
  template: 'gray',
  ventricles: 'red'
}

/**
 * https://github.com/FNNDSC/fnndsc/blob/26f4345a99c4486faedb732afe16fc1f14265d54/js/chrisAPI/src/feedfile.js#L38C1-L39
 */
function fileResourceUrlOf(file: FeedFile): string {
  const item = file.collection.items[0];
  return Collection.getLinkRelationUrls(item, 'file_resource')[0];
}

function file2nvrentry(file: FeedFile): [string, NVRVolume] {
  const filestem = filestemOf(file.data.fname, '.nii.gz');
  const volume: NVRVolume = {
    url: fileResourceUrlOf(file),
    opacity: filestem === 'template' ? 1.0 : 0.0,
    colormap: DEFAULT_COLORMAPS_MAP[filestem] || 'gray'
  };
  return [filestem, volume];
}

const PublicDatasets: React.FunctionComponent = () => {

  const client = ChrisAPIClient.getClient();
  const [chrisData, setChrisData] = useState<ChrisData | null>(null);
  const [selected, setSelected] = useImmer<SelectedState | null>(null);

  const subjects: Subject[] = chrisData ? groupBySubject(chrisData.files) : [];

  /**
   * Load a subject's files into Niivue.
   */
  const setSubject = async (subject: Subject) => {
    const entries = subject.files
      .filter((file) => file.data.fname.endsWith('.nii.gz'))
      .map(file2nvrentry);
    setSelected(() => {
      const volumes = Object.fromEntries(entries);
      return { subject, volumes };
    });
    console.log('subject was set to:')
    console.dir(subject);
  };

  const init = async () => {
    const feedsCollection = await client.getPublicFeeds({name_exact: 'Fetal brain MRI templates reference', limit: 1});
    // @ts-ignore
    const feed = feedsCollection.getItems()[0];

    const filesCollection = await feed.getFiles({limit: 99999, offset: 0});
    const files = filesCollection.getItems();

    setChrisData({feed, files});
  };

  useEffect(() => {
    init();
  }, []);


  // if no subject is selected but data is loaded, automatically select first subject
  if (!selected && subjects.length > 0) {
    setSubject(subjects[0]);
  }

  return (
    <WrapperConnect>
      <PageGroup>
        <PageNavigation>
          <PageBreadcrumb>
            <Breadcrumb>
              {
                chrisData && <BreadcrumbItem>{chrisData.feed.data.name}</BreadcrumbItem>
              }
              {
                  chrisData && selected && <BreadcrumbItem>{selected.subject.name}</BreadcrumbItem>
              }
              {
                chrisData && selected && <BreadcrumbItem></BreadcrumbItem>
              }
            </Breadcrumb>
          </PageBreadcrumb>
        </PageNavigation>
      </PageGroup>
      <PageSection>
        <h1 style={{fontSize: '300%'}}>WORK IN PROGRESS, NOTHING TO SEE HERE.</h1>
        <InfoIcon
          title="Public Datasets"
          p1={
            <Typography>
              <p>
                Datasets found in public feeds can be visualized here using
                <a href="https://github.com/niivue/niivue" target="_blank" rel="noreferrer nofollow">Niivue</a>.
              </p>
              <p>
                For how to add data here, see the documentation:
                <a href="https://chrisproject.org/docs/public_dataset_viewer" target="_blank" rel="noreferrer nofollow">
                  https://chrisproject.org/docs/public_dataset_viewer
                </a>.
              </p>
            </Typography>
          }
        />
      </PageSection>
      {/*<PageSection>*/}
      {/*  my data is: <pre>{ JSON.stringify(selected, null, 2) }</pre>*/}
      {/*</PageSection>*/}
      <PageSection>
        <NiivueCanvas volumes={Object.values(selected?.volumes || [])} />
      </PageSection>
    </WrapperConnect>
  );
}

export default PublicDatasets;
