import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-LRBVHKLL3W");
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};