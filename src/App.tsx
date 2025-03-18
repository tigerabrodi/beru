import { Route, Routes } from 'react-router'
import { AuthenticatedLayout } from './layouts/authenticated'
import { ROUTES } from './lib/constants'
import { DashboardPage } from './pages/dashboard'
import { LoginPage } from './pages/login'
import { SettingsPage } from './pages/settings'
import { StoryDetailPage } from './pages/story-detail'

export function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.storyDetail} element={<StoryDetailPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
