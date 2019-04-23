import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { GalleryActionTypes } from "./types";
import { initializeGallerySuccess,setGalleryActiveItem, setGalleryItems, setGalleryItemsSuccess } from "./actions";
import GalleryModel, {GalleryListModel} from "../../api/models/gallery.model";

// ------------------------------------------------------------------------
// Description: Get ALL Gallery Items set the active gallery item and items array
// ------------------------------------------------------------------------
function* handleInitGalleryRequest(action: any) {
  // try{
  //     const selectedFile = action.payload.selectedFile;
  //     const selectedFolder = action.payload.selectedFolder;
  //     const galleryList = new GalleryListModel(selectedFile, selectedFolder)
  //     console.log(galleryList.galleryItems);

  // //  const response = yield all([
  // //   call(fetch, '/users'),
  // //   call(fetch, '/repos')
  // // ])
  // } catch (error) {
  //   console.error(error);
  // }
  try {
    const selectedFile = action.payload.selectedFile;
    const selectedFolder = action.payload.selectedFolder;
    const gallery = new GalleryModel(selectedFile, selectedFolder);
    const response = yield call( gallery.setActiveGalleryItem,  gallery.galleryItem );
    if (response.error) {
      console.error(response.error);
    } else {
        gallery.setGalleryItemBlob(response.data)
        yield put(initializeGallerySuccess(gallery));
    }
  } catch (error) {
    console.error(error);
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchInitGalleryRequest() {
  yield takeEvery(
    GalleryActionTypes.INITIALIZE_GALLERY,
    handleInitGalleryRequest
  );
}
// ------------------------------------------------------------------------
// PREP ALL GALLERY ITEMS
function* handleSetGalleryItemsBlobs(action: any) {
  try {
    const node = action.payload.selectedFile;
    const selectedFolder = action.payload.selectedFolder;
    const data = {node, selectedFolder};
    const gallery = new GalleryModel(node, selectedFolder);
    // gallery.buildGalleryArray(data);
    console.log(gallery);
    const response = yield call( gallery.setActiveGalleryItem,  action );
    if (response.error) {
      console.error(response.error); // working user messaging
    } else {
      console.log(response);
      yield put(setGalleryItemsSuccess(response));
    }
  } catch (error) {
    console.error(error); // working user messaging
  }
}
function* watchGetGalleryItemsArrayRequest() {
  yield takeEvery(GalleryActionTypes.SET_GALLERY_ITEMS_BLOBS, handleSetGalleryItemsBlobs);
}

// ------------------------------------------------------------------------
// function* handleSetGalleryItem(action: any) {
//   try {
//     console.log(action);
//     const gallery = new GalleryModel(
//       action.payload.node,
//       action.payload.selectedFolder
//     );
//     const response = yield call(gallery.setActiveGalleryItem,  gallery.galleryItem);
//     if (response.error) {
//       console.error(response.error); // working user messaging
//     } else {
//       console.log(response);
//       yield put(
//         setGalleryActiveItem(gallery.setGalleryItemBlob(response.data))
//       );
//     }
//   } catch (error) {
//     console.error(error); // working user messaging
//   }
// }

// // This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// // type, and run our saga, for example the `handleFetch()` saga above.
// function* watchSetGalleryItemt() {
//   yield takeEvery(
//     GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM,
//     handleSetGalleryItem
//   );
// }

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* gallerySaga() {
  yield all([
        fork(watchInitGalleryRequest),
        fork(watchGetGalleryItemsArrayRequest)
    ]);
}
