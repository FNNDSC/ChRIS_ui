import {
  TrashIcon,
  CogIcon,
  BrainIcon,
  TerminalIcon,
  CodeBranchIcon,
  CalendarAltIcon,
  PlusIcon,
  FileIcon,
  FolderIcon,
  DownloadIcon,
  SearchPlusIcon,
  SearchIcon,
  InfoIcon,
  DatabaseIcon,
  QuestionCircleIcon,
  ThLargeIcon,
  CompressArrowsAltIcon,
  ExpandArrowsAltIcon,
} from "@patternfly/react-icons";

const MergeIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
    >
      <title>Merge</title>
      <path d="M80 104a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm80-24c0 32.8-19.7 61-48 73.3V192c0 17.7 14.3 32 32 32H304c17.7 0 32-14.3 32-32V153.3C307.7 141 288 112.8 288 80c0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3V192c0 53-43 96-96 96H256v70.7c28.3 12.3 48 40.5 48 73.3c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-32.8 19.7-61 48-73.3V288H144c-53 0-96-43-96-96V153.3C19.7 141 0 112.8 0 80C0 35.8 35.8 0 80 0s80 35.8 80 80zm208 24a24 24 0 1 0 0-48 24 24 0 1 0 0 48zM248 432a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z" />
    </svg>
  );
};

const ArchiveIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
    >
      <title>Archive</title>
      <path d="M377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zM128.4 336c-17.9 0-32.4 12.1-32.4 27 0 15 14.6 27 32.5 27s32.4-12.1 32.4-27-14.6-27-32.5-27zM224 136V0h-63.6v32h-32V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zM95.9 32h32v32h-32zm32.3 384c-33.2 0-58-30.4-51.4-62.9L96.4 256v-32h32v-32h-32v-32h32v-32h-32V96h32V64h32v32h-32v32h32v32h-32v32h32v32h-32v32h22.1c5.7 0 10.7 4.1 11.8 9.7l17.3 87.7c6.4 32.4-18.4 62.6-51.4 62.6z" />
    </svg>
  );
};

const ShareIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
    >
      <title>Share</title>
      <path d="M352 320c-22.6 0-43.4 7.8-59.8 20.9l-102.5-64.1a96.6 96.6 0 0 0 0-41.7l102.5-64.1C308.6 184.2 329.4 192 352 192c53 0 96-43 96-96S405 0 352 0s-96 43-96 96c0 7.2 .8 14.1 2.3 20.8L155.8 180.9C139.4 167.8 118.6 160 96 160c-53 0-96 43-96 96s43 96 96 96c22.6 0 43.4-7.8 59.8-20.9l102.5 64.1A96.3 96.3 0 0 0 256 416c0 53 43 96 96 96s96-43 96-96-43-96-96-96z" />
    </svg>
  );
};

const DuplicateIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
    >
      <title>Duplicate</title>
      <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32v96V384c0 35.3 28.7 64 64 64H256V384H64V160H256V96H64V32zM288 192c0 17.7 14.3 32 32 32H544c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H445.3c-8.5 0-16.6-3.4-22.6-9.4L409.4 9.4c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32V192zm0 288c0 17.7 14.3 32 32 32H544c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32H445.3c-8.5 0-16.6-3.4-22.6-9.4l-13.3-13.3c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32V480z" />
    </svg>
  );
};

const FeedBrowserIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <title>Feed Browser</title>
      <path d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H448v96H288zM448 256H288V160H448v96zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
    </svg>
  );
};

const PreviewIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
    >
      <title>Preview</title>
      <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
    </svg>
  );
};

const NoteEditIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
    >
      <title>Edit Note</title>
      <path d="M402.3 344.9l32-32c5-5 13.7-1.5 13.7 5.7V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h273.5c7.1 0 10.7 8.6 5.7 13.7l-32 32c-1.5 1.5-3.5 2.3-5.7 2.3H48v352h352V350.5c0-2.1 .8-4.1 2.3-5.6zm156.6-201.8L296.3 405.7l-90.4 10c-26.2 2.9-48.5-19.2-45.6-45.6l10-90.4L432.9 17.1c22.9-22.9 59.9-22.9 82.7 0l43.2 43.2c22.9 22.9 22.9 60 .1 82.8zM460.1 174L402 115.9 216.2 301.8l-7.3 65.3 65.3-7.3L460.1 174zm64.8-79.7l-43.2-43.2c-4.1-4.1-10.8-4.1-14.8 0L436 82l58.1 58.1 30.9-30.9c4-4.2 4-10.8-.1-14.9z" />
    </svg>
  );
};

const FileImageIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
    >
      <title>Image File</title>
      <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM64 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm152 32c5.3 0 10.2 2.6 13.2 6.9l88 128c3.4 4.9 3.7 11.3 1 16.5s-8.2 8.6-14.2 8.6H216 176 128 80c-5.8 0-11.1-3.1-13.9-8.1s-2.8-11.2 .2-16.1l48-80c2.9-4.8 8.1-7.8 13.7-7.8s10.8 2.9 13.7 7.8l12.8 21.4 48.3-70.2c3-4.3 7.9-6.9 13.2-6.9z" />
    </svg>
  );
};

const FileTxtIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
    >
      <title>Text File</title>
      <path d="M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120z" />
    </svg>
  );
};

const FilePdfIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <title>Pdf File</title>
      <path d="M64 464l48 0 0 48-48 0c-35.3 0-64-28.7-64-64L0 64C0 28.7 28.7 0 64 0L229.5 0c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3L384 304l-48 0 0-144-80 0c-17.7 0-32-14.3-32-32l0-80L64 48c-8.8 0-16 7.2-16 16l0 384c0 8.8 7.2 16 16 16zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z" />
    </svg>
  );
};

const RotateIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z" />
      <title>Rotate</title>
    </svg>
  );
};

const RulerIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <title>Ruler Icon </title>
      <path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 401.9c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z" />
    </svg>
  );
};

const BrightnessIcon = () => {
  return (
    <svg
      fill="currentColor"
      className="pf-v5-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <title>Brightness Icon</title>
      <path d="M8 256c0 137 111 248 248 248s248-111 248-248S393 8 256 8 8 119 8 256zm248 184V72c101.7 0 184 82.3 184 184 0 101.7-82.3 184-184 184z" />
    </svg>
  );
};

export {
  TrashIcon as DeleteIcon,
  ArchiveIcon,
  ShareIcon,
  DuplicateIcon,
  MergeIcon,
  CogIcon as NodeDetailsPanelIcon,
  FeedBrowserIcon,
  PreviewIcon,
  BrainIcon,
  TerminalIcon,
  NoteEditIcon,
  CodeBranchIcon,
  CalendarAltIcon,
  PlusIcon as AddIcon,
  FileIcon,
  FolderIcon,
  DownloadIcon,
  FileImageIcon,
  FileTxtIcon,
  FilePdfIcon,
  SearchPlusIcon as ZoomIcon,
  SearchIcon,
  RotateIcon,
  InfoIcon,
  RulerIcon,
  BrightnessIcon,
  DatabaseIcon as LibraryIcon,
  QuestionCircleIcon,
  ThLargeIcon,
  CompressArrowsAltIcon,
  ExpandArrowsAltIcon,
};
