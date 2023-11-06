import { Metadata } from "next";

interface PageData {
  [key: string]: Metadata;
}

const pageData = {
  Home: {
    title: "Ember Instruments",
    description: "",
  },
  About: {
    title: "Ember Instruments - About",
    description: "",
  },
  Contacts: {
    title: "Ember Instruments - Contacts",
    description: "",
  },
  404: {
    title: "404 Page not found",
    description: "Application Error",
  },
} as PageData;

export default pageData;
