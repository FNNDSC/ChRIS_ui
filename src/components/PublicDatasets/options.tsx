/**
 * This file contains some type definitions and some hard-coded
 * presets for the *Fetal Brain Atlas (Serag et al.)* dataset.
 */

import { basename, filestemOf, PublicDatasetFile } from "./subjects.ts";

/**
 * "ChrisVisualDataset Volume": A subset of `NVRVolume` but with non-optional keys.
 * This type should be given to `<NiivueCanvas volumes=...>`.
 */
type CVDVolume = {
  url: string,
  opacity: number,
  colormap: string,
  cal_min: number,
  cal_max: number,
};

/**
 * A private type predecessor to `VolumeOptions` with an additional `zIndex`
 * value which indicates sort preference.
 */
type PreVolumeOptions = {
  name: string,
  zIndex: number,
  volume: CVDVolume
};

/**
 * Volume name and Niivue volume options.
 */
type VolumeOptions = {
  name: string,
  volume: CVDVolume
};

const DEFAULT_VOLUMEOPTION: PreVolumeOptions = {
  volume: {
    url: '!!!PLACEHOLDER!!! If you see me, I am a bug!',
    opacity: 0.0,
    colormap: 'gray',
    cal_min: 0.0,
    cal_max: 1.0,
  },
  zIndex: 0.0,
  name: '!!!PLACEHOLDER!!! If you see me, I am a bug!',
};

/**
 * Default volume options hard-coded for the *Fetal Brain Atlas (Serag et al.)*
 */
const DEFAULT_VOLUMEOPTIONS_LOOKUP: { [key: string]: PreVolumeOptions } = {
  cortex: DEFAULT_VOLUMEOPTION,
  csf: DEFAULT_VOLUMEOPTION,
  hemispheres: DEFAULT_VOLUMEOPTION,
  mask: DEFAULT_VOLUMEOPTION,
  template: {
    volume: {
      url: '!!!PLACEHOLDER!!! If you see me, I am a bug!',
      opacity: 1.0,  // template.nii.gz is visible by default
      colormap: 'gray',
      cal_min: 0.0,
      cal_max: 450.0,
    },
    zIndex: -1,  // template.nii.gz should be displayed under other layers
    name: 'template'
  },
  ventricles: {
    volume: {
      url: '!!!PLACEHOLDER!!! If you see me, I am a bug!',
      opacity: 0.5,  // ventricles.nii.gz is partially visible by default
      colormap: 'red',
      cal_min: 0.0,
      cal_max: 1.0,
    },
    zIndex: 1,  // ventricles.nii.gz should be displayed over other layers,
    name: 'ventricles'
  },
  default: DEFAULT_VOLUMEOPTION
}

/**
 * Filter the list of files for volumes and add options to them.
 */
function files2volumes(files: PublicDatasetFile[]): VolumeOptions[] {
  const volumes = files
    .filter((file) => file.fname.endsWith('.nii.gz'))
    .map(file2prevolume);
  volumes.sort(comparePreVolumes);
  return volumes.map(delZIndex);
}

function comparePreVolumes(a: PreVolumeOptions, b: PreVolumeOptions): number {
  return a.zIndex - b.zIndex;
}

function file2prevolume(file: PublicDatasetFile): PreVolumeOptions {
  const name = basename(file.fname);
  const baseOptions = DEFAULT_VOLUMEOPTIONS_LOOKUP[filestemOf(name, '.nii.gz') as keyof typeof DEFAULT_VOLUMEOPTIONS_LOOKUP] || DEFAULT_VOLUMEOPTIONS_LOOKUP['default'];
  return {
    volume: {
      ...baseOptions.volume,
      url: file.file_resource
    },
    name,
    zIndex: baseOptions.zIndex
  };
}

function delZIndex(x: PreVolumeOptions): VolumeOptions {
  return {
    volume: x.volume,
    name: x.name
  };
}

export type { CVDVolume, VolumeOptions };
export { files2volumes };
