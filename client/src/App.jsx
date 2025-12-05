import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import FutureAnalysis from './pages/FutureAnalysis';
import Categories from './pages/Categories';
import MyCompanies from './pages/MyCompanies';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import CompanyDetail from './pages/CompanyDetail';
import AppShell from './components/AppShell';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/future-analysis" element={<FutureAnalysis />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/my-companies" element={<MyCompanies />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
