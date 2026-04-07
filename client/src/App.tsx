import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import Feed from './pages/Feed'
import Login from './pages/Login'
import MyPets from './pages/MyPets'
import PetProfile from './pages/PetProfile'
import PostPet from './pages/PostPet'
import Register from './pages/Register'

function Layout() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-stone-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex-1 w-full max-w-lg mx-auto px-4 pb-8">
        <Outlet />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/feed" replace />} />
        <Route path="feed" element={<Feed />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="pet/:id" element={<PetProfile />} />
        <Route
          path="post"
          element={
            <ProtectedRoute>
              <PostPet />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-pets"
          element={
            <ProtectedRoute>
              <MyPets />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}
