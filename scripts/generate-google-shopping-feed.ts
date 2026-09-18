import fs from 'fs';
import path from 'path';
import { generateGoogleShoppingXml } from '../src/lib/googleShoppingFeed';

const xml = generateGoogleShoppingXml();
const targetPath = path.resolve(process.cwd(), 'public', 'google-shopping-feed.xml');

fs.writeFileSync(targetPath, xml, 'utf8');
console.log(`[Google Shopping] Feed erfolgreich generiert: ${targetPath} (${Buffer.byteLength(xml)} Bytes)`);
