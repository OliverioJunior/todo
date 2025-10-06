import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createUserSchema, updateUserSchema } from '../validation/user.schema'

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const { name, email } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email already exists' })

  const user = await prisma.user.create({ data: { name, email } })
  res.status(201).json(user)
}

export const listUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })
  res.json(users)
}

export const getUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
}

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const data: any = {}
  if (typeof parsed.data.name !== 'undefined') data.name = parsed.data.name
  if (typeof parsed.data.email !== 'undefined') data.email = parsed.data.email

  try {
    const updated = await prisma.user.update({ where: { id }, data })
    res.json(updated)
  } catch (e) {
    res.status(404).json({ error: 'User not found' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  try {
    await prisma.user.delete({ where: { id } })
    res.status(204).send()
  } catch (e) {
    res.status(404).json({ error: 'User not found' })
  }
}