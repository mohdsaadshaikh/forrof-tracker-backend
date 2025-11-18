import { ENV } from '../config/env.js'
import express from 'express'

import docsRoute from './docs.route.js'
import userRoute from './user.route.js'
import announcementsRoute from './announcements.route.js'
import leavesRoute from './leaves.route.js'

const router = express.Router()

const defaultRoutes = [
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/announcements',
    route: announcementsRoute,
  },
  {
    path: '/leaves',
    route: leavesRoute,
  },
]

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
]

defaultRoutes.forEach(route => {
  router.use(route.path, route.route)
})

/* istanbul ignore next */
if (ENV.NODE_ENV === 'development') {
  devRoutes.forEach(route => {
    router.use(route.path, route.route)
  })
}

export default router
