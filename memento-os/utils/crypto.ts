import { subtle } from 'crypto';

export interface X25519KeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateKeyPair(): Promise<X25519KeyPair> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available');
  }

  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'X25519',
        namedCurve: 'X25519',
      },
      true,
      ['deriveKey', 'deriveBits']
    );

    const publicKey = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: Buffer.from(publicKey).toString('base64'),
      privateKey: Buffer.from(privateKey).toString('base64')
    };
  } catch (error) {
    console.error('Failed to generate key pair:', error);
    throw error;
  }
}

export async function deriveSharedSecret(privateKey: string, publicKey: string): Promise<string> {
  const importedPrivateKey = await subtle.importKey(
    'pkcs8',
    Buffer.from(privateKey, 'base64'),
    {
      name: 'X25519',
      namedCurve: 'X25519',
    },
    false,
    ['deriveKey', 'deriveBits']
  );

  const importedPublicKey = await subtle.importKey(
    'raw',
    Buffer.from(publicKey, 'base64'),
    {
      name: 'X25519',
      namedCurve: 'X25519',
    },
    false,
    []
  );

  const sharedBits = await subtle.deriveBits(
    {
      name: 'X25519',
      public: importedPublicKey,
    },
    importedPrivateKey,
    256
  );

  return Buffer.from(sharedBits).toString('base64');
}