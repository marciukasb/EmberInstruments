import Image from "next/image";
import styles from "./page.module.css";
import pageData from "./_data/meta";

const page = pageData["404"];

export const metadata = {
  title: page.title,
  description: page.description,
};

export default function NotFound() {
  return (
    <main>
      <h1>Not Found</h1>
    </main>
  );
}
