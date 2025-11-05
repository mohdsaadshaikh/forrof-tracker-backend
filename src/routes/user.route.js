import express from 'express'
import { reportIssue } from '../controllers/user.controller.js'

const router = express.Router()

router.post('/report', reportIssue)

export default router
