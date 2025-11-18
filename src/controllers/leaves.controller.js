import * as leavesService from '../services/leaves.service.js'
import ApiError from '../utils/ApiError.js'
import catchAsync from '../utils/catchAsync.js'
import { validate } from '../middlewares/validate.js'
import {
  createLeaveSchema,
  updateLeaveSchema,
  approveLeaveSchema,
  listLeaveSchema,
} from '../validations/leaves.js'

export const listLeaves = catchAsync(async (req, res) => {
  const validatedQuery = await validate(listLeaveSchema, req.query)
  const result = await leavesService.list(validatedQuery)
  res.json(result)
})

export const getLeave = catchAsync(async (req, res) => {
  const leave = await leavesService.getById(req.params.id)
  if (!leave) throw new ApiError(404, 'Leave not found')
  res.json(leave)
})

export const getMyLeaves = catchAsync(async (req, res) => {
  const user = req.user
  const { page, limit, status } = req.query

  const result = await leavesService.getByEmployeeId(user.id, {
    page,
    limit,
    status,
  })
  res.json(result)
})

export const createLeave = catchAsync(async (req, res) => {
  const user = req.user
  console.log('Raw request body:', req.body)
  console.log('User:', user)

  const validatedData = await validate(createLeaveSchema, req.body)
  console.log('Validated data:', validatedData)

  const payload = {
    ...validatedData,
    employeeId: user.id,
  }
  console.log('Payload to service:', payload)

  const leave = await leavesService.create(payload)
  res.status(201).json(leave)
})

export const updateLeave = catchAsync(async (req, res) => {
  const user = req.user
  const id = req.params.id

  const existing = await leavesService.getById(id)

  if (!existing) throw new ApiError(404, 'Leave not found')
  if (existing.employeeId !== user.id && user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden')
  }
  if (existing.status !== 'PENDING' && user.role !== 'admin') {
    throw new ApiError(400, 'Cannot update leave that is already approved or rejected')
  }

  const validatedData = await validate(updateLeaveSchema, req.body)
  const updated = await leavesService.update(id, validatedData)
  res.json(updated)
})

export const approveLeave = catchAsync(async (req, res) => {
  const user = req.user
  const id = req.params.id

  const existing = await leavesService.getById(id)

  if (!existing) throw new ApiError(404, 'Leave not found')
  if (user.role !== 'admin') throw new ApiError(403, 'Only admins can approve leaves')

  const validatedData = await validate(approveLeaveSchema, req.body)
  const approved = await leavesService.approve(id, validatedData, user.id)
  res.json(approved)
})

export const deleteLeave = catchAsync(async (req, res) => {
  const user = req.user
  const id = req.params.id

  const existing = await leavesService.getById(id)

  if (!existing) throw new ApiError(404, 'Leave not found')
  if (existing.employeeId !== user.id && user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden')
  }

  await leavesService.remove(id)
  res.status(204).end()
})

export const getLeaveStats = catchAsync(async (req, res) => {
  const user = req.user
  const stats = await leavesService.getStats(user.id)
  res.json(stats)
})

export default {
  listLeaves,
  getLeave,
  getMyLeaves,
  createLeave,
  updateLeave,
  approveLeave,
  deleteLeave,
  getLeaveStats,
}
