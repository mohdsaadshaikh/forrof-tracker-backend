import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

export const statement = {
  ...defaultStatements,

  announcement: ['create', 'read', 'update', 'delete'],
}

export const ac = createAccessControl(statement)

export const employee = ac.newRole({
  announcement: ['read'],
})

export const admin = ac.newRole({
  announcement: ['create', 'read', 'update', 'delete'],
  ...adminAc.statements,
})
