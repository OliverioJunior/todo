import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { createUser, listUsers, getUser, updateUser, deleteUser } from '../controllers/users.controller'

const router = Router()

router.post('/', asyncHandler(createUser))
router.get('/', asyncHandler(listUsers))
router.get('/:id', asyncHandler(getUser))
router.put('/:id', asyncHandler(updateUser))
router.delete('/:id', asyncHandler(deleteUser))

export default router