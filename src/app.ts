import express, { Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import tasksRouter from './routes/tasks.routes'
import { errorHandler } from './middlewares/errorHandler'

export const app = express()

app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.use('/users', usersRouter)
app.use('/tasks', tasksRouter)

app.use(errorHandler)