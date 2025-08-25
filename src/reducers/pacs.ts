import config from "config";
import type { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray";
import {
  init as _init,
  type ClassState,
  createReducer,
  genUUID,
  getRoot,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "react-reducer-utils";
import type { Location } from "react-router";
import type { URLSearchParams } from "url";
import { STATUS_OK, STATUS_OK_CREATE } from "../api/constants";
import type { SeriesKey } from "../api/lonk";
import {
  isDone as isLonkDone,
  isError as isLonkError,
  isProgress as isLonkProgress,
  isSubscribed as isLonkSubscribed,
} from "../api/lonk/LonkSubscriber";
import type { Lonk, LonkMessageData } from "../api/lonk/types";
import type { PACSqueryCore } from "../api/pfdcm";
import {
  createDownloadToken,
  getPFDCMServices,
  queryPACSSeries,
  queryPFDCMSeries,
  queryPFDCMStudies,
  retrievePFDCMPACS,
} from "../api/serverApi";
import { getDefaultPacsService } from "../components/Pacs/components/helpers";
import { seriesToStudyKey, studyToStudyKey } from "../components/Pacs/helpers";
import {
  type PacsPullRequestStateMap,
  type PacsSeriesState,
  type PacsStudyState,
  QUERY_PROMPT,
  SearchMode,
  SeriesPullState,
  type StudyKey,
} from "../components/Pacs/types";
import { createFeedWithSeriesInstanceUID } from "../components/Pacs/utils";
import {
  seriesUIDToSeriesMapKey,
  simplifyPypxSeriesData,
  simplifyPypxStudyData,
  studyUIDToStudyMapKey,
  updateSearchParams,
} from "./utils";

export const myClass = "chris-ui/pacs";

export type QueryValueStudyUIDsMap = { [key: string]: string[] };
export type PacsStudyMap = { [key: string]: PacsStudyState };
export type PacsSeriesMap = { [key: string]: PacsSeriesState };

export interface State extends rState {
  pullRequestMap: PacsPullRequestStateMap;
  services: ReadonlyNonEmptyArray<string>;
  service: string;
  isGetServices: boolean;

  studyMap: PacsStudyMap;
  studies: PacsStudyState[];
  studyUids: string[];
  isLoadingStudies: boolean;

  seriesMap: PacsSeriesMap;
  seriesList: PacsSeriesState[];

  expandedStudies: StudyKey[];
  expandedStudySet: Set<string>;
  expandedStudyUids: string[];
  expandedSeries: SeriesKey[];
  expandedSeriesSet: Set<string>;
  isExpandedAllDone: boolean;

  queryPrompt: string;
  queryValue: string;
  queryValues: string[];
  queryValueStudyUIDsMap: QueryValueStudyUIDsMap;

  wsUrl: string | null;

  errmsg: string;
}

const studyKeyToStudyMapKey = (studyKey: StudyKey) =>
  studyUIDToStudyMapKey(studyKey.pacs_name, studyKey.StudyInstanceUID);

const defaultServices: ReadonlyNonEmptyArray<string> = ["(none)"];

export const defaultState: State = {
  pullRequestMap: {},
  services: defaultServices,
  service: "",
  isGetServices: false,

  studyMap: {},
  studies: [],
  studyUids: [],
  isLoadingStudies: false,

  seriesMap: {},
  seriesList: [],

  expandedStudies: [],
  expandedStudyUids: [],
  expandedStudySet: new Set(),
  expandedSeries: [],
  expandedSeriesSet: new Set(),
  isExpandedAllDone: false,

  queryPrompt: "",
  queryValue: "",
  queryValues: [],
  queryValueStudyUIDsMap: {},

  wsUrl: null,

  errmsg: "",
};

export const init = (myID: string): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(_init({ myID, state: defaultState }));
    dispatch(getServices(myID));
    // dispatch(getWsUrl(myID));
  };
};

export const updateServiceQueryBySearchParams = (
  myID: string,
  location: Location,
  searchParams: URLSearchParams,
): Thunk<State> => {
  return (dispatch, _) => {
    if (!location.pathname.startsWith("/pacs")) {
      return;
    }

    const service = searchParams.get("service") || "";
    const mrn = searchParams.get(SearchMode.MRN) || "";
    const accessionNumber = searchParams.get(SearchMode.AccessNo) || "";

    if (service) {
      dispatch(setService(myID, service));
    }

    if (mrn) {
      dispatch(setQuery(myID, QUERY_PROMPT[SearchMode.MRN], mrn));
    } else if (accessionNumber) {
      dispatch(
        setQuery(myID, QUERY_PROMPT[SearchMode.AccessNo], accessionNumber),
      );
    }
  };
};

