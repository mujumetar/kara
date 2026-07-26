const fs = require('fs');

let code = fs.readFileSync('src/AdminPanel.jsx', 'utf8');

// Replace style={styles.xyz}
code = code.replace(/style=\{styles\.([a-zA-Z0-9_]+)\}/g, 'className="admin-$1"');

// Replace style={timelineStyles.xyz}
code = code.replace(/style=\{timelineStyles\.([a-zA-Z0-9_]+)\}/g, 'className="timeline-$1"');

// Replace multi-line style={{ ...styles.xyz, ... }}
// Since they can be multi-line, we'll use a replacer function
code = code.replace(/style=\{\{\s*\.\.\.styles\.([a-zA-Z0-9_]+),([\s\S]*?)\}\}/g, (match, p1, p2) => {
  return `className="admin-${p1}" style={{${p2}}}`;
});

code = code.replace(/style=\{\{\s*\.\.\.timelineStyles\.([a-zA-Z0-9_]+),([\s\S]*?)\}\}/g, (match, p1, p2) => {
  return `className="timeline-${p1}" style={{${p2}}}`;
});

// Remove the `const styles = { ... };` and `const timelineStyles = { ... };` blocks
code = code.replace(/\/\*\s*================= MODERN STYLES =================\s*\*\/[\s\S]*$/, '');

// Insert import "./AdminPanel.css";
if (!code.includes('AdminPanel.css')) {
  code = code.replace('import API from "./api";', 'import API from "./api";\nimport "./AdminPanel.css";');
}

fs.writeFileSync('src/AdminPanel.jsx', code);
console.log("Refactored AdminPanel.jsx");
