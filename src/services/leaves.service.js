import prisma from '../config/prisma.js'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  const diff = end.getTime() - start.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1

  if (days < 1) throw new Error('End date must be same or after start date')
  return days
}
export async function list({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  status,
  leaveType,
  employeeId,
  department,
  startDate,
  endDate,
  sortBy = 'createdAt',
  order = 'desc',
}) {
  page = Number(page) || DEFAULT_PAGE
  limit = Math.min(Number(limit) || DEFAULT_LIMIT, 100)

  const where = {}

  if (status) where.status = status
  if (leaveType) where.leaveType = leaveType
  if (employeeId) where.employeeId = employeeId

  if (startDate || endDate) {
    where.AND = []
    if (startDate) {
      where.AND.push({
        startDate: { gte: new Date(startDate) },
      })
    }
    if (endDate) {
      where.AND.push({
        endDate: { lte: new Date(endDate) },
      })
    }
  }

  const validSortFields = ['createdAt', 'startDate', 'endDate', 'status', 'duration']
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
  const sortOrder = order === 'asc' ? 'asc' : 'desc'

  const [items, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.leave.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: items,
  }
}

export async function getById(id) {
  return prisma.leave.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function getByEmployeeId(employeeId, options = {}) {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, status } = options

  const take = Number(limit) || DEFAULT_LIMIT
  const skip = Number(page) > 1 ? (Number(page) - 1) * take : 0

  const where = { employeeId }
  if (status) where.status = status

  const [items, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.leave.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: items,
  }
}

export async function create(payload) {
  let { startDate, endDate, ...data } = payload

  if (!startDate) {
    throw new Error('startDate is required')
  }
  if (!endDate) {
    throw new Error('endDate is required')
  }
  const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : startDate
  const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (isNaN(parsedStartDate.getTime())) {
    throw new Error(`Invalid startDate: ${startDate}`)
  }
  if (isNaN(parsedEndDate.getTime())) {
    throw new Error(`Invalid endDate: ${endDate}`)
  }

  const duration = calculateDuration(parsedStartDate, parsedEndDate)

  return prisma.leave.create({
    data: {
      ...data,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      duration,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function update(id, payload) {
  const existing = await prisma.leave.findUnique({ where: { id } })
  if (!existing) return null

  let updateData = { ...payload }

  if (payload.startDate || payload.endDate) {
    const startDate = payload.startDate
      ? payload.startDate instanceof Date
        ? payload.startDate
        : new Date(payload.startDate)
      : existing.startDate
    const endDate = payload.endDate
      ? payload.endDate instanceof Date
        ? payload.endDate
        : new Date(payload.endDate)
      : existing.endDate

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date values in update payload')
    }

    const duration = calculateDuration(startDate, endDate)
    updateData.duration = duration
    updateData.startDate = startDate
    updateData.endDate = endDate
  }

  return prisma.leave.update({
    where: { id },
    data: updateData,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function approve(id, { status }) {
  return prisma.leave.update({
    where: { id },
    data: {
      status,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function remove(id) {
  return prisma.leave.delete({ where: { id } })
}

export async function getStats(employeeId) {
  const leaves = await prisma.leave.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
    },
  })

  const stats = {
    totalDays: 0,
    byType: {},
  }

  leaves.forEach(leave => {
    stats.totalDays += leave.duration
    if (!stats.byType[leave.leaveType]) {
      stats.byType[leave.leaveType] = 0
    }
    stats.byType[leave.leaveType] += leave.duration
  })

  return stats
}
