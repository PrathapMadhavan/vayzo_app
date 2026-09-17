const data = {
  name: "Pizza Hub",
  ownerName: "Pradhap",
  city: "Chennai",
  cuisineType: "Italian, Fast Food",
  deliveryTime: "20-30 mins",
  status: "Active"
};

fetch('http://localhost:3000/api/v1/admin/restaurants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(async (r) => {
  console.log("Status:", r.status);
  console.log("Response:", await r.text());
})
.catch(e => console.error("Error:", e));
