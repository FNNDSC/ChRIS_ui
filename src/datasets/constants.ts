const constants = {
  README_FILENAME: "/README.txt",
  /**
   * A file created by `pl-visual-dataset`.
   */
  MAGIC_DATASET_FILE: "/.chrisvisualdataset.tagmanifest.json",

  /**
   * Volume sidecar JSON filename extension.
   */
  VOLUME_SIDECAR_EXTENSION: ".chrisvisualdataset.volume.json",

  /**
   * Maximum number of public visual datasets to search for.
   */
  FEEDS_SEARCH_LIMIT: 20,
  /**
   * Maximum number of plugin instances to query for per feed.
   */
  PLUGININSTANCES_PER_FEED_LIMIT: 20,
  /**
   * Maximum number of plugin instances to query for per subject.
   */
  FILES_PER_SUBJECT_LIMIT: 20,

  /**
   * Versions of `pl-visual-dataset` compatible with this viewer.
   */
  COMPATIBLE_PL_VISUAL_DATASET_VERSIONS: ["0.1.0", "0.2.0"],
};

export default constants;
export { constants };
