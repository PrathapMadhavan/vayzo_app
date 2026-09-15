const fs = require('fs');

try {
  let content = fs.readFileSync('db.json', 'utf-8');
  
  // db.json is an object with arrays. 
  // Let's replace the conflict markers in a way that combines array elements.
  
  // Replace the conflict markers
  content = content.replace(/<<<<<<< HEAD\r?\n/g, '');
  content = content.replace(/=======\r?\n/g, ',\n');
  content = content.replace(/>>>>>>> feature\/users\r?\n/g, '');
  
  // Validate JSON
  try {
    JSON.parse(content);
    fs.writeFileSync('db.json', content);
    console.log('db.json successfully merged and validated!');
  } catch (e) {
    console.log('JSON validation failed. Fixing trailing commas...');
    // A more robust way to fix trailing commas
    content = content.replace(/,\s*}/g, '}');
    content = content.replace(/,\s*]/g, ']');
    try {
      JSON.parse(content);
      fs.writeFileSync('db.json', content);
      console.log('db.json successfully merged and validated after fixing commas!');
    } catch (e2) {
      console.log('Failed again:', e2.message);
      fs.writeFileSync('db_broken.json', content);
    }
  }
} catch (e) {
  console.error(e);
}
