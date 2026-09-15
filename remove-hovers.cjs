const fs = require('fs');
const path = require('path');
const dir = './src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  let original = content;
  
  // Replace <tr ... className="... hover:bg-background ..."> with just <tr ...>
  // We'll just replace the specific strings to be safe
  content = content.replace(/className="border-t border-border transition-colors hover:bg-background"/g, "");
  content = content.replace(/className="hover:bg-background\/50"/g, "");
  content = content.replace(/className="hover:bg-background\/50 border-b border-border last:border-0"/g, "");
  content = content.replace(/className="border-b border-border last:border-0 hover:bg-surface-hover"/g, "");
  
  if (content !== original) {
    fs.writeFileSync(path.join(dir, f), content);
    console.log('Updated ' + f);
  }
});
