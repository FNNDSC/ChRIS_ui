import { Series, Study } from "../../api/pfdcm/models.ts";
import { PACSSeries } from "@fnndsc/chrisapi";
import { Either } from "fp-ts/Either";

type PacsSeriesState = {
  info: Series;
  receivedCount: number;
  error: string[];
  done: boolean;
  inCube: Either<Error, PACSSeries> | "loading" | null;
};

type PacsStudyState = {
  info: Study;
  series: PacsSeriesState[];
};

interface IPacsState {
  studies: Either<Error, PacsStudyState[]> | "loading" | null;
}

export type { PacsStudyState, IPacsState };
