import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './component/LoginForm'
import RegisterForm from './component/RegisterForm' // Import Register Page component
import HomePage from './component/HomePage'
import Dashboard from './component/Dashboard'
import RoomListings from './component/BookRoom'
import RoomManagement from './component/RoomManagement'
import RoomForm from './component/RoomForm'

//ProtectedRoute
import ProtectedRoute from './security/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />}  />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/home" element={<HomePage />} />

        {/* Protect the route */}
        <Route path = "/dashboard" element={<ProtectedRoute element={<Dashboard />} />}/>
        <Route path="/book" element={<RoomListings />} />
        <Route path="/room" element={<RoomManagement />} />
        <Route path="/room/create" element={<RoomForm />} />




      </Routes>
    </Router>
  )
}

export default App
