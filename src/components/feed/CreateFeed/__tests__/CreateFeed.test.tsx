import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { _CreateFeed } from "../CreateFeed";
import { CreateFeedProvider } from "../context";
import "@testing-library/jest-dom/extend-expect";

const CreateFeed = (
  <CreateFeedProvider>
    <_CreateFeed />
  </CreateFeedProvider>
);

describe("<CreateFeed/>", () => {
  const {
    getByText,
    getByPlaceholderText,
    getByLabelText,
    getByTestId,
  } = render(CreateFeed);
  it("renders <BasicInformation/> on click", () => {
    fireEvent.click(getByText(/Create New Feed/));
    const feedName = getByPlaceholderText("e.g. Tractography Study");
    expect(feedName).toBeInTheDocument();

    fireEvent.change(feedName, {
      target: { name: "feed-name", value: "Test" },
    });
    fireEvent.click(getByText(/Next/));

    expect(
      getByLabelText(/Select a FS plugin from this ChRIS server/)
    ).toBeInTheDocument();

    const radioButton = getByTestId("fs_plugin");

    fireEvent.click(radioButton, {
      currentTarget: {
        checked: true,
      },
    });
  });
});



