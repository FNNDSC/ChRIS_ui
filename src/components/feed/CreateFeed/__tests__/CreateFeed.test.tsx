import React from "react";
import Enzyme, { shallow } from "enzyme";
import EnzymeAdapter from "enzyme-adapter-react-16";
import CreateFeed from "../CreateFeed";

Enzyme.configure({ adapter: new EnzymeAdapter() });

test("renders Create Feed without crashing", () => {
  const wrapper = shallow(<CreateFeed />);
});
