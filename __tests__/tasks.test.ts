import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma/client";

describe("GET /tasks", () => {
  it("deve retornar lista vazia quando não há tasks", async () => {
    const spy = jest
      .spyOn(prisma.task, "findMany")
      .mockResolvedValueOnce(
        [] as Awaited<ReturnType<typeof prisma.task.findMany>>
      );
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    spy.mockRestore();
  });

  it("deve retornar lista com include de usuário", async () => {
    const spy = jest.spyOn(prisma.task, "findMany").mockResolvedValueOnce([
      {
        id: 1,
        title: "T",
        description: "D",
        status: "pending",
        userId: 1,
        createdAt: new Date(),
      },
    ] as Awaited<ReturnType<typeof prisma.task.findMany>>);
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({
      id: 1,
      userId: 1,
    });
    spy.mockRestore();
  });
});

describe("POST /tasks", () => {
  const payload = {
    title: "T",
    description: "D",
    status: "pending",
    userId: 1,
  };

  it("deve criar task quando usuário existe", async () => {
    const userSpy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValueOnce({
        id: 1,
        name: "A",
        email: "a@a.com",
        createdAt: new Date(),
        tasks: [],
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);
    const createSpy = jest.spyOn(prisma.task, "create").mockResolvedValueOnce({
      id: 1,
      ...payload,
      createdAt: new Date(),
    } as Awaited<ReturnType<typeof prisma.task.create>>);

    const res = await request(app).post("/tasks").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, ...payload });

    userSpy.mockRestore();
    createSpy.mockRestore();
  });

  it("deve retornar 404 quando usuário não existe", async () => {
    const userSpy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValueOnce(null);
    const res = await request(app).post("/tasks").send(payload);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
    userSpy.mockRestore();
  });

  it("deve retornar 400 quando payload inválido", async () => {
    const res = await request(app).post("/tasks").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("deve definir status 'pending' por default quando não enviado", async () => {
    const userSpy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValueOnce({
        id: 1,
        name: "A",
        email: "a@a.com",
        createdAt: new Date(),
        tasks: [],
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);
    const createSpy = jest.spyOn(prisma.task, "create").mockResolvedValueOnce({
      id: 2,
      title: "T",
      description: "D",
      status: "pending",
      userId: 1,
      createdAt: new Date(),
    } as Awaited<ReturnType<typeof prisma.task.create>>);

    const res = await request(app)
      .post("/tasks")
      .send({ title: "T", description: "D", userId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");

    userSpy.mockRestore();
    createSpy.mockRestore();
  });
});

describe("GET /tasks/:id", () => {
  it("deve retornar task quando existe", async () => {
    const spy = jest.spyOn(prisma.task, "findUnique").mockResolvedValueOnce({
      id: 1,
      title: "T",
      description: "D",
      status: "pending",
      userId: 1,
      createdAt: new Date(),
    } as Awaited<ReturnType<typeof prisma.task.findUnique>>);
    const res = await request(app).get("/tasks/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    spy.mockRestore();
  });

  it("deve retornar 404 quando não existe", async () => {
    const spy = jest
      .spyOn(prisma.task, "findUnique")
      .mockResolvedValueOnce(null);
    const res = await request(app).get("/tasks/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task not found" });
    spy.mockRestore();
  });

  it("deve retornar task com include de usuário", async () => {
    const spy = jest.spyOn(prisma.task, "findUnique").mockResolvedValueOnce({
      id: 1,
      title: "T",
      description: "D",
      status: "pending",
      userId: 1,
      createdAt: new Date(),
      user: { id: 1, name: "A", email: "a@a.com" },
    } as Awaited<ReturnType<typeof prisma.task.findUnique>>);
    const res = await request(app).get("/tasks/1");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      user: { id: 1, name: "A", email: "a@a.com" },
    });
    spy.mockRestore();
  });
});

describe("PUT /tasks/:id", () => {
  it("deve atualizar quando existe", async () => {
    const spy = jest.spyOn(prisma.task, "update").mockResolvedValueOnce({
      id: 1,
      title: "T2",
      description: "D2",
      status: "done",
      userId: 1,
      createdAt: new Date(),
    } as Awaited<ReturnType<typeof prisma.task.update>>);
    const res = await request(app)
      .put("/tasks/1")
      .send({ title: "T2", description: "D2", status: "done" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
    spy.mockRestore();
  });

  it("deve retornar 400 quando payload inválido", async () => {
    const res = await request(app).put("/tasks/1").send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("deve retornar 404 quando não existe", async () => {
    const spy = jest
      .spyOn(prisma.task, "update")
      .mockRejectedValueOnce(new Error("not found"));
    const res = await request(app).put("/tasks/999").send({ title: "T" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task not found" });
    spy.mockRestore();
  });
});

describe("DELETE /tasks/:id", () => {
  it("deve retornar 204 quando exclui", async () => {
    const spy = jest.spyOn(prisma.task, "delete").mockResolvedValueOnce({
      id: 1,
      title: "T",
      description: "D",
      status: "pending",
      userId: 1,
      createdAt: new Date(),
    } as Awaited<ReturnType<typeof prisma.task.delete>>);
    const res = await request(app).delete("/tasks/1");
    expect(res.status).toBe(204);
    spy.mockRestore();
  });

  it("deve retornar 404 quando não existe", async () => {
    const spy = jest
      .spyOn(prisma.task, "delete")
      .mockRejectedValueOnce(new Error("not found"));
    const res = await request(app).delete("/tasks/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Task not found" });
    spy.mockRestore();
  });
});
