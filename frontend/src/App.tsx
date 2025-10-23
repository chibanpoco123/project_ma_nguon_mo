// src/App.tsx
import Header from './components/Header';
import InfoBar from './components/Main/InfoBar';
import HeroBanner from './components/Main/HeroBanner';
import NewArrivals from './components/Main/NewArrivals';
import BoSuuTap from './components/Main/BoSuuTap';
import InstagramFeed from './components/Main/InstagramFeed';
import Footer from './components/Footer';
import NewArri from './components/Main/NewArri';
import NewArrihai from './components/Main/NewArrihai';
import Quanshort from './components/Main/Quanshort';
import TimHieu from './components/Main/TimHieu';


// Import CSS tùy chỉnh
import './App.css';

function App() {
  return (
    <>
  
      <Header />
     
      <main>
        <HeroBanner />
        <InfoBar />
        <NewArrivals />
        <NewArri />
        <NewArrihai />
        <Quanshort />
        <BoSuuTap />
        <TimHieu/>

        <InstagramFeed />
      </main>
      <Footer />
    </>
  );
}

export default App;