import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AccountPage } from '../pages/AccountPage'
import { AdventurePage } from '../pages/AdventurePage'
import { BadgesPage } from '../pages/BadgesPage'
import { CharacterMomentPage } from '../pages/CharacterMomentPage'
import { DashboardPage } from '../pages/DashboardPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { PacksPage } from '../pages/PacksPage'
import { PrivacyPage } from '../pages/PrivacyPage'
import { RewardPage } from '../pages/RewardPage'
import { StoryPage } from '../pages/StoryPage'
import { TermsPage } from '../pages/TermsPage'

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
    element: <PacksPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/account',
    element: <AccountPage />,
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])
