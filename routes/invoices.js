const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM invoices");
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let { amt, paid } = req.body;
    let paidDate = null;
    const update = await db.query(
      "UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id= $4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [amt, paid, paidDate, id]
    );
    if (update.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteInvoice = await db.query("DELETE FROM invoices WHERE id=$1", [
      id,
    ]);
    if (deleteInvoice.rows.length === 0) {
      throw new ExpressError(`Unable to locate that invoice ${id}`);
    }
    return res.send({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});
module.exports = router;
