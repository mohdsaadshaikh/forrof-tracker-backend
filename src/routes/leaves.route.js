import express from 'express'
import { requirePermission } from '../middlewares/requirePermission.js'
import { requireAuth } from '../middlewares/authMiddleware.js'
import leavesController from '../controllers/leaves.controller.js'

const router = express.Router()

router.get('/my-leaves', requireAuth, leavesController.getMyLeaves)
router.get('/stats', requireAuth, leavesController.getLeaveStats)
router.post('/', requirePermission('leave', 'create'), leavesController.createLeave)

router.put('/:id', requireAuth, leavesController.updateLeave)
// router.delete('/:id', requireAuth, leavesController.deleteLeave)

router.get('/', requirePermission('leave', 'read'), leavesController.listLeaves)
router.patch(
  '/:id/approve',
  requirePermission('leave', 'edit'),
  leavesController.approveLeave
)

router.put('/:id', requirePermission('leave', 'edit'), leavesController.updateLeave)

router.get('/:id', requirePermission('leave', 'read'), leavesController.getLeave)

router.delete('/:id', requirePermission('leave', 'delete'), leavesController.deleteLeave)

export default router
