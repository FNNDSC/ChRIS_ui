import React from "react";
import { render, wait } from "@testing-library/react";
import { _FeedView, FeedViewProps } from "../FeedView";

const feedId: string = "1";

const props: FeedViewProps | any = {
  match: { params: { id: feedId } },
};

describe("<FeedView/>", () => {
  const utils = render(<_FeedView {...props} />);
  console.log(utils);
});
