const axios = require("axios");
const paymentModel = require("../models/paymentModel");

exports.initiatePayment = async (req, res) => {
  const { amount, order_id } = req.body;

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://localhost:3000/payment-return",
        website_url: "http://localhost:3000",
        amount: amount,
        purchase_order_id: order_id,
        purchase_order_name: "Payment"
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { pidx } = req.body;

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`
        }
      }
    );

    const data = response.data;

    if (data.status === "Completed") {

      paymentModel.savePayment(
        {
          order_id: data.purchase_order_id,
          pidx: data.pidx,
          amount: data.amount,
          transaction_id: data.transaction_id,
          status: data.status
        },
        (err) => {
          if (err) return res.status(500).json(err);
        }
      );

      return res.json({ success: true });
    }

    res.json({ success: false, status: data.status });

  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
};