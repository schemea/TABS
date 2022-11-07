import { render } from "react-dom";
import { Application } from "./component/app";
import { createElement } from "react";
import "./style.scss";

const root = document.body.appendChild(document.createElement("div"));
render(createElement(Application), root);
