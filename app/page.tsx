import Image from "next/image";
import styles from "./page.module.css";
import pageData from "./_data/meta";

const page = pageData["Home"];

export const metadata = {
  title: page.title,
  description: page.description,
};

export default function Home() {
  return (
    <main>
      <h1>Home</h1>
    </main>
  );
}
