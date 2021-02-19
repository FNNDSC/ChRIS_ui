export function displayDescription(label: any) {
  if (label.error) {
    return "Error in compute";
  } else if (label.currentStep) {
    return label.title;
  } else return "";
}
