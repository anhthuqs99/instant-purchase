import { environment } from '@environment';

export async function hashOrderChecksum(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const max = Math.floor(
    hashHex.length - parseFloat(environment.orderCodeLength)
  );
  const index = Math.floor(Math.random() * (max + 1));
  return hashHex.substring(
    index,
    index + parseFloat(environment.orderCodeLength)
  );
}
