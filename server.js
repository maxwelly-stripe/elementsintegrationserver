const express = require("express");
const app = express();
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")('sk_test_51NO1YjH5aAv8RRbVCXD10oGtuWgqCXWpGE0hzLjbKKUsYn6YNAVcVM6FMF5pEw9ngt7POXS1haYaJgNLdh2phQ7H00yj5kztSe');

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

const chargeCustomer = async (customerId) => {
    // Lookup the payment methods available for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    try {
      // Charge the customer and payment method immediately
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 10000,
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true,
      });
    } catch (err) {
      // Error code will be authentication_required if authentication is needed
      console.log("Error code is: ", err.code);
      const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
      console.log("PI retrieved: ", paymentIntentRetrieved.id);
    }
  };

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  const customer = await stripe.customers.create();
  console.log(calculateOrderAmount(items));

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    amount: 50000,
    currency: "cad",
    payment_method_types: ['card', 'affirm', 'klarna'],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));