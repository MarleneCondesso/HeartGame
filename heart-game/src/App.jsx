import { Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar.jsx";

import Home from "./pages/Home.jsx";
import Reasons from "./pages/Reasons.jsx";
import Timeline from "./pages/Timeline.jsx";
import Gallery from "./pages/Gallery.jsx";
import Quiz from "./pages/Quiz.jsx";
import Game from "./pages/Game.jsx";
import Final from "./pages/Final.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/reasons" element={<Reasons />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/quiz" element={<Quiz />} />

        <Route path="/game" element={<Game />} />
        <Route path="/final" element={<Final />} />
      </Routes>
    </>
  );
}
