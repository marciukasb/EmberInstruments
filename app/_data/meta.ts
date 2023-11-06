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
} as PageData;

export default pageData;
