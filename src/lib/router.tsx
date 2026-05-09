import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AdventurePage } from '../pages/AdventurePage'
import { BadgesPage } from '../pages/BadgesPage'
import { CharacterMomentPage } from '../pages/CharacterMomentPage'
import { DashboardPage } from '../pages/DashboardPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { RewardPage } from '../pages/RewardPage'
import { StoryPage } from '../pages/StoryPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <OnboardingPage />,
  },
  {
    path: '/app',
    element: <DashboardPage />,
  },
  {
    path: '/adventure',
    element: <AdventurePage />,
  },
  {
    path: '/character-moment',
    element: <CharacterMomentPage />,
  },
  {
    path: '/reward',
    element: <RewardPage />,
  },
  {
    path: '/story',
    element: <StoryPage />,
  },
  {
    path: '/badges',
    element: <BadgesPage />,
  },
  {
    path: '/packs',
    element: <BadgesPage />,
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])
