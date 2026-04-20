import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginPage } from '@/pages/auth/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}