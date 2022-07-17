import { Provider } from "react-redux";
import React from "react";
import { getByText, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { store } from "../../app/store";

import Navbar from "./Navbar";

describe("Navbar", () => {
  it("testing navbar", () => {
    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );
    expect(getByText("Login")).toBeInTheDocument();
  });
});
