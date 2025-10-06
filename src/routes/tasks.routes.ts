import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { createTask, listTasks, getTask, updateTask, deleteTask } from '../controllers/tasks.controller'

const router = Router()

router.post('/', asyncHandler(createTask))
router.get('/', asyncHandler(listTasks))
router.get('/:id', asyncHandler(getTask))
router.put('/:id', asyncHandler(updateTask))
router.delete('/:id', asyncHandler(deleteTask))

export default router