import { argon2id } from 'hash-wasm';
import { CompactEncrypt, compactDecrypt } from 'jose';

export async function createHighEntropyHash(password: string, salt: string) {
  return argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 1, // try to find a balance between speed and security later
    memorySize: 512, // use 512KB memory
    hashLength: 32, // output size = 32 bytes
  });
}

export async function createMasterKey(masterPassword: string, email: string) {
  const salt = email.toLowerCase().trim();
  return createHighEntropyHash(masterPassword, salt);
}

export async function createAuthKey(masterKey: string, masterPassword: string) {
  return createHighEntropyHash(masterPassword, masterKey);
}

/**
 * Generates a 256-bit (32-byte) symmetric key using CSPRNG
 * @returns {Uint8Array} 32-byte cryptographically secure random key
 */
export function generateVaultKey(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Generates a 128-bit (16-byte) initialization vector using CSPRNG
 * @returns {Uint8Array} 16-byte cryptographically secure random IV
 */
function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Encrypts the symmetric key and IV using the master key with A256GCM
 * @param {Uint8Array} symmetricKey - The 256-bit symmetric key to encrypt
 * @param {string} masterKey - The master key used for encryption
 * @returns {Promise<string>} JWE compact serialization of encrypted data
 */
export async function encryptVaultKey(
  symmetricKey: Uint8Array,
  masterKey: string
): Promise<string> {
  const initializationVector = generateIV();

  // Combine symmetric key and IV into a single payload
  const combined = new Uint8Array(
    symmetricKey.length + initializationVector.length
  );
  combined.set(symmetricKey, 0);
  combined.set(initializationVector, symmetricKey.length);

  // Convert master key to a CryptoKey for encryption
  const encoder = new TextEncoder();
  const masterKeyBytes = encoder.encode(masterKey);

  // Use the first 32 bytes of the master key for A256GCM (256 bits)
  const encryptionKeyBytes = masterKeyBytes.slice(0, 32);

  // Encrypt using CompactEncrypt with A256GCM
  const jwe = await new CompactEncrypt(combined)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(encryptionKeyBytes);

  return jwe;
}

/**
 * Decrypts the vault keys (symmetric key and IV) using the master key
 * @param {string} jwe - The encrypted JWE string
 * @param {string} masterKey - The master key used for decryption
 * @returns {Promise<{symmetricKey: Uint8Array, initializationVector: Uint8Array}>}
 */
export async function decryptVaultKey(
  jwe: string,
  masterKey: string
): Promise<{ symmetricKey: Uint8Array; initializationVector: Uint8Array }> {
  const encoder = new TextEncoder();
  const masterKeyBytes = encoder.encode(masterKey);

  // Use the first 32 bytes of the master key for A256GCM (256 bits)
  const encryptionKeyBytes = masterKeyBytes.slice(0, 32);

  // Decrypt
  const { plaintext } = await compactDecrypt(jwe, encryptionKeyBytes);

  // Split back into symmetric key (first 32 bytes) and IV (last 16 bytes)
  const decrypted = new Uint8Array(plaintext);
  const symmetricKey = decrypted.slice(0, 32);
  const initializationVector = decrypted.slice(32, 48);

  return { symmetricKey, initializationVector };
}

/**
 * Converts a comma-separated string of numbers to Uint8Array
 * @param {string} str - String like '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
 * @returns {Uint8Array} The resulting byte array
 */
export function stringToUint8Array(str: string): Uint8Array {
  const numbers = str.split(',').map((num) => +num.trim());
  return new Uint8Array(numbers);
}