export const setQuery = (
  myID: string,
  queryPrompt: string,
  queryValue: string,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { queryPrompt, queryValue }));
  };
};

export const getWsUrl = (myID: string): Thunk<State> => {
  return async (dispatch, _) => {
    const { status, data, errmsg } = await createDownloadToken();
    if (status !== STATUS_OK_CREATE) {
      dispatch(setData(myID, { errmsg }));
      return;
    }
    if (!data) {
      return;
    }

    const { token } = data;
    const wsUrl = `${config.API_ROOT}/pacs/ws/?token=${token}`;

    dispatch(setData(myID, { wsUrl }));
  };
};

export const getServices = (myID: string): Thunk<State> => {
  return async (dispatch, _) => {
    const { status, data, errmsg } = await getPFDCMServices();
    if (status !== STATUS_OK) {
      const theErrMsg = `unable to get PACS Services: ${errmsg}`;
      dispatch(setData(myID, { errmsg: theErrMsg }));
      return;
    }

    const services = data || defaultServices;
    const service = getDefaultPacsService(services);
    updateSearchParams("service", service);

    dispatch(setData(myID, { services, service, isGetServices: true }));
  };
};

export const setService = (myID: string, service: string): Thunk<State> => {
  return async (dispatch, _) => {
    updateSearchParams("service", service);

    dispatch(setData(myID, { service }));
  };
};

const queryPacsSeriesByStudyUID = (
  myID: string,
  service: string,
  studyInstanceUID: string,

  queryPrompt: string,
  queryValue: string,
  queryValues: string[],
  eachQueryValue: string,
  queryValueStudyUIDsMap: QueryValueStudyUIDsMap,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const query = { StudyInstanceUID: studyInstanceUID };
    // @ts-expect-error PACSqueryCore is incorrect.
    const { status, data, errmsg } = await queryPFDCMSeries(service, query);
    if (status !== STATUS_OK) {
      dispatch(setData(myID, { errmsg }));
      return;
    }

    const studyData: PacsStudyState[] = (data?.pypx.data || []).map((each) => ({
      // @ts-expect-error simplifyPypxStudyData
      info: simplifyPypxStudyData(each),
      series: each.series.map(
        (eachSeries): PacsSeriesState => ({
          errors: [],
          // @ts-expect-error simplifyPypxStudyData
          info: simplifyPypxSeriesData(eachSeries),
          inCube: null,
          pullState: SeriesPullState.CHECKING,
          receivedCount: 0,
          subscribed: false,
          done: false,
        }),
      ),
    }));

    // update cube-series-state
    await queryAllCubeSeriesState(studyData);

    const classState = getClassState();

    const postStudyData = postprocessStudyData(
      studyData,
      classState,
      queryPrompt,
      queryValue,
      queryValues,
      eachQueryValue,
      queryValueStudyUIDsMap,
      false,
    );
    if (!postStudyData) {
      return;
    }

    dispatch(setData(myID, postStudyData));
  };
};

export const queryCubeSeriesStateBySeriesUID = (
  myID: string,
  pacsName: string,
  seriesUID: string,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getRoot(classState);
    if (!me) {
      return;
    }
    const { seriesMap, studyMap } = me;
    const key = seriesUIDToSeriesMapKey(pacsName, seriesUID);
    const mySeries = seriesMap[key];
    if (!mySeries) {
      return;
    }
    const studyUID = mySeries.info.StudyInstanceUID;
    const studyKey = studyUIDToStudyMapKey(pacsName, studyUID);
    const study = studyMap[studyKey];
    const count = study.info.NumberOfStudyRelatedSeries;

    const series = await queryCubeSeriesState(mySeries, count);

    const classState2 = getClassState();
    const postStudyData = postprocessSeries(
      pacsName,
      seriesUID,
      series,
      classState2,
    );
    if (!postStudyData) {
      return;
    }
    dispatch(setData(myID, postStudyData));
  };
};

