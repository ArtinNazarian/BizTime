const express = require("express");
const ExpressError = require("../expressError");
// const slugify = require("slugify");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM companies");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    const { code } = req.params;

    const result = await db.query(
      `SELECT code, name, description
         FROM companies
         WHERE code = $1`,
      [code]
    );

    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = name.toLowerCase();
    const result = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    let newCode = code.toLocaleLowerCase();
    const { name, description } = req.body;
    const result = await db.query(
      "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
      [name, description, newCode]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(
        `Unable to find a company with code of ${code}`,
        404
      );
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// router.delete("/:code", async (req, res, next) => {
//   try {
//     const { code } = req.params;
//     const result = await db.query("DELETE FROM companies WHERE code=$1", [
//       code,
//     ]);
//     if (result.rows.length === 0) {
//       throw new ExpressError(`No such company with code ${code}`, 404);
//     }
//     return res.status(201).json({ status: "deleted" });
//   } catch (e) {
//     return next(e);
//   }
// });

router.delete("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const result = await db.query(
      `DELETE FROM companies
             WHERE code=$1
             RETURNING code`,
      [code]
    );

    if (result.rows.length == 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    } else {
      return res.json({ status: "deleted" });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
