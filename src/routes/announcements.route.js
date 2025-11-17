// routes/announcements.js
import express from 'express'
import { requirePermission } from '../middlewares/requirePermission.js'
import announcementsController from '../controllers/announcements.controller.js'

const router = express.Router()

router.get(
  '/',
  requirePermission('announcement', 'read'),
  announcementsController.listAnnouncements
)
router.get(
  '/:id',
  requirePermission('announcement', 'read'),
  announcementsController.getAnnouncement
)

router.post(
  '/',
  requirePermission('announcement', 'create'),
  announcementsController.createAnnouncement
)
router.put(
  '/:id',
  requirePermission('announcement', 'update'),
  announcementsController.updateAnnouncement
)
router.delete(
  '/:id',
  requirePermission('announcement', 'delete'),
  announcementsController.deleteAnnouncement
)

export default router
