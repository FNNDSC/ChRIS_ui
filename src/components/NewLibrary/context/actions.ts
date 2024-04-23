import { Types } from ".";

export const setSelectFolder = (path: string) => {
  return {
    type: Types.SET_SELECTED_PATHS,
    payload: {
      path,
    },
  };
};

export const clearSelectFolder = (path: string) => {
  return {
    type: Types.CLEAR_SELECTED_PATHS,
    payload: {
      path,
    },
  };
};

export const clearCart = () => {
  return {
    type: Types.CLEAR_CART,
  };
};
