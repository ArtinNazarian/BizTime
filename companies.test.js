process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("./app");
const slugify = require("slugify");

const db = require("./db");

let testCompany;

beforeEach(async () => {
  let result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('amazon','AMAZON', 'tech') RETURNING code, name, description`
  );
  testCompany = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("get a list of companies", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/amazon", () => {
  test("get a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany });
  });
});

describe("POST /companies", () => {
  test("Add new compnay", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: "ford", name: "FORD", description: "automotive" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: expect.any(String),
        name: "FORD",
        description: "automotive",
      },
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Update company", async () => {
    const res = await request(app)
      .put(`/companies/${testCompany.code}`)
      .send({ name: "AMAZON", description: "evil corp" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: testCompany.code,
        name: "AMAZON",
        description: "evil corp",
      },
    });
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });
});
