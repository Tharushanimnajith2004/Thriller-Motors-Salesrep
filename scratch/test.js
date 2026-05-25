async function test() {
  try {
    console.log('Fetching /api/items from local Express server on port 5001...');
    const res = await fetch('http://localhost:5001/api/items');
    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('Items returned from database:', data);
  } catch (err) {
    console.error('Test Fetch Error:', err.message);
  }
}

test();
