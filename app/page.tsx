import pageData from './_data/meta'
import HeroSection from './_components/HeroSection/HeroSection'
import InfoSection from './_components/InfoSection/InfoSection'
import Footer from './_components/Footer'
import HeroContent from './_components/HeroContent/HeroContent'
import ThreeImageSection from './_components/ThreeImageSection/ThreeImageSection'

const page = pageData['Home']

export const metadata = {
  title: page.title,
  description: page.description,
}

export default function Home() {
  return (
    <div className='scroll-container' id='scroll-container'>
      <HeroSection
        imageUrl='/images/hero.png'
        mobileImageUrl='/images/hero_sm.png'
      >
        <HeroContent />
      </HeroSection>
      <ThreeImageSection />
      <InfoSection
        title='Custom Hardware'
        description='Every component is chosen or made with intention. From bridges to tuning machines, we source and modify hardware to match the character of each instrument - so nothing feels off-the-shelf, because nothing is.'
        imageUrl='images/image.png'
      />
      <InfoSection
        reverse
        title='Hand Polished'
        description='The finish is the final conversation between the maker and the instrument. Every surface is polished by hand, layer by layer, until it feels exactly right - smooth, alive, and ready to play.'
        imageUrl='images/image2.png'
      />
      <InfoSection
        title='Intricate Joinery'
        description='The way wood comes together tells you everything about how an instrument was made. Every joint is cut, fitted, and finished by hand - built to last, and built to be noticed by anyone who looks closely enough.'
        imageUrl='images/image3.png'
      />
      <Footer />
    </div>
  )
}