const queryAllCubeSeriesState = async (studyData: PacsStudyState[]) =>
  Promise.all(
    studyData.map(async (eachStudy) => {
      const count = eachStudy.info.NumberOfStudyRelatedSeries;
      eachStudy.series = await Promise.all(
        eachStudy.series.map(async (eachSeries) => {
          return await queryCubeSeriesState(eachSeries, count);
        }),
      );
    }),
  );

const queryCubeSeriesState = async (series: PacsSeriesState, count: number) => {
  const {
    info: { RetrieveAETitle: service, SeriesInstanceUID: seriesUID },
  } = series;

  const { status, data } = await queryPACSSeries(service, seriesUID);
  if (status !== STATUS_OK) {
    return series;
  }
  if (!data) {
    return series;
  }

  if (data.length) {
    series.inCube = { data: data[0] };
    series.pullState = SeriesPullState.WAITING_OR_COMPLETE;
    series.receivedCount = count;
  } else if (series.pullState !== SeriesPullState.PULLING) {
    series.pullState = SeriesPullState.READY;
  }
  return series;
};

export const queryPacsStudies = (
  myID: string,
  service: string,
  queryPrompt: string,
  queryValue: string,
): Thunk<State> => {
  const queryValues = queryValue.split(",").map((each) => each.trim());

  return async (dispatch, getClassState) => {
    const queryValueStudyUIDsMap: QueryValueStudyUIDsMap = {};

    dispatch(
      setData(myID, {
        queryPrompt,
        queryValue,
        queryValues,
        queryValueStudyUIDsMap,
      }),
    );

    queryValues.map(async (each) => {
      const query: any = {};
      query[queryPrompt] = each;

      const { status, data, errmsg } = await queryPFDCMStudies(service, query);
      if (status !== STATUS_OK) {
        dispatch(setData(myID, { errmsg }));
        return;
      }

      const studyData: PacsStudyState[] = (data?.pypx.data || []).map((each) =>
        // @ts-expect-error simplifyPypxStudyData
        ({ info: simplifyPypxStudyData(each), series: [] }),
      );

      const classState = getClassState();

      const postStudyData = postprocessStudyData(
        studyData,
        classState,
        queryPrompt,
        queryValue,
        queryValues,
        each,
        queryValueStudyUIDsMap,
        true,
      );
      console.info(
        "pacs.queryPacsStudies: after postprocessStudyData: postStudyData:",
        postStudyData,
      );
      if (!postStudyData) {
        return;
      }

      dispatch(setData(myID, postStudyData));

      // get series data
      studyData.map((eachStudyData) =>
        dispatch(
          queryPacsSeriesByStudyUID(
            myID,
            service,
            eachStudyData.info.StudyInstanceUID,
            queryPrompt,
            queryValue,
            queryValues,
            each,
            queryValueStudyUIDsMap,
          ),
        ),
      );
    });
  };
};

const postprocessSeries = (
  pacsName: string,
  seriesUID: string,
  series: PacsSeriesState,
  classState: ClassState<State>,
) => {
  const me = getRoot(classState);
  if (!me) {
    return;
  }

  const {
    studyMap,
    queryPrompt,
    queryValue,
    queryValues,
    queryValueStudyUIDsMap,
  } = me;
  const studyKey = studyUIDToStudyMapKey(
    pacsName,
    series.info.StudyInstanceUID,
  );
  const myStudy = studyMap[studyKey];
  if (!myStudy) {
    return;
  }
  const seriesIndex = myStudy.series.findIndex(
    (each) => each.info.SeriesInstanceUID === seriesUID,
  );
  if (seriesIndex === -1) {
    return;
  }

  const preSeries = myStudy.series.slice(0, seriesIndex);
  const postSeries = myStudy.series.slice(seriesIndex + 1);
  const newSeries = preSeries.concat([series]).concat(postSeries);
  const study = Object.assign({}, myStudy, { series: newSeries });
  const postStudyData = postprocessStudyData(
    [study],
    classState,
    queryPrompt,
    queryValue,
    queryValues,
    "",
    queryValueStudyUIDsMap,
  );
  return postStudyData;
};

