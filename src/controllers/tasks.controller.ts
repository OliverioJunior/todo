import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { createTaskSchema, updateTaskSchema } from '../validation/task.schema'

export const createTask = async (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })
  const { title, description, status, userId } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const task = await prisma.task.create({
    data: { title, description, status: status ?? 'pending', userId },
  })
  res.status(201).json(task)
}

export const listTasks = async (_req: Request, res: Response) => {
  const tasks = await prisma.task.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { id: 'asc' },
  })
  res.json(tasks)
}

export const getTask = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const task = await prisma.task.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
}

export const updateTask = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const parsed = updateTaskSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

  const data: any = {}
  if (typeof parsed.data.title !== 'undefined') data.title = parsed.data.title
  if (typeof parsed.data.description !== 'undefined') data.description = parsed.data.description
  if (typeof parsed.data.status !== 'undefined') data.status = parsed.data.status

  try {
    const updated = await prisma.task.update({ where: { id }, data })
    res.json(updated)
  } catch (e) {
    res.status(404).json({ error: 'Task not found' })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  try {
    await prisma.task.delete({ where: { id } })
    res.status(204).send()
  } catch (e) {
    res.status(404).json({ error: 'Task not found' })
  }
}