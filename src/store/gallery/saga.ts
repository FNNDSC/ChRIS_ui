import { all, call, fork, put, takeEvery, select } from "redux-saga/effects";
import { GalleryActionTypes } from "./types";
import {
  setGalleryItemsSuccess,
  setGalleryActiveItemSuccess,
  setGalleryItems
} from "./actions";
import GalleryModel, {
  IGalleryItem,
  GalleryListModel,
  GalleryItemModel
} from "../../api/models/gallery.model";
import _ from "lodash";
import { IUITreeNode } from "../../api/models/file-explorer.model";

// ------------------------------------------------------------------------
// Description: Get ALL Gallery Items set the active gallery item and items array
// ------------------------------------------------------------------------
function* handleInitGalleryRequest(action: any) {
  try {
    const selectedFile = action.payload.selectedFile;
    const selectedFolder: IUITreeNode = action.payload.selectedFolder;
    const galleryItemModel = new GalleryItemModel(selectedFile);
    const res = yield call(
      GalleryModel.getGalleryItemBlob,
      galleryItemModel.galleryItem
    );
    if (res.error) {
      console.error(res.error);
    } else {
      yield put(setGalleryActiveItemSuccess(galleryItemModel.setGalleryItemBlob(res.data)));
    }
    // Initiate gallery Items call
    yield put(setGalleryItems({ selectedFile, selectedFolder }));
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
// Description: Get ALL Gallery Items set the active gallery item and items array
function* handleGetGalleryItemsRequest(action: any) {
  try {
    const selectedFile = action.payload.selectedFile;
    const selectedFolder = action.payload.selectedFolder;
    const galleryList = new GalleryListModel(selectedFile, selectedFolder);
    const responses = yield all(
      galleryList.galleryItems.map((item: IGalleryItem) =>
        call(function*() {
          return yield call(GalleryModel.getGalleryItemBlob, item);
        })
      )
    );
    galleryList.setGalleryItem(responses);
    yield put(setGalleryItemsSuccess(galleryList.galleryItems));
  } catch (error) {
    console.error(error);
  }
}

function* watchGetGalleryItemsRequest() {
  yield takeEvery(
    GalleryActionTypes.SET_GALLERY_ITEMS,
    handleGetGalleryItemsRequest
  );
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* gallerySaga() {
  yield all([
    fork(watchInitGalleryRequest),
    fork(watchGetGalleryItemsRequest)
  ]);
}
