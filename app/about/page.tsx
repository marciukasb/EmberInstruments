import pageData from "../_data/meta";

const page = pageData["About"];

export const metadata = {
  title: page.title,
  description: page.description,
};

const About = () => {
  return (
    <main>
      <h1>About</h1>
    </main>
  );
};

export default About;
