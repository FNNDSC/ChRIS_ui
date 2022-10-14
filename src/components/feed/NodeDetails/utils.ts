export function displayDescription(label: any) {
  if (label.error) {
    return 'Error in compute'
  } else if (label.currentStep) {
    return label.title
  } else return ''
}

// Hard-coded map of error codes to simplified error messages
export function getErrorCodeMessage(errorCode: string) {
  const errorCodeMap: Record<string, string> = {
    CODE01: 'Error submitting job to pfcon url',
    CODE02: 'Error getting job status at pfcon',
    CODE03: 'Error fetching zip from pfcon url',
    CODE04: 'Received bad zip file from remote',
    CODE05:
      "Couldn't find any plugin instance with correct ID while processing input instances to ts plugin instance",
    CODE06: 'Error while listing swift storage files',
    CODE07: 'Error while uploading file to swift storage',
    CODE08: 'Error while downloading file from swift storage',
    CODE09: 'Error while copying file in swift storage',
    CODE10: 'Got undefined status from remote',
    CODE11: 'Error while listing swift storage files; presumable eventual consistency problem',
    CODE12: 'Error deleting job from pfcon',
  }

  const errorMessage = errorCodeMap[errorCode]
  if (errorMessage) {
    return `ChRIS Internal Error: ${errorMessage}`
  }
  return 'ChRIS Internal Error'
}
