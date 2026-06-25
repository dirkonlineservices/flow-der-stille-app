const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/#F7F6F2/gi, 'var(--color-bg-alt)');
  content = content.replace(/#3D3B35/gi, 'var(--color-text-main)');
  content = content.replace(/#695C4D/gi, 'var(--color-text-muted)');
  content = content.replace(/#E3E1D9/gi, 'var(--color-border-main)');
  content = content.replace(/#8A9A8A/gi, 'var(--color-accent-primary)');
  content = content.replace(/#728372/gi, 'var(--color-accent-hover)');
  content = content.replace(/var\(--color-accent-olive\)/gi, 'var(--color-accent-primary)');
  content = content.replace(/var\(--color-accent-olive-hover\)/gi, 'var(--color-accent-hover)');
  content = content.replace(/var\(--color-bg-warm\)/gi, 'var(--color-bg-body)');
  content = content.replace(/#ECEBE4/gi, 'var(--color-bg-alt-darker)');
  content = content.replace(/#FFFFFF/gi, 'var(--color-bg-card)');
  content = content.replace(/bg-white/gi, 'bg-[var(--color-bg-card)]');
  content = content.replace(/text-stone-800/gi, 'text-[var(--color-text-main)]');
  content = content.replace(/text-stone-700/gi, 'text-[var(--color-text-main)]');
  content = content.replace(/text-stone-600/gi, 'text-[var(--color-text-muted)]');
  content = content.replace(/text-stone-500/gi, 'text-[var(--color-text-muted)]');
  content = content.replace(/text-stone-400/gi, 'text-[var(--color-text-muted-light)]');
  content = content.replace(/bg-stone-50/gi, 'bg-[var(--color-bg-alt)]');
  content = content.replace(/bg-stone-100/gi, 'bg-[var(--color-bg-border)]');
  content = content.replace(/border-stone-100/gi, 'border-[var(--color-border-main)]');
  content = content.replace(/border-stone-200/gi, 'border-[var(--color-border-main)]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Replacements completed.');
