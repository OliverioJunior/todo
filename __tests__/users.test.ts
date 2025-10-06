import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma/client";

describe("GET /users", () => {
  it("deve retornar lista vazia quando não há usuários", async () => {
    const spy = jest
      .spyOn(prisma.user, "findMany")
      .mockResolvedValueOnce(
        [] as Awaited<ReturnType<typeof prisma.user.findMany>>
      );
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    spy.mockRestore();
  });
});

describe("POST /users", () => {
  it("deve criar usuário quando email não existe", async () => {
    const payload = { name: "Alice", email: "alice@example.com" };

    const findUniqueSpy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValueOnce(null);
    const createSpy = jest
      .spyOn(prisma.user, "create")
      .mockResolvedValueOnce({
        id: 1,
        ...payload,
        createdAt: new Date(),
      } as Awaited<ReturnType<typeof prisma.user.create>>);

    const res = await request(app).post("/users").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, ...payload });

    findUniqueSpy.mockRestore();
    createSpy.mockRestore();
  });

  it("deve retornar 409 quando email já existe", async () => {
    const payload = { name: "Bob", email: "bob@example.com" };

    const findUniqueSpy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValueOnce({
        id: 2,
        ...payload,
        createdAt: new Date(),
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);

    const res = await request(app).post("/users").send(payload);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Email already exists" });

    findUniqueSpy.mockRestore();
  });

  it("deve retornar 400 quando payload inválido", async () => {
    const res = await request(app)
      .post("/users")
      .send({ name: "", email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe("GET /users/:id", () => {
  it("deve retornar usuário quando existe", async () => {
    const spy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValueOnce({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        createdAt: new Date(),
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);
    const res = await request(app).get("/users/1");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
    });
    spy.mockRestore();
  });

  it("deve retornar 404 quando não existe", async () => {
    const spy = jest
      .spyOn(prisma.user, "findUnique")
      .mockResolvedValueOnce(null);
    const res = await request(app).get("/users/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
    spy.mockRestore();
  });
});

describe("PUT /users/:id", () => {
  it("deve atualizar quando existe", async () => {
    const spy = jest
      .spyOn(prisma.user, "update")
      .mockResolvedValueOnce({
        id: 1,
        name: "Alice 2",
        email: "alice2@example.com",
        createdAt: new Date(),
      } as Awaited<ReturnType<typeof prisma.user.update>>);
    const res = await request(app)
      .put("/users/1")
      .send({ name: "Alice 2", email: "alice2@example.com" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      name: "Alice 2",
      email: "alice2@example.com",
    });
    spy.mockRestore();
  });

  it("deve retornar 400 quando payload inválido", async () => {
    const res = await request(app).put("/users/1").send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("deve retornar 404 quando não existe", async () => {
    const spy = jest
      .spyOn(prisma.user, "update")
      .mockRejectedValueOnce(new Error("not found"));
    const res = await request(app).put("/users/999").send({ name: "Alice" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
    spy.mockRestore();
  });
});

describe("DELETE /users/:id", () => {
  it("deve retornar 204 quando exclui", async () => {
    const spy = jest
      .spyOn(prisma.user, "delete")
      .mockResolvedValueOnce({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        createdAt: new Date(),
      } as Awaited<ReturnType<typeof prisma.user.delete>>);
    const res = await request(app).delete("/users/1");
    expect(res.status).toBe(204);
    spy.mockRestore();
  });

  it("deve retornar 404 quando não existe", async () => {
    const spy = jest
      .spyOn(prisma.user, "delete")
      .mockRejectedValueOnce(new Error("not found"));
    const res = await request(app).delete("/users/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
    spy.mockRestore();
  });
});
