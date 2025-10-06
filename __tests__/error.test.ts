import request from "supertest";
import express from "express";
import { errorHandler } from "../src/middlewares/errorHandler";

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

describe("Middleware errorHandler", () => {
  it("deve retornar 500 e payload de erro", async () => {
    const app = express();
    app.get("/boom", (_req, _res) => {
      throw new Error("Boom");
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Boom" });
  });

  it("deve respeitar status customizado no erro", async () => {
    const app = express();
    app.get("/boom400", (_req, _res) => {
      throw new HttpError(400, "Bad");
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom400");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Bad" });
  });

  it("não deve logar em produção (branch coverage)", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const consoleSpy = jest.spyOn(console, "error");

    const app = express();
    app.get("/boom-prod", (_req, _res) => {
      throw new Error("ProdBoom");
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom-prod");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "ProdBoom" });
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it("deve usar mensagem padrão quando err.message é vazio", async () => {
    const app = express();
    app.get("/boom-empty", (_req, _res) => {
      throw new Error("");
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom-empty");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });

  it("deve usar status 500 quando err.status está ausente e message definida", async () => {
    const app = express();
    app.get("/boom-status", (_req, _res) => {
      throw new Error("Defined message");
    });
    app.use(errorHandler);

    const res = await request(app).get("/boom-status");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Defined message" });
  });
});