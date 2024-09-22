type PacsStudy = {};

interface IPacsState {
  studies: ReadonlyArray<PacsStudy>;
}

export type { PacsStudy, IPacsState };
