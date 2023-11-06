import pageData from "../_data/meta";

const page = pageData["Contacts"];

export const metadata = {
  title: page.title,
  description: page.description,
};

export default function Contacts() {
  return (
    <main>
      <h1>Contacts</h1>
    </main>
  );
}
