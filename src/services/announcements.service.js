import prisma from '../config/prisma.js'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export async function list({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  category,
  department,
}) {
  page = Number(page) || DEFAULT_PAGE
  limit = Math.min(Number(limit) || DEFAULT_LIMIT, 100)

  const whereConditions = []

  if (category) {
    whereConditions.push({ category })
  }

  if (department) {
    whereConditions.push({
      OR: [{ department: department }, { department: null }, { department: '' }],
    })
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.announcement.count({ where }),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: items,
  }
}

export async function getById(id) {
  return prisma.announcement.findUnique({
    where: { id },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })
}

export async function create(payload) {
  return prisma.announcement.create({ data: payload })
}

export async function update(id, payload) {
  return prisma.announcement.update({ where: { id }, data: payload })
}

export async function remove(id) {
  return prisma.announcement.delete({ where: { id } })
}
