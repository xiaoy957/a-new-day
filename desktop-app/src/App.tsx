import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Search } from './pages/Search'
import { Detail } from './pages/Detail'
import { Statistics } from './pages/Statistics'
import { Admin } from './pages/Admin'
import { Favorites } from './pages/Favorites'
import { Login } from './pages/Login'
import { useStore } from './stores/useStore'

function App() {
  const { isAuthenticated } = useStore()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="detail/:id" element={<Detail />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  )
}

export default App