const postprocessStudyData = (
  studyData: PacsStudyState[],
  classState: ClassState<State>,
  queryPrompt: string,
  queryValue: string,
  queryValues: string[],
  eachQueryValue: string,
  queryValueStudyUIDsMap: QueryValueStudyUIDsMap,
  isQueryPacsStudies = false,
) => {
  const me = getRoot(classState);
  console.info("pacs.postprocessStudyData: getRoot:", me);
  if (!me) {
    return;
  }

  const {
    studyMap: myStudyMap,
    queryPrompt: myQueryPrompt,
    queryValue: myQueryValue,
    expandedStudies: myExpandedStudies,
    expandedStudySet,
    expandedSeries: myExpandedSeries,
    seriesMap: mySeriesMap,
  } = me;

  // ensure that we are still the newest query
  console.info(
    "pacs.postprocessStudyData: queryPrompt:",
    queryPrompt,
    "myQueryPrompt:",
    myQueryPrompt,
    "queryValue:",
    queryValue,
    "myQueryValue:",
    myQueryValue,
  );
  if (queryPrompt !== myQueryPrompt || queryValue !== myQueryValue) {
    return;
  }

  const toUpdatePacsStudyMap = studyData.reduce(
    (r: PacsStudyMap, eachStudy) => {
      const key = `${eachStudy.info.RetrieveAETitle}-${eachStudy.info.StudyInstanceUID}`;
      r[key] = eachStudy;
      return r;
    },
    {},
  );
  // studyUids
  const studyUids = Object.keys(toUpdatePacsStudyMap);

  // studyMap
  const studyMap: PacsStudyMap = Object.assign(
    {},
    myStudyMap,
    toUpdatePacsStudyMap,
  );

  // queryValuesStudyUIDsMap
  if (isQueryPacsStudies) {
    queryValueStudyUIDsMap[eachQueryValue] = studyUids;
  }

  // studies and series
  const { studies, series } = postprocessStudyMap(
    queryValues,
    queryValueStudyUIDsMap,
    studyMap,
  );

  // seriesMap
  const seriesMap = isQueryPacsStudies
    ? mySeriesMap
    : processSeriesMap(studyData, mySeriesMap);

  // expandedSeries
  const { expandedSeries } = isQueryPacsStudies
    ? { expandedSeries: myExpandedSeries }
    : postprocessExpandedStudies(
        [],
        studyMap,
        myExpandedStudies,
        expandedStudySet,
      );

  return {
    studyUids: studyUids,
    studyMap,
    studies,
    series,
    seriesMap,
    expandedSeries,
  };
};

const postprocessStudyMap = (
  queryValues: string[],
  queryValueStudyUIDsMap: QueryValueStudyUIDsMap,
  studyMap: PacsStudyMap,
) => {
  const studies = queryValues.flatMap((eachValue) => {
    const eachStudyUIDs = queryValueStudyUIDsMap[eachValue] || [];
    return eachStudyUIDs.reduce((r: PacsStudyState[], eachStudyUID) => {
      const eachStudy = studyMap[eachStudyUID];
      if (!eachStudy) {
        return r;
      }
      r.push(eachStudy);
      return r;
    }, []);
  });

  const series = studies.reduce((r: PacsSeriesState[], eachStudy) => {
    if (eachStudy.series.length === 0) {
      return r;
    }
    return r.concat(eachStudy.series);
  }, []);

  return { studies, series };
};

const processSeriesMap = (
  studyData: PacsStudyState[],
  mySeriesMap: PacsSeriesMap,
) => {
  const toUpdateSeriesMap = studyData.reduce(
    (r: PacsSeriesMap, eachStudyData) => {
      eachStudyData.series.map((each) => {
        const {
          info: { RetrieveAETitle: pacsName, SeriesInstanceUID: seriesUID },
        } = each;
        const key = seriesUIDToSeriesMapKey(pacsName, seriesUID);
        r[key] = each;
      });

      return r;
    },
    {},
  );

  return Object.assign({}, mySeriesMap, toUpdateSeriesMap);
};

export const onStudyExpand = (
  myID: string,
  pacsName: string,
  studyInstanceUIDs: ReadonlyArray<string>,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classSate = getClassState();
    const me = getRoot(classSate);

    console.info("pacs.onStudyExpand: getRoot:", me, "myID:", myID);
    if (!me) {
      return;
    }
    const { studyMap, seriesMap } = me;

    const theExpandedStudies: StudyKey[] = studyInstanceUIDs.map((each) => ({
      StudyInstanceUID: each,
      pacs_name: pacsName,
    }));

    const {
      expandedStudyUids,
      expandedSeries,
      expandedStudies,
      expandedStudySet,
    } = postprocessExpandedStudies(theExpandedStudies, studyMap, [], new Set());

    console.info(
      "pacs.onStudyExpand: to setData: expandedSeries:",
      expandedSeries.length,
    );

    dispatch(
      setData(myID, {
        expandedStudies: expandedStudies,
        expandedStudyUids,
        expandedSeries,
        expandedStudySet,
        isExpandedAllDone: false,
      }),
    );

    expandedSeries.filter((each) => {
      const key = seriesUIDToSeriesMapKey(
        each.pacs_name,
        each.SeriesInstanceUID,
      );
      const eachSeries = seriesMap[key];
      if (!eachSeries) {
        return false;
      }

      return eachSeries.pullState;
    });
  };
};

