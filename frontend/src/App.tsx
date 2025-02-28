import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './component/LoginForm'
import RegisterForm from './component/RegisterForm' // Import Register Page component
import HomePage from './component/HomePage'
import Dashboard from './component/Dashboard'
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />}  />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path = "Dashboard" element={<Dashboard/>}/>
      </Routes>
    </Router>
  )
}

export default App
