import pageData from "./_data/meta";
import HeroSection from "./_components/HeroSection/HeroSection";
import InfoSection from "./_components/InfoSection/InfoSection";
import Footer from "./_components/Footer";
import HeroContent from "./_components/HeroContent/HeroContent";
import ThreeImageSection from "./_components/ThreeImageSection/ThreeImageSection";

const page = pageData["Home"];

export const metadata = {
  title: page.title,
  description: page.description,
};

export default function Home() {
  return (
    <div className="scroll-container" id="scroll-container">
      <HeroSection
        imageUrl="/images/hero.png"
        mobileImageUrl="/images/hero_sm.png"
      >
        <HeroContent />
      </HeroSection>
      <ThreeImageSection />
      <InfoSection
        title="Lorem ipsum dolor"
        description="Est aliquam viverra mauris tellus bibendum posuere ornare dictum. Sit eget libero id gravida tellus cras mi pretium. Proin tempor vestibulum nullam dictum parturient aliquet vitae et a. "
        imageUrl="images/image.png"
      />
      <InfoSection
        reverse
        title="Lorem ipsum dolor"
        description="Est aliquam viverra mauris tellus bibendum posuere ornare dictum. Sit eget libero id gravida tellus cras mi pretium. Proin tempor vestibulum nullam dictum parturient aliquet vitae et a. "
        imageUrl="images/image2.png"
      />
      <InfoSection
        title="Lorem ipsum dolor"
        description="Est aliquam viverra mauris tellus bibendum posuere ornare dictum. Sit eget libero id gravida tellus cras mi pretium. Proin tempor vestibulum nullam dictum parturient aliquet vitae et a. "
        imageUrl="images/image3.png"
      />
      <Footer />
    </div>
  );
}
