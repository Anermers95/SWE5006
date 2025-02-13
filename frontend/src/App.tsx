import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './component/LoginForm'
import RegisterForm from './component/RegisterForm' // Import Register Page component
import HomePage from './component/HomePage'
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />}  />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  )
}

export default App
