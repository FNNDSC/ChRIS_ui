import { Series, Study } from "../../api/pfdcm/models.ts";
import { PACSSeries } from "@fnndsc/chrisapi";
import { Either } from "fp-ts/Either";
import { Option } from "fp-ts/Option";

type PacsSeriesState = {
  info: Series;
  receivedCount: number;
  error: string[];
  done: boolean;
  inCube: PACSSeries | null;
};

type PacsStudyState = {
  info: Study;
  series: PacsSeriesState[];
};

interface IPacsState {
  studies: Either<Error, ReadonlyArray<PacsStudyState>> | "loading" | null;
}

export type { PacsStudyState, IPacsState };
