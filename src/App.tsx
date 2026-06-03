import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

export type MediaItem = {
  src: string;
  title?: string;
  description: string;
};

export type ProjectData = {
  id?: number;
  name?: string;
  description?: string;
  disclaimer?: string;
  links?: Array<{ label: string; url: string }>;
  thumbnail?: string;
  thumbnailPosition?: string;
  media?: MediaItem[];
  category?: string;
  year?: number;
};

export type Data = ProjectData[];

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </Router>
  );
}
