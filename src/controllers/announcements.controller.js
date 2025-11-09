import * as announcementsService from '../services/announcements.service.js'
import ApiError from '../utils/ApiError.js'
import catchAsync from '../utils/catchAsync.js'

export const listAnnouncements = catchAsync(async (req, res) => {
  const { page, limit, category, department } = req.query
  const result = await announcementsService.list({ page, limit, category, department })
  res.json(result)
})

export const getAnnouncement = catchAsync(async (req, res) => {
  const announcement = await announcementsService.getById(req.params.id)
  if (!announcement) throw new ApiError(404, 'Announcement not found')
  res.json(announcement)
})

export const createAnnouncement = catchAsync(async (req, res) => {
  const user = req.user

  const payload = {
    ...req.body,
    createdById: user.id,
  }

  const announcement = await announcementsService.create(payload)
  res.status(201).json(announcement)
})

export const updateAnnouncement = catchAsync(async (req, res) => {
  const user = req.user

  const id = req.params.id
  const existing = await announcementsService.getById(id)

  if (!existing) throw new ApiError(404, 'Announcement not found')
  if (existing.createdById !== user.id) throw new ApiError(403, 'Forbidden')

  const updated = await announcementsService.update(id, req.body)
  res.json(updated)
})

export const deleteAnnouncement = catchAsync(async (req, res) => {
  const user = req.user

  const id = req.params.id
  const existing = await announcementsService.getById(id)

  if (!existing) throw new ApiError(404, 'Announcement not found')
  if (existing.createdById !== user.id) throw new ApiError(403, 'Forbidden')

  await announcementsService.remove(id)
  res.status(204).end()
})

export default {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
}