const postprocessExpandedStudies = (
  theExpandedStudies: StudyKey[],
  studyMap: PacsStudyMap,
  myExpandedStudies: StudyKey[],
  expandedStudySet: Set<string>,
) => {
  const filteredExpandedStudies = theExpandedStudies.filter((each) => {
    const key = studyKeyToStudyMapKey(each);
    return !expandedStudySet.has(key);
  });
  filteredExpandedStudies.map((each) => {
    const key = studyKeyToStudyMapKey(each);
    expandedStudySet.add(key);
  });

  const expandedStudies = myExpandedStudies.concat(filteredExpandedStudies);

  const expandedStudyUids = expandedStudies.map(
    (each) => each.StudyInstanceUID,
  );

  const expandedSeries = expandedStudies.flatMap((studyKey) => {
    const key = studyKeyToStudyMapKey(studyKey);
    return studyMap[key].series.map(
      (each): SeriesKey => ({
        pacs_name: each.info.RetrieveAETitle,
        SeriesInstanceUID: each.info.SeriesInstanceUID,
      }),
    );
  });

  return {
    expandedStudyUids,
    expandedSeries,
    expandedStudies,
    expandedStudySet,
  };
};

export const appendExpandedStudies = (
  myID: string,
  studies: PacsStudyState[],
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getRoot(classState);
    if (!me) {
      return;
    }

    const {
      expandedStudies: myExpandedStudies,
      studyMap,
      expandedStudySet,
    } = me;

    const theExpandedStudies = studies.map((each) =>
      studyToStudyKey(each.info),
    );

    const { expandedStudyUids, expandedSeries, expandedStudies } =
      postprocessExpandedStudies(
        theExpandedStudies,
        studyMap,
        myExpandedStudies,
        expandedStudySet,
      );

    dispatch(
      setData(myID, { expandedStudies, expandedStudyUids, expandedSeries }),
    );
  };
};

export const appendExpandedStudiesBySeries = (
  myID: string,
  series: PacsSeriesState[],
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getRoot(classState);
    if (!me) {
      return;
    }

    const {
      expandedStudies: myExpandedStudies,
      studyMap,
      expandedStudySet,
    } = me;

    const theExpandedStudies = series.map((each) =>
      seriesToStudyKey(each.info),
    );
    const { expandedStudyUids, expandedSeries, expandedStudies } =
      postprocessExpandedStudies(
        theExpandedStudies,
        studyMap,
        myExpandedStudies,
        expandedStudySet,
      );

    dispatch(
      setData(myID, { expandedStudies, expandedStudyUids, expandedSeries }),
    );
  };
};

export const expandStudies = (
  myID: string,
  pacsName: string,
  query: PACSqueryCore,
  studies: PacsStudyState[],
): Thunk<State> => {
  return (dispatch, _) => {
    if (query.seriesInstanceUID) {
      const filteredSeries = studies
        .filter((each) => each.info.RetrieveAETitle === pacsName)
        .flatMap((study) => study.series)
        .filter(
          (series) => series.info.SeriesInstanceUID === query.seriesInstanceUID,
        );
      dispatch(appendExpandedStudiesBySeries(myID, filteredSeries));
      return;
    }

    if (query.studyInstanceUID) {
      const filteredStudies = studies
        .filter((each) => each.info.RetrieveAETitle === pacsName)
        .filter(
          (study) => study.info.StudyInstanceUID === query.studyInstanceUID,
        );
      dispatch(appendExpandedStudies(myID, filteredStudies));
    }
  };
};

