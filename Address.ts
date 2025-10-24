import bs58 from 'bs58'
import TronWeb from 'tronweb/utils'

const Hex20Regex = /^[0-9a-fA-F]{40}$/
const Hex32Regex = /^[0-9a-fA-F]{64}$/

type Outputs = 'base58' | 'hex20' | 'hex32' | 'tron'

export class Address {
  private buffer: Buffer

  private constructor(buffer: Buffer) {
    if (buffer.length !== 32) {
      throw new Error('Internal Address representation must be 32 bytes.')
    }
    this.buffer = buffer
  }

  /**
   * Creates an Address instance from a 20-byte hexadecimal string.
   * The hex20 input is padded on the left with zeros to form a 32-byte value.
   */
  static fromHex20(input: string): Address {
    if (!Address.isValidHex20(input)) {
      throw new Error(`Invalid hex20 address: ${input}`)
    }
    const cleaned = input.startsWith('0x') ? input.slice(2) : input
    const hex20Buffer = Buffer.from(cleaned, 'hex')
    const padding = Buffer.alloc(12, 0)
    const fullBuffer = Buffer.concat([padding, hex20Buffer])
    return new Address(fullBuffer)
  }

  /**
   * Creates an Address instance from a 32-byte hexadecimal string.
   */
  static fromHex32(input: string): Address {
    if (!Address.isValidHex32(input)) {
      throw new Error(`Invalid hex32 address: ${input}`)
    }
    const cleaned = input.startsWith('0x') ? input.slice(2) : input
    const buffer = Buffer.from(cleaned, 'hex')
    return new Address(buffer)
  }

  /**
   * Creates an Address instance from a base58-encoded string
   * that decodes to exactly 32 bytes.
   */
  static fromBase58(input: string): Address {
    if (!Address.isValidBase58(input)) {
      throw new Error(`Invalid base58 address: ${input}`)
    }
    const decoded = bs58.decode(input)
    const buffer = Buffer.from(decoded)
    if (buffer.length !== 32) {
      throw new Error(
        `Decoded base58 address must be 32 bytes, got ${buffer.length}`
      )
    }
    return new Address(buffer)
  }

  /**
   * Creates an Address instance from a Tron address string (Base58Check encoded).
   */
  static fromTronAddress(input: string): Address {
    const hex = TronWeb.address.toHex(input)
    const hex20Buffer = Buffer.from(hex.slice(2), 'hex')
    const padding = Buffer.alloc(12, 0)
    const fullBuffer = Buffer.concat([padding, hex20Buffer])
    return new Address(fullBuffer)
  }

  static type(input: string): Outputs | null {
    if (Address.isValidTronAddress(input)) {
      return 'tron'
    }

    if (Address.isValidBase58(input)) {
      return 'base58'
    }

    if (Address.isValidHex32(input)) {
      return 'hex32'
    }

    if (Address.isValidHex20(input)) {
      return 'hex20'
    }

    return null
  }

  /**
   * Attempts to create an Address instance by detecting the input format.
   * Supports hex20, hex32, and base58 formats.
   * @param input The address string in any supported format.
   * @returns An Address instance.
   * @throws If the input string does not match any valid supported format.
   */
  static any(input: string): Address {
    const inputType = Address.type(input)

    switch (inputType) {
      case 'base58':
        return Address.fromBase58(input)
      case 'hex32':
        return Address.fromHex32(input)
      case 'hex20':
        return Address.fromHex20(input)
      case 'tron':
        return Address.fromTronAddress(input)
      default:
        throw new Error(
          'Invalid address format. Input must be a valid hex20, hex32, or base58 string.'
        )
    }
  }

  /**
   * Returns the address as a hex32 string (32-byte hex representation with "0x" prefix).
   */
  toHex32(): string {
    return `0x${this.buffer.toString('hex')}`
  }

  /**
   * Returns the address as a hex20 string (lower 20 bytes of the internal 32-byte representation).
   * Assumes the relevant 20 bytes are the last 20 bytes if padding was applied (e.g., fromHex20).
   * Includes "0x" prefix.
   */
  toHex20(): string {
    return `0x${this.buffer.subarray(12).toString('hex')}`
  }

  /**
   * Returns the address as a bs58-encoded string.
   */
  toBase58(): string {
    return bs58.encode(this.buffer)
  }

  /**
   * Returns the address as a Tron address string (Base58Check encoded).
   */
  toTronAddress(): string {
    const hex20 = this.buffer.subarray(12)
    const hexWithPrefix = `41${hex20.toString('hex')}`
    return TronWeb.address.fromHex(hexWithPrefix)
  }

  /**
   * Validates a hex20 address (should be exactly 40 hex characters, ignoring "0x" prefix).
   */
  static isValidHex20(input: string): boolean {
    const cleaned = input.startsWith('0x') ? input.slice(2) : input
    return Hex20Regex.test(cleaned)
  }

  /**
   * Validates a hex32 address (should be exactly 64 hex characters, ignoring "0x" prefix).
   */
  static isValidHex32(input: string): boolean {
    const cleaned = input.startsWith('0x') ? input.slice(2) : input
    return Hex32Regex.test(cleaned)
  }

  /**
   * Validates a bs58 address (base58-decoded value must be 32 bytes).
   */
  static isValidBase58(input: string): boolean {
    if (!input) return false
    try {
      const decoded = bs58.decode(input)
      return decoded.length === 32
    } catch {
      return false
    }
  }

  /**
   * Validates a Tron address.
   */
  static isValidTronAddress(input: string): boolean {
    return TronWeb.address.isAddress(input)
  }

  // Add equals method for easier comparison in tests and usage
  equals(other: Address): boolean {
    return this.buffer.equals(other.buffer)
  }
}
