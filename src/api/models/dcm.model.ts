// Began some series and stack modeling ***** Notes: needs to be developed
export default interface IDcmSeriesItem {
    patientID: string;
    modality?: string;
    numberOfChannels?: number;
    numberOfFrames?: number;
    patientAge?: string;
    patientBirthdate?: string;
    patientName?: string;
    patientSex?: string;
    seriesDate?: string;
    seriesDescription?: string;
    seriesInstanceUID?: string;
    studyDate?: string
    studyDescription?: string
    transferSyntaxUID?: string
  }