export const retrievePACS = (
  myID: string,
  service: string,
  query: PACSqueryCore,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    let classState = getClassState();
    let me = getRoot(classState);
    if (!me) {
      return;
    }

    const { seriesMap: mySeriesMap, studyMap: myStudyMap } = me;

    // check is-to-pull-request
    const isToPullRequest = checkIsToPullRequest(
      myStudyMap,
      mySeriesMap,
      service,
      query,
    );

    if (!isToPullRequest) {
      return;
    }

    // send pull-request
    const { status, data, errmsg } = await retrievePFDCMPACS(service, query);
    if (status !== STATUS_OK) {
      dispatch(setData(myID, { errmsg }));
      return;
    }

    classState = getClassState();
    me = getRoot(classState);
    if (!me) {
      return;
    }

    const {
      seriesMap: mySeriesMap2,
      studyMap: myStudyMap2,
      queryPrompt,
      queryValue,
      queryValues,
      queryValueStudyUIDsMap,
    } = me;

    // update series pull-state.
    const { toUpdateStudies, toUpdateSeries } = retrievePACSGetSeriesByQuery(
      service,
      query,
      myStudyMap2,
      mySeriesMap2,
    );
    toUpdateSeries.map((each) => {
      each.pullState = SeriesPullState.PULLING;
    });

    const postStudyData = postprocessStudyData(
      toUpdateStudies,
      classState,
      queryPrompt,
      queryValue,
      queryValues,
      "",
      queryValueStudyUIDsMap,
      false,
    );
    if (!postStudyData) {
      return;
    }

    dispatch(setData(myID, postStudyData));
  };
};

export const processLonkMsg = (
  myID: string,
  data: Lonk<LonkMessageData>,
): Thunk<State> => {
  return (dispatch, _) => {
    const { pacs_name: pacsName, SeriesInstanceUID: seriesUID, message } = data;
    if (isLonkDone(message)) {
      dispatch(processLonkMsgDone(myID, pacsName, seriesUID));
    } else if (isLonkProgress(message)) {
      dispatch(
        processLonkMsgProgess(myID, pacsName, seriesUID, message.ndicom),
      );
    } else if (isLonkSubscribed(message)) {
      dispatch(processLonkMsgSubscribed(myID, pacsName, seriesUID));
    } else if (isLonkError(message)) {
      dispatch(processLonkMsgError(myID, pacsName, seriesUID, message.error));
    }
  };
};

export const processLonkMsgDone = (
  myID: string,
  pacsName: string,
  seriesUID: string,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    if (!pacsName && !seriesUID) {
      // all-done
      console.info("processLonkMsgDone: all done");
      dispatch(setData<Partial<State>>(myID, { isExpandedAllDone: true }));
      return;
    }

    const seriesKey = seriesUIDToSeriesMapKey(pacsName, seriesUID);
    const series = me.seriesMap[seriesKey];
    if (!series) {
      return;
    }
    const studyUID = series.info.StudyInstanceUID;
    const studyKey = studyUIDToStudyMapKey(pacsName, studyUID);
    const study = me.studyMap[studyKey];
    if (!study) {
      return;
    }
    const count = study.info.NumberOfStudyRelatedSeries;

    dispatch(
      updateReceiveState(myID, pacsName, seriesUID, {
        pullState: SeriesPullState.WAITING_OR_COMPLETE,
        done: true,
        receivedCount: count,
      }),
    );

    dispatch(queryCubeSeriesStateBySeriesUID(myID, pacsName, seriesUID));

    await createFeedWithSeriesInstanceUID(seriesUID);
  };
};

export const processLonkMsgProgess = (
  myID: string,
  pacsName: string,
  seriesUID: string,
  count: number,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(
      updateReceiveState(
        myID,
        pacsName,
        seriesUID,
        { receivedCount: count },
        (theOrig: number, theNew: number) => theOrig < theNew,
      ),
    );
  };
};

export const processLonkMsgSubscribed = (
  myID: string,
  pacsName: string,
  seriesUID: string,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(
      updateReceiveState(myID, pacsName, seriesUID, { subscribed: true }),
    );
  };
};

export const processLonkMsgError = (
  myID: string,
  pacsName: string,
  seriesUID: string,
  errmsg: string,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(pushReceiveStateError(myID, pacsName, seriesUID, errmsg));
  };
};

