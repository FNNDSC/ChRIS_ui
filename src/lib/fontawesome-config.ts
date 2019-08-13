// Build a library of fontawesome icons used in the app:
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSearchPlus,
  faSearch,
  faHome,
  faSpinner,
  faExclamationTriangle,
  faTrashAlt,
  faTrash,
  faEdit,
  faUser,
  faUserEdit,
  faKey,
  faCheckCircle,
  faUserPlus,
  faUserTimes,
  faUserMinus,
  faCalendarDay,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import {
  faClock,
  faCalendarAlt,
  faUser as farUser,
  faFileAlt
} from "@fortawesome/free-regular-svg-icons";

// Description: add icons to be used in the app as needed
// Some are solid and some are from regular svg (hollow icons)
library.add(
  faSearch,
  faSearchPlus,
  faHome,
  faSpinner,
  faExclamationTriangle,
  faTrash,
  faTrashAlt,
  faEdit,
  faUser,
  faUserEdit,
  faUserPlus,
  faUserTimes,
  faUserMinus,
  faKey,
  faCheck,
  faCheckCircle,
  faCalendarDay,
  faClock,
  faCalendarAlt,
  farUser,
  faFileAlt
);
