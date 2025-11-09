import express from 'express'
import validate from '../middlewares/validate.js'
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementSchema,
} from '../validations/announcements.js'
import announcementsController from '../controllers/announcements.controller.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get(
  '/',
  requireAuth,
  validate(listAnnouncementSchema, 'query'),
  announcementsController.listAnnouncements
)

router.get('/:id', announcementsController.getAnnouncement)

router.post(
  '/',
  requireAuth,
  validate(createAnnouncementSchema, 'body'),
  announcementsController.createAnnouncement
)

router.put(
  '/:id',
  requireAuth,
  validate(updateAnnouncementSchema, 'body'),
  announcementsController.updateAnnouncement
)

router.delete('/:id', requireAuth, announcementsController.deleteAnnouncement)

export default router