export const updateReceiveState = (
  myID: string,
  pacsName: string,
  seriesUID: string,
  toUpdate: Partial<PacsSeriesState>,
  theFilter = (theOrig: any, theNew: any) => theOrig !== theNew,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getRoot(classState);
    if (!me) {
      return;
    }

    const { seriesMap } = me;

    const seriesKey = seriesUIDToSeriesMapKey(pacsName, seriesUID);
    const mySeries = seriesMap[seriesKey];
    if (!mySeries) {
      return;
    }

    // ensure that we do need to update
    const isToUpdate = Object.keys(toUpdate).some((each) =>
      // @ts-expect-error
      theFilter(mySeries[each], toUpdate[each]),
    );
    if (!isToUpdate) {
      return;
    }

    // update series
    const series = Object.assign({}, mySeries, toUpdate);

    const postStudyData = postprocessSeries(
      pacsName,
      seriesUID,
      series,
      classState,
    );

    if (!postStudyData) {
      return;
    }

    const {
      studyMap,
      studies,
      series: newSeries,
      seriesMap: newSeriesMap,
    } = postStudyData;

    dispatch(
      setData(myID, {
        studyMap,
        studies,
        series: newSeries,
        seriesMap: newSeriesMap,
      }),
    );
  };
};

export const pushReceiveStateError = (
  myID: string,
  pacsName: string,
  seriesUID: string,
  err: string,
): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getRoot(classState);
    if (!me) {
      return;
    }

    const { seriesMap: mySeriesMap } = me;

    const seriesKey = seriesUIDToSeriesMapKey(pacsName, seriesUID);
    const mySeries = mySeriesMap[seriesKey];
    if (!mySeries) {
      return;
    }

    const theError = mySeries.errors.concat([err]);
    const series = Object.assign({}, mySeries, { errors: theError });

    const postStudyData = postprocessSeries(
      pacsName,
      seriesUID,
      series,
      classState,
    );
    if (!postStudyData) {
      return;
    }

    dispatch(setData(myID, postStudyData));
  };
};

const retrievePACSGetSeriesByQuery = (
  service: string,
  query: PACSqueryCore,
  studyMap: PacsStudyMap,
  seriesMap: PacsSeriesMap,
) => {
  // query.studyInstanceUID
  if (query.studyInstanceUID) {
    const studyKey = studyUIDToStudyMapKey(service, query.studyInstanceUID);
    const study = studyMap[studyKey];
    if (!study) {
      return { toUpdateStudies: [], toUpdateSeries: [] };
    }

    return { toUpdateStudies: [study], toUpdateSeries: study.series };
  }

  // query.seriesInstanceUID
  const seriesKey = seriesUIDToSeriesMapKey(
    service,
    query.seriesInstanceUID || "",
  );
  const series = seriesMap[seriesKey];
  if (!series) {
    return { toUpdateStudies: [], toUpdateSeries: [] };
  }
  const studkey2 = studyUIDToStudyMapKey(service, series.info.StudyInstanceUID);
  const study2 = studyMap[studkey2];
  if (!study2) {
    return { toUpdateStudies: [], toUpdateSeries: [] };
  }
  return { toUpdateStudies: [study2], toUpdateSeries: [series] };
};

const checkIsToPullRequest = (
  studyMap: PacsStudyMap,
  seriesMap: PacsSeriesMap,
  service: string,
  query: PACSqueryCore,
) => {
  return query.studyInstanceUID
    ? checkIsToPullRequestStudy(studyMap, service, query.studyInstanceUID)
    : checkIsToPullRequestSeries(
        seriesMap,
        service,
        query.seriesInstanceUID || "",
      );
};

const checkIsToPullRequestStudy = (
  studyMap: PacsStudyMap,
  service: string,
  studyInstanceUID: string,
) => {
  const key = studyUIDToStudyMapKey(service, studyInstanceUID);
  const study = studyMap[key];
  if (!study) {
    return false;
  }
  const { series } = study;
  return (
    series.findIndex((each) => isPullStateNeedToPullRequest(each.pullState)) !==
    -1
  );
};

const checkIsToPullRequestSeries = (
  seriesMap: PacsSeriesMap,
  service: string,
  seriesInstanceUID: string,
) => {
  const key = seriesUIDToSeriesMapKey(service, seriesInstanceUID);
  const series = seriesMap[key];
  if (!series) {
    return false;
  }
  return isPullStateNeedToPullRequest(series.pullState);
};

const isPullStateNeedToPullRequest = (pullState: SeriesPullState) => {
  return pullState === SeriesPullState.READY;
};

export default createReducer<State>();
