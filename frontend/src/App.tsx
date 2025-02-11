import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './component/LoginForm'
import RegisterForm from './component/RegisterForm' // Import Register Page component

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LoginForm />}  />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  )
}

export default App
